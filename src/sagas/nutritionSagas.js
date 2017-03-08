import {
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  CLEAR_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  LAZY_FETCH_FIREBASE,
  LAZY_LOAD_FIREBASE,
  SELECTED_TAGS,
  NM_ADD_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  NM_REM_INGREDIENT,
  IM_SET_DROPDOWN_MATCH_VALUE,
  IM_SET_DROPDOWN_UNITS,
  COMPLETE_DROPDOWN_CHANGE,
  UNUSED_TAGS,
  NM_SET_SERVINGS,
  INIT_SUPER_SEARCH,
  SUPER_SEARCH_RESULTS,
  ADD_SEARCH_SELECTION
} from '../constants/ActionTypes'

import ReactGA from 'react-ga'
import {callElasticSearchLambda} from './elasticSagas'
import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import * as db from './firebaseCommands'
import request from 'request'
const firebase = require('firebase')
const Config = require('Config')
const S3 = require('aws-sdk').S3
import {IngredientModel} from '../components/models/IngredientModel'
import {IngredientControlModel} from '../components/models/IngredientControlModel'
import {mapToSupportedUnits,
        mapToSupportedUnitsStrict,
        rationalToFloat,
        getPossibleUnits} from '../helpers/ConversionUtils'
import * as tupleHelper from '../helpers/TupleHelpers'

function* loadSerializedData() {
  const {composite, full, key} = yield select(state => state.nutritionReducer)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  firebase.database().ref('/global/nutritionLabel/'+user+'/'+key).update({
    composite,
    full
  })
}

function* completeMatchDropdownChange() {
  while (true) {
    const {tag, value} = yield take(COMPLETE_DROPDOWN_CHANGE)
    const {nutritionModel, ingredientControlModels, matchData} = yield select(state => state.modelReducer)
    // 1. Save the current ingredient key for deletion at the end of this
    //    process:
    const ingredientControlModel = ingredientControlModels[tag]
    let ingredientKeyToDelete = ingredientControlModel.getDropdownMatchValue()
    let ingredientModelToDelete = nutritionModel.getIngredientModel(tag)
    // 2. Create a new IngredientModel:
    let tTag = matchData[tag]
    let dataForKey = tupleHelper.getDataForDescription(tTag, value)
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(value, tag, dataForKey)
    // 3. Update the match value state for the dropdown:
    yield put ({type: IM_SET_DROPDOWN_MATCH_VALUE, tag, value})
    // 4. Update the dropdown units and unit value:
    //
    //    a. Get the list of new measurement units that are possible:
    let newMeasureUnit = mapToSupportedUnits(ingredientModel.getMeasureUnit())
    let newUnits = getPossibleUnits(newMeasureUnit)
    yield put ({type: IM_SET_DROPDOWN_UNITS, tag, units: newUnits})
    //    b. See if the current unit is within the new possibilies, if not
    //       then set to the FDA measure defaults
    //    (TODO: or perhaps fallback to the recipe amount/unit if they worked)
    const currentValue = ingredientControlModel.getSliderValue()
    const currentUnit = ingredientControlModel.getDropdownUnitValue()
    let newUnit = currentUnit
    if (! newUnits.includes(currentUnit)) {
      newUnit = newMeasureUnit
      yield put ({type: IM_SET_DROPDOWN_UNITS, tag, units: newUnit})
    }
    // 5. Remove the current IngredientModel from the NutritionModel:
    yield put ({type: NM_REM_INGREDIENT, tag})
    // 6. Add the new IngredientModel to the NutritionModel:
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User added dropdown ingredient',
      nonInteraction: false,
      label: tag
    });
    yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: currentValue, unit: newUnit, append: true})
  }
}

function* changesFromAppend(tag) {
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2
  const {matchData} = yield select(state => state.modelReducer)
  const tagMatches = matchData[tag]
  if (tagMatches.length === 0) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'No ellipses results returned',
      nonInteraction: false,
      label: tag
    });
    return
  }
  const description = tagMatches[0][descriptionOffset]
  const dataForKey = tagMatches[0][dataObjOffset]
  let ingredientModel = new IngredientModel()
  ingredientModel.initializeSingle(description, tag, dataForKey)
  const measureQuantity = ingredientModel.getMeasureQuantity()
  const measureUnit = ingredientModel.getMeasureUnit()
  yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: measureQuantity, unit: measureUnit, append: true})
  let ingredientControlModel =
    new IngredientControlModel(
          measureQuantity,
          getPossibleUnits(measureUnit),
          measureUnit,
          tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
          description)
  yield put ({type: IM_ADD_CONTROL_MODEL, tag, ingredientControlModel})
}

function* changesFromSearch() {
  const {matchData, searchIngredient} = yield select(state => state.modelReducer)
  let {selectedTags, unmatchedTags} = yield select(state => state.modelReducer)
  // TODO: refactor and combine
  // Tuple offsets for firebase data in nutrition reducer:
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2
  // Check that the first dataObject is not undefined (modified from non-lazy
  // load where every match was checked)
  const firstMatch = 0
  const tag = searchIngredient
  const tagMatches = matchData[tag]
  if (tagMatches.length === 0) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'No search results returned',
      nonInteraction: false,
      label: searchIngredient
    });
    if (unmatchedTags.indexOf(tag) === -1) {
      unmatchedTags.push(tag)
      yield put ({type: UNUSED_TAGS, tags: unmatchedTags})
    }
    yield put ({type: SUPER_SEARCH_RESULTS, matches: [], ingredient: searchIngredient})
    return
  }
  else {
    yield put ({type: SUPER_SEARCH_RESULTS, matches: tagMatches, ingredient: searchIngredient})
  }
}

function* getDataForSearchSelection() {
  const {match} = yield take(ADD_SEARCH_SELECTION)
  let {selectedTags} = yield select(state => state.modelReducer)
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2
  const {searchIngredient} = yield select(state => state.modelReducer)
  const description = match[descriptionOffset]
  let dataForKey = match[dataObjOffset]
  if (!dataForKey) {
    const path = 'global/nutritionInfo/' + match[keyOffset]
    const flag = (yield call(db.getPath, path)).exists()
    if (flag) {
      dataForKey = (yield call(db.getPath, path)).val()
    }
    else
      return
  }
  let ingredientModel = new IngredientModel()
  ingredientModel.initializeSingle(description, searchIngredient, dataForKey)
  let measureQuantity = ingredientModel.getMeasureQuantity()
  let measureUnit = ingredientModel.getMeasureUnit()
  let tryQuantity = measureQuantity
  let tryUnit = measureUnit
  let errorStr = ''
  try {
    yield put ({type: NM_ADD_INGREDIENT, tag: searchIngredient, ingredientModel, quantity: tryQuantity, unit: tryUnit, append: false})
  }
  catch(err) {
    errorStr = err
  }
  finally {
    // We failed to add the ingredient with the specified quantity/unit, so try
    // using the FDA values (not try/catch--if this fails we have a serious internal
    // error--i.e. this should always work.)
    if (errorStr !== '') {
      tryQuantity = measureQuantity
      tryUnit = measureUnit
      yield put ({type: NM_ADD_INGREDIENT, tag: searchIngredient, ingredientModel, quantity: tryQuantity, unit: tryUnit, append: false})
    }
  }
  ReactGA.event({
    category: 'Nutrition Mixer',
    action: 'Search results added to label',
    nonInteraction: false,
    label: searchIngredient
  });
  let matches = []
  matches.push
  let ingredientControlModel = new IngredientControlModel(
    tryQuantity,
    getPossibleUnits(tryUnit),
    tryUnit,
    tupleHelper.getListOfTupleOffset(matches, descriptionOffset),
    description)
  yield put ({type: IM_ADD_CONTROL_MODEL, tag: searchIngredient, ingredientControlModel})
  const {servingsControlModel} = yield select(state => state.servingsControlsReducer)
  yield put ({type: NM_SET_SERVINGS, servingsControlModel})
  selectedTags.push(searchIngredient)
  yield put ({type: SELECTED_TAGS, tags: selectedTags})
}

function* changesFromRecipe() {
  const {parsedData} = yield select(state => state.nutritionReducer)
  const {matchData} = yield select(state => state.modelReducer)
  if (Object.keys(matchData).length === Object.keys(parsedData).length) {
    const {missingData} = yield select(state => state.nutritionReducer)
    // TODO: refactor and combine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2
    // Check that the first dataObject is not undefined (modified from non-lazy
    // load where every match was checked)
    const firstMatch = 0
    for (let tag in matchData) {
      if (matchData[tag].length === 0) {
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Missing data for ingredient',
          nonInteraction: false,
          label: tag
        });
        continue
      }
      if (matchData[tag][firstMatch][dataObjOffset] === undefined) {
        return
      }
    }
    let selectedTags = []
    for (let tag in matchData) {
      const tagMatches = matchData[tag]
      // We use the first value in the list (assumes elastic search returns results
      // in closest match order)
      //const key = tagMatches[0][keyOffset]
      if (tagMatches.length === 0) {
        if (missingData.indexOf(tag) === -1) {
          missingData.push(tag)
          ReactGA.event({
            category: 'Nutrition Mixer',
            action: 'Missing data for ingredient',
            nonInteraction: false,
            label: tag
          });
        }
        continue
      }
      const description = tagMatches[0][descriptionOffset]
      const dataForKey = tagMatches[0][dataObjOffset]
      let ingredientModel = new IngredientModel()
      ingredientModel.initializeSingle(description, tag, dataForKey)
      let measureQuantity = ingredientModel.getMeasureQuantity()
      let measureUnit = ingredientModel.getMeasureUnit()
      let tryQuantity = measureQuantity
      let tryUnit = measureUnit
      let parseQuantity = undefined
      let parseUnit = undefined
      for (let i = 0; i < parsedData.length; i++) {
        const parseObj = parsedData[i]
        const foodName = parseObj['name']
        if (foodName === tag) {
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
          break
        }
      }
      let addIngredientErrorStr = ''
      try {
        yield put.resolve({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: tryQuantity, unit: tryUnit, append: false})
      } catch(err) {
        addIngredientErrorStr = err
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Error adding ingredient',
          nonInteraction: false,
          label: tag
        });
      } finally {
        // We failed to add the ingredient with the specified quantity/unit, so try
        // using the FDA values (not try/catch--if this fails we have a serious internal
        // error--i.e. this should always work.)
        if (addIngredientErrorStr !== '') {
          tryQuantity = measureQuantity
          tryUnit = measureUnit
          try {
            yield put.resolve({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: tryQuantity, unit: tryUnit, append: false})
          } catch(err2) {
            addIngredientErrorStr += '\n' + err2
            console.log('Second attempt to add ingrdient to model failed: ' + addIngredientErrorStr);
          }
        }
      }
      if (addIngredientErrorStr === '') {
        let ingredientControlModel = new IngredientControlModel(
          tryQuantity,
          getPossibleUnits(tryUnit),
          tryUnit,
          tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
          description)
        yield put ({type: IM_ADD_CONTROL_MODEL, tag, ingredientControlModel})
        selectedTags.push(tag)
      }
    }
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User recipe parsed',
      nonInteraction: false,
    });
    const {servingsControlModel} = yield select(state => state.servingsControlsReducer)
    yield put ({type: NM_SET_SERVINGS, servingsControlModel})
    yield put ({type: SELECTED_TAGS, tags: selectedTags})
    yield put ({type: UNUSED_TAGS, tags: missingData})
  }
}

export function* getDataFromFireBase(foodName, ingredient, key, index, userSearch, append) {
  const path = 'global/nutritionInfo/' + key
  const flag = (yield call(db.getPath, path)).exists()
  if (flag) {
    const data = (yield call(db.getPath, path)).val()
    if (index) {
      yield put ({type: LAZY_LOAD_FIREBASE, foodName, ingredient, index, data})
      yield put ({type: COMPLETE_DROPDOWN_CHANGE, tag: ingredient, value: foodName})
    }
    else {
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data, userSearch, append})
      if (append)
        yield call (changesFromAppend, foodName)
      else if (userSearch)
        yield call (changesFromSearch)
    }
  }
  else {
    if (userSearch) {
      yield put ({type: SUPER_SEARCH_RESULTS, matches: [], ingredient: searchIngredient})
    }
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data: [], userSearch, append})
  }
}

function* lazyFetchFirebaseData() {
  while (true) {
    const {foodName, ingredient, key, index} = yield take(LAZY_FETCH_FIREBASE)
    yield fork(getDataFromFireBase, foodName, ingredient, key, index)
  }
}

function* processParseForLabel() {
  // Get the parse data out of the nutrition reducer and call elastic search on
  // it to build the following structure:
  //   [
  //     'Green Onion' : ['dbKey1', 'dbKey2' ...],
  //     'red bean' : ['dbKey1', ...],
  //     'yakisoba' : []
  //   ]
  const {parsedData} = yield select(state => state.nutritionReducer)
  for (let i = 0; i < parsedData.length; i++) {
    const parseObj = parsedData[i]
    const foodName = parseObj['name']
    yield put({type: CLEAR_FIREBASE_DATA})
    const userSearch = false
    const append = false
    const fallback = true
    const size = 5
    const tokenize = true
    const parse = true
    yield fork(callElasticSearchLambda, foodName, foodName, size, userSearch, append, fallback, tokenize, parse)
  }
}

export default function* root() {
  yield fork(lazyFetchFirebaseData)
  yield fork(completeMatchDropdownChange)
  yield fork(takeLatest, INIT_SUPER_SEARCH, getDataForSearchSelection)
  yield fork(takeLatest, INGREDIENT_FIREBASE_DATA, changesFromRecipe)
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadSerializedData)
  yield fork(takeLatest, STORE_PARSED_DATA, processParseForLabel)
}
