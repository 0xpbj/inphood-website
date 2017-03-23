import {
  LAZY_FETCH_FIREBASE,
  LAZY_LOAD_FIREBASE,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  IM_UPDATE_MODEL,
  COMPLETE_DROPDOWN_CHANGE,
} from '../constants/ActionTypes'

import ReactGA from 'react-ga'
import { call, fork, put, select, take, takeLatest, race } from 'redux-saga/effects'
import * as db from './firebaseCommands'
import {IngredientModel} from '../components/models/IngredientModel'
import {mapToSupportedUnits,
        getPossibleUnits} from '../helpers/ConversionUtils'

function* completeMatchDropdownChange() {
  while (true) {
    const {tag, value} = yield take(COMPLETE_DROPDOWN_CHANGE)
    const {nutritionModel} = yield select(state => state.nutritionModelReducer)
    const {matchResultsModel} = yield select(state => state.tagModelReducer)
    const {ingredientControlModels} = yield select(state => state.ingredientControlModelReducer)
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
      throw new Error("Unable to get searchResult in completeMatchDropdownChange")
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
    yield put.resolve({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: currentValue, unit: newUnit})
  }
}

function* lazyFetchFirebaseData() {
  while (true) {
    const {foodName, ingredient, key, index} = yield take(LAZY_FETCH_FIREBASE)
    const data = (yield call(db.getPath, 'global/nutritionInfo/' + key)).val()
    yield put ({type: LAZY_LOAD_FIREBASE, foodName, ingredient, index, data})
    yield put ({type: COMPLETE_DROPDOWN_CHANGE, tag: ingredient, value: foodName})
  }
}

export default function* root() {
  yield fork(lazyFetchFirebaseData)
  yield fork(completeMatchDropdownChange)
}
