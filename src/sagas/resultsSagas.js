import {
  CLEAR_DATA,
  RESULT_KEY,
  LABEL_DATA,
  GET_LABEL_ID,
  STORE_PARSED_DATA,
  INIT_SERIALIZED_DATA,
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import * as db from './firebaseCommands'
const Config = require('Config')
const firebase = require('firebase')

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
}

const getRecipeText = (aNutritionModel) => {
  let recipeText = ''
  const nmTags = aNutritionModel.getTags()
  for (let index in nmTags) {
    const tag = nmTags[index]
    const scaledIngredient = aNutritionModel.getScaledIngredient(tag)
    recipeText = recipeText +
                 scaledIngredient.getQuantity().toFixed(2) + " " +
                 scaledIngredient.getUnit() + " " +
                 scaledIngredient.getIngredientModel().getKey() +
                 "\n"
  }
  return recipeText
}

function* loadFirebaseData() {
  const {parsedData, rawData, key} = yield select(state => state.nutritionReducer)
  const {nutritionModel} = yield select(state => state.nutritionModelReducer)
  const user = Config.DEBUG ? 'test' : 'anonymous'
  const full = nutritionModel.serialize()
  const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
  const composite = compositeModel.serialize()
  const userGeneratedData = getRecipeText(nutritionModel)
  firebase.database().ref('/global/nutritionLabel/' + user + '/' + key).update({
    full,
    user,
    rawData,
    parsedData,
    composite,
    userGeneratedData
  })
}

function* getLabelData() {
  while (true) {
    const {userId, labelId} = yield take (GET_LABEL_ID)
    const path = '/global/nutritionLabel/' + userId + '/' + labelId
    const data = (yield call(db.getPath, path)).val()
    yield put({type: LABEL_DATA, data})
  }
}

function* initFirebaseKeys() {
  yield take (STORE_PARSED_DATA)
  yield call (firebaseLogin)
  const user = Config.DEBUG ? 'test' : 'anonymous'
  const key = firebase.database().ref('/global/nutritionLabel/' + user).push().key
  yield put ({type: RESULT_KEY, key})
}

export default function* root() {
  yield fork(getLabelData)
  yield fork(takeLatest, CLEAR_DATA, initFirebaseKeys)
  yield fork(takeLatest, INIT_SERIALIZED_DATA, loadFirebaseData)
}
