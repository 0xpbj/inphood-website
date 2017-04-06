import {
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  IM_UPDATE_MODEL,
  IM_ADD_CONTROL_MODEL,
  UNUSED_TAGS,
  NM_SET_SERVINGS,
  SUPER_SEARCH_RESULTS,
  ADD_SEARCH_SELECTION,
  FDA_SEARCH_RESULTS_FLAG,
  CLOSE_SEARCH_MODAL,
  PARSE_SEARCH_DATA,
  SET_PARSED_DATA,
  INITIALIZE_RECIPE_FLOW,
  INITIALIZE_SEARCH_FLOW,
  SEARCH_TIMED_OUT,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  SERIALIZE_TO_FIREBASE
} from '../constants/ActionTypes'

import ReactGA from 'react-ga'
import * as db from './firebaseCommands'
import { call, fork, put, select, take, takeEvery, takeLatest, race } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {IngredientModel} from '../components/models/IngredientModel'
import {IngredientControlModel} from '../components/models/IngredientControlModel'
import {MatchResultsModel} from '../components/models/MatchResultsModel'
import {mapToSupportedUnitsStrict,
        rationalToFloat,
        getPossibleUnits} from '../helpers/ConversionUtils'
const Config = require('Config')

const matchResultsReady = (matchResultsModel) => {
  for (let searchTerm in matchResultsModel.getSearches()) {
    if (matchResultsModel.getSearchResultsLength(searchTerm) === 0) {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Missing data for ingredient',
        nonInteraction: false,
        label: searchTerm
      });
      continue
    }
    const searchResult = matchResultsModel.getSearchResultByIndex(searchTerm)
    if ((searchResult.getStandardRefDataObj() === undefined) &&
        (searchResult.getBrandedDataObj() === undefined)) {
      return false
    }
  }
  return true
}

const getParseQuantity = (parseObj) => {
  let parseQuantity = undefined

  // Sometimes the parseObj returns things like 'toTaste=true' and no
  // amount or unit fields. TODO: we should probably exclude those tags/
  // ingredients from the label in MVP3 or put them in their own bucket.
  if ('amount' in parseObj) {
    if ((parseObj['amount'].hasOwnProperty('min')) &&
         parseObj['amount'].hasOwnProperty('max')) {
      const parseMinQuantity = rationalToFloat(parseObj['amount'].min)
      const parseMaxQuantity = rationalToFloat(parseObj['amount'].max)
      parseQuantity = (parseMinQuantity + parseMaxQuantity) / 2.0
    } else {
      parseQuantity = rationalToFloat(parseObj['amount'])
    }
  }

  return parseQuantity
}

// //TODO: make this work gracefully
// function* changesFromSearchController() {
//   // console.log('changesFromSearchController--------------------------------------------');
//   const {response, timeout} = yield race({
//     response: call (changesFromSearch),
//     timeout: call(delay, 1000),
//     // cancel: take()
//   })
//   if (timeout) {
//     put({type: SEARCH_TIMED_OUT})
//   }
// }
function* changesFromRecipe() {
  console.log('changesFromRecipe ---------------------------------------------');
  const {newData, missingData} = yield select(state => state.nutritionReducer)
  const {matchResultsModel} = yield select(state => state.tagModelReducer)

  const resultsReady = yield call (matchResultsReady, matchResultsModel)
  if (! resultsReady) {
    return
  }

  for (let parseObj of newData) {
    const searchTerm = parseObj['name']

    if (matchResultsModel.getSearchResultsLength(searchTerm) === 0) {
      if (missingData.indexOf(searchTerm) === -1) {
        missingData.push(searchTerm)
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Missing data for ingredient',
          nonInteraction: false,
          label: searchTerm
        });
      }
      continue
    }

    const searchResult = matchResultsModel.getSearchResultByIndex(searchTerm)
    const description = searchResult.getDescription()

    let ingredientModel = new IngredientModel()
    // Prefer the standard ref obj if it exists
    const stdRefObj = searchResult.getStandardRefDataObj()
    const brandedObj = searchResult.getBrandedDataObj()
    if (stdRefObj) {
      ingredientModel.initializeSingle(description, searchTerm, stdRefObj)
    } else if (brandedObj) {
      ingredientModel.initializeFromBrandedFdaObj(description, searchTerm, brandedObj)
    } // else big internal error (TODO: handle?)

    // First try to add the ingredient with the quantity and unit specified in the
    // recipe by the user:
    //
    // TODO: probably need to also check if parsed quantity is '  '
    let quantity = yield call(getParseQuantity, parseObj)
    let unit = ('unit' in parseObj) ?
      mapToSupportedUnitsStrict(parseObj['unit']) : undefined
    //
    const quantityOk = ((!isNaN(quantity)) && (quantity !== ''))
    const unitOk = ((unit !== undefined) && (unit !== ""))
    //
    let addIngredientErrorStr = ''
    if (quantityOk && unitOk) {
      try {
        yield put.resolve({type: NM_ADD_INGREDIENT,
                           tag: searchTerm,
                           ingredientModel,
                           quantity: quantity,
                           unit: unit,
                           append: false})
      } catch(err) {
        addIngredientErrorStr = err
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Error adding ingredient with parsed quantity and units',
          nonInteraction: false,
          label: searchTerm
        });
      }
    }

    // Second, if we failed to add the ingredient with the specified quantity/unit, try
    // using the FDA default values (this should always  work)
    //
    if (addIngredientErrorStr !== '') {
      const originalAddIngredientErrorStr = addIngredientErrorStr
      addIngredientErrorStr = ''
      quantity = ingredientModel.getMeasureQuantity()
      unit = ingredientModel.getMeasureUnit()
      try {
        yield put.resolve({type: NM_ADD_INGREDIENT,
                           tag: searchTerm,
                           ingredientModel,
                           quantity: quantity,
                           unit: unit,
                           append: false})
      } catch(err) {
        addIngredientErrorStr = err + '\n' + originalAddIngredientErrorStr
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Error adding ingredient with the USDA quantity and units',
          nonInteraction: false,
          label: searchTerm
        });
      }
    }

    // Finally if we were successful, add a new ingredient control model
    //
    if (addIngredientErrorStr === '') {
      let ingredientControlModel = new IngredientControlModel(
        quantity, getPossibleUnits(unit), unit,
        matchResultsModel.getSearchResultDescriptions(searchTerm),
        description)
      yield put ({type: IM_ADD_CONTROL_MODEL, tag: searchTerm, ingredientControlModel})
    } else {
      console.log('changesFromRecipe: unable to addIngredient');
    }
  }

  ReactGA.event({
    category: 'Nutrition Mixer',
    action: 'User recipe parsed',
    nonInteraction: false,
  });

  const {servingsControlModel} = yield select(state => state.servingsControlsReducer)
  yield put ({type: NM_SET_SERVINGS, servingsControlModel})
  yield put ({type: UNUSED_TAGS, tags: missingData})
  yield put ({type: SERIALIZE_TO_FIREBASE})
}

export default function* root() {
  yield fork(takeLatest, INITIALIZE_RECIPE_FLOW, changesFromRecipe)
  // yield fork(takeEvery, INITIALIZE_SEARCH_FLOW, changesFromSearch)
}
