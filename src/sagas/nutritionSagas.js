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
  NM_REM_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  IM_UPDATE_MODEL,
  COMPLETE_DROPDOWN_CHANGE,
  UNUSED_TAGS,
  NM_SET_SERVINGS,
  INIT_SUPER_SEARCH,
  SUPER_SEARCH_RESULTS,
  ADD_SEARCH_SELECTION,
  CLOSE_SEARCH_MODAL
} from '../constants/ActionTypes'

import ReactGA from 'react-ga'
import {callElasticSearchLambda} from './elasticSagas'
import { call, fork, put, select, take, takeLatest, race } from 'redux-saga/effects'
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
    const {nutritionModel} = yield select(state => state.nutritionModelReducer)
    const {matchResultsModel} = yield select(state => state.tagModelReducer)
    const {ingredientControlModels} = yield select(state => state.ingredientModelReducer)
    // 1. Save the current ingredient key for deletion at the end of this
    //    process:
    let ingredientControlModel = ingredientControlModels[tag]
    let ingredientKeyToDelete = ingredientControlModel.getDropdownMatchValue()
    let ingredientModelToDelete = nutritionModel.getIngredientModel(tag)
    //
    // 2. Create a new IngredientModel:
    const searchTerm = tag
    const description = value
    const searchResult =
      matchResultsModel.getSearchResultByDesc(searchTerm, description)
    if (searchResult === undefined) {
      throw "Unable to get searchResult in completeMatchDropdownChange"
    }
    // TODO: expand this to handle searchResult.getBrandedDataObj() to support FDA
    //       data objects
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(description,
                                     searchTerm,
                                     searchResult.getStandardRefDataObj())

    // 3. Update the match value state for the dropdown:
    ingredientControlModel.setDropdownMatchValue(value)
    // 4. Update the dropdown units and unit value:
    //
    //    a. Get the list of new measurement units that are possible:
    let newMeasureUnit = mapToSupportedUnits(ingredientModel.getMeasureUnit())
    let newUnits = getPossibleUnits(newMeasureUnit)
    ingredientControlModel.setDropdownUnits(newUnits)
    //    b. See if the current unit is within the new possibilies, if not
    //       then set to the FDA measure defaults
    //    (TODO: or perhaps fallback to the recipe amount/unit if they worked)
    const currentValue = ingredientControlModel.getSliderValue()
    const currentUnit = ingredientControlModel.getDropdownUnitValue()
    let newUnit = currentUnit
    if (! newUnits.includes(currentUnit)) {
      // console.log('Incompatible unit found in completeMatchDropdownChange:');
      // console.log('-----------------------------------------------------------');
      // console.log('   setting dropdown unit value to ' + newMeasureUnit);
      newUnit = newMeasureUnit
      ingredientControlModel.setDropdownUnitValue(newUnit)
    }
    // ?. Update the ingredient model from all the changes we've made above
    //    (replaces all the individual previous calls)
    yield put.resolve({type: IM_UPDATE_MODEL, tag, ingredientControlModel})
    // 5. Remove the current IngredientModel from the NutritionModel:
    yield put.resolve({type: NM_REM_INGREDIENT, tag})
    // 6. Add the new IngredientModel to the NutritionModel:
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User added dropdown ingredient',
      nonInteraction: false,
      label: tag
    });
    yield put.resolve({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: currentValue, unit: newUnit, append: true})
  }
}

function* changesFromAppend(tag) {
  const {matchResultsModel} = yield select(state => state.tagModelReducer)
  const searchTerm = tag
  if (matchResultsModel.getSearchResultsLength(searchTerm) === 0) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'No ellipses results returned',
      nonInteraction: false,
      label: tag
    });
    return
  }

  const searchResult = matchResultsModel.getSearchResultByIndex(searchTerm)
  const description = searchResult.getDescription()
  // TODO: expand this to handle getBrandedDataObj() for FDA Branded results
  let ingredientModel = new IngredientModel()
  ingredientModel.initializeSingle(description,
                                   searchTerm,
                                   searchResult.getStandardRefDataObj())

  const measureQuantity = ingredientModel.getMeasureQuantity()
  const measureUnit = ingredientModel.getMeasureUnit()
  yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: measureQuantity, unit: measureUnit, append: true})
  let ingredientControlModel =
    new IngredientControlModel(
          measureQuantity,
          getPossibleUnits(measureUnit),
          measureUnit,
          matchResultsModel.getSearchResultDescriptions(searchTerm),
          description)
  yield put ({type: IM_ADD_CONTROL_MODEL, tag, ingredientControlModel})
}

function* changesFromSearch() {
  const {matchResultsModel, searchIngredient} = yield select(state => state.tagModelReducer)
  let {selectedTags, unmatchedTags, searchResult} = yield select(state => state.tagModelReducer)

  const searchTerm = searchIngredient
  if (matchResultsModel.getSearchResultsLength(searchTerm) === 0) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'No search results returned',
      nonInteraction: false,
      label: searchIngredient
    });
    if (unmatchedTags.indexOf(searchTerm) === -1) {
      unmatchedTags.push(searchTerm)
      yield put ({type: UNUSED_TAGS, tags: unmatchedTags})
    }
    yield put ({type: SUPER_SEARCH_RESULTS,
                matchResultsModel: new MatchResultsModel(),
                ingredient: searchTerm})
    return
  } else {
    yield put ({type: SUPER_SEARCH_RESULTS,
                matchResultsModel: matchResultsModel,
                ingredient: searchTerm})
    yield race({
      response: call (getDataForSearchSelection, searchTerm, selectedTags),
      cancel: take(CLOSE_SEARCH_MODAL)
    })
  }
}

function* getDataForSearchSelection(searchIngredient, selectedTags) {
  console.log('getDataForSearchSelection -------------------------------------');
  console.log('   searchResult:');
  console.log(searchResult)
  const {searchResult} = yield take(ADD_SEARCH_SELECTION)
  const description = searchResult.getDescription()
  // TODO: consider case with getBrandedDataObj
  let stdRefObj = searchResult.getStandardRefDataObj()
  if (stdRefObj === undefined) {
    const path = 'global/nutritionInfo/' + searchResult.getNdbNo()
    const flag = (yield call(db.getPath, path)).exists()
    if (flag) {
      stdRefObj = (yield call(db.getPath, path)).val()
    } else
      return
  }
  console.log('   we made it past the return!  searchIngredient, description:');
  console.log(searchIngredient);
  console.log(description);

  let ingredientModel = new IngredientModel()
  ingredientModel.initializeSingle(description, searchIngredient, stdRefObj)
  let measureQuantity = ingredientModel.getMeasureQuantity()
  let measureUnit = ingredientModel.getMeasureUnit()
  let tryQuantity = measureQuantity
  let tryUnit = measureUnit
  let errorStr = ''
  try {
    yield put ({type: NM_ADD_INGREDIENT,
                tag: searchIngredient,
                ingredientModel,
                quantity: tryQuantity,
                unit: tryUnit,
                append: false})
  }
  catch(err) {
    console.log('   error adding ingredient (1st try)' + searchIngredient);
    console.log(err);
    errorStr = err
  }
  finally {
    // We failed to add the ingredient with the specified quantity/unit, so try
    // using the FDA values (not try/catch--if this fails we have a serious internal
    // error--i.e. this should always work.)
    if (errorStr !== '') {
      console.log('   adding ingredient (2nd try)' + searchIngredient);
      tryQuantity = measureQuantity
      tryUnit = measureUnit
      yield put ({type: NM_ADD_INGREDIENT,
                  tag: searchIngredient,
                  ingredientModel,
                  quantity: tryQuantity,
                  unit: tryUnit,
                  append: false})
    }
  }
  ReactGA.event({
    category: 'Nutrition Mixer',
    action: 'Search results added to label',
    nonInteraction: false,
    label: searchIngredient
  });

  let ingredientControlModel = new IngredientControlModel(
    tryQuantity,
    getPossibleUnits(tryUnit),
    tryUnit,
    [description],
    description)
  yield put ({type: IM_ADD_CONTROL_MODEL, tag: searchIngredient, ingredientControlModel})
  const {servingsControlModel} = yield select(state => state.servingsControlsReducer)
  yield put ({type: NM_SET_SERVINGS, servingsControlModel})
  selectedTags.push(searchIngredient)
  yield put ({type: SELECTED_TAGS, tags: selectedTags})
}

// TODO: TODO: TODO:
//  Refactor / clean this up
//    - it's too long
//    - it was written for synchronous execution
//    - it's not pleasant to maintain
//    - it's unclear what it's trying to do
//
function* changesFromRecipe() {
  console.log('changesFromRecipe: --------------------------------------------');
  const {parsedData} = yield select(state => state.nutritionReducer)
  const {matchResultsModel} = yield select(state => state.tagModelReducer)
  if (matchResultsModel.getNumberOfSearches() === Object.keys(parsedData).length) {
    const {missingData} = yield select(state => state.nutritionReducer)

    // Check that the first dataObject is not undefined (modified from non-lazy
    // load where every match was checked):
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
      // TODO: may need to differentiate with getBrandedDataObj here
      const searchResult = matchResultsModel.getSearchResultByIndex(searchTerm)
      if (searchResult.getStandardRefDataObj() === undefined) {
        return
      }
    }

    let selectedTags = []

    for (let searchTerm in matchResultsModel.getSearches()) {
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
      // TODO: need to consider the case for getBrandedDataObj as well
      const stdRefObj = searchResult.getStandardRefDataObj()
      let ingredientModel = new IngredientModel()
      ingredientModel.initializeSingle(description, searchTerm, stdRefObj)

      let measureQuantity = ingredientModel.getMeasureQuantity()
      let measureUnit = ingredientModel.getMeasureUnit()
      let tryQuantity = measureQuantity
      let tryUnit = measureUnit
      let parseQuantity = undefined
      let parseUnit = undefined
      for (let i = 0; i < parsedData.length; i++) {
        const parseObj = parsedData[i]
        const foodName = parseObj['name']
        if (foodName === searchTerm) {
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

      // Delete the ingredient if it's already in the model because we're going to
      // add it again below.
      console.log('   Testing for ingredient in nutritionModel');
      const {nutritionModel} = yield select(state => state.nutritionModelReducer)
      const nmTags = nutritionModel.getTags()
      for (let nmI = 0; nmI < nmTags.length; nmI++) {
        console.log("  " + nmTags[nmI]);
      }
      if (nutritionModel.getIngredientModel(searchTerm) !== null) {
        console.log('   Deleting ingredient ' + searchTerm + ' from NutritionModel');
        yield put.resolve({type: NM_REM_INGREDIENT, tag: searchTerm})
      }

      let addIngredientErrorStr = ''
      try {
        console.log('changesFromRecipe: addIngredient call #1 ', searchTerm);
        yield put.resolve({type: NM_ADD_INGREDIENT,
                           tag: searchTerm,
                           ingredientModel,
                           quantity: tryQuantity,
                           unit: tryUnit,
                           append: false})
      } catch(err) {
        console.log('changesFromRecipe: addIngredient call #1 threw!');
        addIngredientErrorStr = err
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Error adding ingredient',
          nonInteraction: false,
          label: searchTerm
        });
      } finally {
        // We failed to add the ingredient with the specified quantity/unit, so try
        // using the FDA values (not try/catch--if this fails we have a serious internal
        // error--i.e. this should always work.)
        if (addIngredientErrorStr !== '') {
          const originalAddIngredientErrorStr = addIngredientErrorStr
          addIngredientErrorStr = ''
          tryQuantity = measureQuantity
          tryUnit = measureUnit
          try {
            console.log('changesFromRecipe: addIngredient call #2 ', searchTerm);
            yield put.resolve({type: NM_ADD_INGREDIENT,
                               tag: searchTerm,
                               ingredientModel,
                               quantity: tryQuantity,
                               unit: tryUnit,
                               append: false})
          } catch(err2) {
            console.log('changesFromRecipe: addIngredient call #2 threw!');
            addIngredientErrorStr = err2 + '\n' + originalAddIngredientErrorStr
            console.log('Second attempt to add ingrdient to model failed: ' + addIngredientErrorStr);
          }
        }
      }

      console.log('Adding ingredient control model ---------------------------');
      console.log('   addIngredientErrorStr: ', addIngredientErrorStr);
      console.log('   searchTerm: ', searchTerm);
      if (addIngredientErrorStr === '') {
        let ingredientControlModel = new IngredientControlModel(
          tryQuantity,
          getPossibleUnits(tryUnit),
          tryUnit,
          matchResultsModel.getSearchResultDescriptions(searchTerm),
          description)
        console.log('   calling IM_ADD_CONTROL_MODEL', ingredientControlModel);
        yield put ({type: IM_ADD_CONTROL_MODEL, tag: searchTerm, ingredientControlModel})
        selectedTags.push(searchTerm)
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
      else
        yield call (changesFromRecipe)
    }
  }
  else {
    if (userSearch) {
      yield put ({type: SUPER_SEARCH_RESULTS,
                  matchResultsModel: new MatchResultsModel(),
                  ingredient: searchIngredient})
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
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadSerializedData)
  yield fork(takeLatest, STORE_PARSED_DATA, processParseForLabel)
}
