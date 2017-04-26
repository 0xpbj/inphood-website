import {
  CLEAR_DATA,
  RESULT_KEY,
  LABEL_DATA,
  GET_LABEL_ID,
  STORE_PARSED_DATA,
  SERIALIZE_TO_FIREBASE,
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import * as db from './firebaseCommands'
const Config = require('Config')
const firebase = require('firebase')
import Fingerprint2 from 'fingerprintjs2'

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
}

const getRecipeText = (aNutritionModel) => {
  let recipeText = ''
  const nmTags = aNutritionModel.getIds()
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
  if (key !== '') {
    const {nutritionModel} = yield select(state => state.nutritionModelReducer)
    const full = nutritionModel.serialize()
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
    const composite = compositeModel.serialize()
    const userGeneratedData = getRecipeText(nutritionModel)
    var fulldate = Date.now()
    var date = new Date(fulldate).toDateString()
    const debug = Config.DEBUG
    let path
    if (debug)
      path = '/global/nutritionLabel/debug/' + key
    else
      path = '/global/nutritionLabel/' + key
    if (path) {
      firebase.database().ref(path).update({
        full,
        rawData,
        parsedData,
        composite,
        userGeneratedData,
        date,
        fulldate,
        debug
      })
    }
  }
}

function* getLabelData() {
  while (true) {
    const {labelId} = yield take (GET_LABEL_ID)
    const path = '/global/nutritionLabel/' + labelId
    const data = (yield call(db.getPath, path)).val()
    yield put({type: LABEL_DATA, data})
  }
}

function* initFirebaseKeys() {
  yield take (STORE_PARSED_DATA)
  yield call (firebaseLogin)
  const key = firebase.database().ref('/global/nutritionLabel/').push().key
  const debug = Config.DEBUG
  if (!debug) {
    var fulldate = Date.now()
    var date = new Date(fulldate).toDateString()
    Fingerprint2().get(function(result) {
      firebase.database().ref('/global/nutritionLabel/' + key).update({
        fingerprint: result
      })
      firebase.database().ref('/global/nutritionLabel/fingerprint/' + result + '/' + key).update({
        date,
        fulldate
      })
      firebase.database().ref('/global/nutritionLabel/analytics/' + date + '/fingerprints/' + result + '/' + key).update({
        fulldate
      })
      firebase.database().ref('/global/nutritionLabel/analytics/' + date + '/keys/' + key).update({
        fulldate
      })
    })
  }
  yield put ({type: RESULT_KEY, key})
}

export default function* root() {
  yield fork(getLabelData)
  yield fork(takeLatest, CLEAR_DATA, initFirebaseKeys)
  yield fork(takeLatest, SERIALIZE_TO_FIREBASE, loadFirebaseData)
}
