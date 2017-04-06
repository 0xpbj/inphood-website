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

  for (let index in newData) {

    const parseObj = newData[index]
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
      // console.log('\n\n\nPBJERROR = SEARCH TERM HAS NO RESULTS: ', searchTerm);
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
    }
    else { // brandedObj
      ingredientModel.initializeFromBrandedFdaObj(description, searchTerm, brandedObj)
    }
    let measureQuantity = ingredientModel.getMeasureQuantity()
    let measureUnit = ingredientModel.getMeasureUnit()
    let tryQuantity = measureQuantity
    let tryUnit = measureUnit
    let parseQuantity = undefined
    let parseUnit = undefined


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
    if ('unit' in parseObj) {
      parseUnit = mapToSupportedUnitsStrict(parseObj['unit'])
    }
    if ((parseQuantity !== undefined) && (parseQuantity !== "") && (!isNaN(parseQuantity))) {
      //console.log(tag + ', setting measureQuantity to parseQuantity: ' + parseQuantity);
      tryQuantity = parseQuantity
    }
    if ((parseUnit !== undefined) && (parseUnit !== "")) {
      //console.log(tag + ', setting measureUnit to parseUnit: ' + parseUnit);
      tryUnit = parseUnit
    }

    // Delete the ingredient if it's already in the model because we're going to
    // add it again below.
    //console.log('   Testing for ingredient in nutritionModel');
    const {nutritionModel} = yield select(state => state.nutritionModelReducer)
    const nmTags = nutritionModel.getTags()
    for (let nmI = 0; nmI < nmTags.length; nmI++) {
      //console.log("  " + nmTags[nmI]);
    }
    // if (nutritionModel.getIngredientModel(searchTerm) !== null) {
      //console.log('   Deleting ingredient ' + searchTerm + ' from NutritionModel');
      // yield put.resolve({type: NM_REM_INGREDIENT, tag: searchTerm})
    // }
    let addIngredientErrorStr = ''
    try {
      //console.log('changesFromRecipe: addIngredient call #1 ', searchTerm);
      yield put.resolve({type: NM_ADD_INGREDIENT,
                         tag: searchTerm,
                         ingredientModel,
                         quantity: tryQuantity,
                         unit: tryUnit,
                         append: false})
    }
    catch(err) {
      //console.log('changesFromRecipe: addIngredient call #1 threw!');
      addIngredientErrorStr = err
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Error adding ingredient',
        nonInteraction: false,
        label: searchTerm
      });
    }
    finally {
      // We failed to add the ingredient with the specified quantity/unit, so try
      // using the FDA values (not try/catch--if this fails we have a serious internal
      // error--i.e. this should always work.)
      if (addIngredientErrorStr !== '') {
        const originalAddIngredientErrorStr = addIngredientErrorStr
        addIngredientErrorStr = ''
        tryQuantity = measureQuantity
        tryUnit = measureUnit
        try {
          //console.log('changesFromRecipe: addIngredient call #2 ', searchTerm);
          yield put.resolve({type: NM_ADD_INGREDIENT,
                             tag: searchTerm,
                             ingredientModel,
                             quantity: tryQuantity,
                             unit: tryUnit,
                             append: false})
        } catch(err2) {
          //console.log('changesFromRecipe: addIngredient call #2 threw!');
          addIngredientErrorStr = err2 + '\n' + originalAddIngredientErrorStr
          //console.log('Second attempt to add ingrdient to model failed: ' + addIngredientErrorStr);
        }
      }
    }
    // console.log('Adding ingredient control model ---------------------------');
    // console.log('   addIngredientErrorStr: ', addIngredientErrorStr);
    // console.log('   searchTerm: ', searchTerm);
    if (addIngredientErrorStr === '') {
      let ingredientControlModel = new IngredientControlModel(
        tryQuantity,
        getPossibleUnits(tryUnit),
        tryUnit,
        matchResultsModel.getSearchResultDescriptions(searchTerm),
        description)
      // console.log('   calling IM_ADD_CONTROL_MODEL', ingredientControlModel);
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
