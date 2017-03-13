import {
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  SELECTED_TAGS,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  UNUSED_TAGS,
  NM_SET_SERVINGS,
  SUPER_SEARCH_RESULTS,
  ADD_SEARCH_SELECTION,
  CLOSE_SEARCH_MODAL
} from '../constants/ActionTypes'

import ReactGA from 'react-ga'
import * as db from './firebaseCommands'
import { call, fork, put, select, take, takeLatest, race } from 'redux-saga/effects'
import {IngredientModel} from '../components/models/IngredientModel'
import {IngredientControlModel} from '../components/models/IngredientControlModel'
import {mapToSupportedUnitsStrict,
        rationalToFloat,
        getPossibleUnits} from '../helpers/ConversionUtils'

function* getDataForSearchSelection(searchIngredient, selectedTags) {
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
  //console.log('   we made it past the return!  searchIngredient, description:');
  //console.log(searchIngredient);
  //console.log(description);

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
    //console.log('   error adding ingredient (1st try)' + searchIngredient);
    //console.log(err);
    errorStr = err
  }
  finally {
    // We failed to add the ingredient with the specified quantity/unit, so try
    // using the FDA values (not try/catch--if this fails we have a serious internal
    // error--i.e. this should always work.)
    if (errorStr !== '') {
      //console.log('   adding ingredient (2nd try)' + searchIngredient);
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

export function* changesFromAppend(searchTerm, matchResultsModel) {
  if (matchResultsModel.getSearchResultsLength(searchTerm) === 0) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'No ellipses results returned',
      nonInteraction: false,
      label: searchTerm
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
  yield put ({type: NM_ADD_INGREDIENT, tag: searchTerm, ingredientModel, quantity: measureQuantity, unit: measureUnit, append: true})
  let ingredientControlModel =
    new IngredientControlModel(
          measureQuantity,
          getPossibleUnits(measureUnit),
          measureUnit,
          matchResultsModel.getSearchResultDescriptions(searchTerm),
          description)
  yield put ({type: IM_ADD_CONTROL_MODEL, tag: searchTerm, ingredientControlModel})
}

export function* changesFromSearch(selectedTags, matchResultsModel, searchIngredient, unmatchedTags) {
  if (matchResultsModel.getSearchResultsLength(searchIngredient) === 0) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'No search results returned',
      nonInteraction: false,
      label: searchIngredient
    });
    if (unmatchedTags.indexOf(searchIngredient) === -1) {
      unmatchedTags.push(searchIngredient)
      yield put ({type: UNUSED_TAGS, tags: unmatchedTags})
    }
    yield put ({type: SUPER_SEARCH_RESULTS,
                matchResultsModel: new MatchResultsModel(),
                ingredient: searchIngredient})
    return
  } else {
    yield put ({type: SUPER_SEARCH_RESULTS,
                matchResultsModel: matchResultsModel,
                ingredient: searchIngredient})
    yield race({
      response: call (getDataForSearchSelection, searchIngredient, selectedTags),
      cancel: take(CLOSE_SEARCH_MODAL)
    })
  }
}

// TODO: TODO: TODO:
//  Refactor / clean this up
//    - it's too long
//    - it was written for synchronous execution
//    - it's not pleasant to maintain
//    - it's unclear what it's trying to do
//
export function* changesFromRecipe(parsedData, missingData, matchResultsModel) {
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
    //console.log('   Testing for ingredient in nutritionModel');
    const {nutritionModel} = yield select(state => state.nutritionModelReducer)
    const nmTags = nutritionModel.getTags()
    for (let nmI = 0; nmI < nmTags.length; nmI++) {
      //console.log("  " + nmTags[nmI]);
    }
    if (nutritionModel.getIngredientModel(searchTerm) !== null) {
      //console.log('   Deleting ingredient ' + searchTerm + ' from NutritionModel');
      yield put.resolve({type: NM_REM_INGREDIENT, tag: searchTerm})
    }
    let addIngredientErrorStr = ''
    try {
      //console.log('changesFromRecipe: addIngredient call #1 ', searchTerm);
      yield put.resolve({type: NM_ADD_INGREDIENT,
                         tag: searchTerm,
                         ingredientModel,
                         quantity: tryQuantity,
                         unit: tryUnit,
                         append: false})
    } catch(err) {
      //console.log('changesFromRecipe: addIngredient call #1 threw!');
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
    //console.log('Adding ingredient control model ---------------------------');
    //console.log('   addIngredientErrorStr: ', addIngredientErrorStr);
    //console.log('   searchTerm: ', searchTerm);
    if (addIngredientErrorStr === '') {
      let ingredientControlModel = new IngredientControlModel(
        tryQuantity,
        getPossibleUnits(tryUnit),
        tryUnit,
        matchResultsModel.getSearchResultDescriptions(searchTerm),
        description)
      //console.log('   calling IM_ADD_CONTROL_MODEL', ingredientControlModel);
      yield put ({type: IM_ADD_CONTROL_MODEL, tag: searchTerm, ingredientControlModel})
      selectedTags.push(searchTerm)
    } else {
      //console.log('changesFromRecipe: unable to addIngredient');
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