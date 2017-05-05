import {
  CLEAR_DATA,
  RESULT_KEY,
  LABEL_DATA,
  LOGIN_SUCCESS,
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
    const {result} = yield select(state => state.loginReducer)
    let userName = 'anonymous'
    if (result && result !== 'anonymous') {
      userName = result.user.uid
    }
    let path
    if (debug)
      path = '/global/inphoodLabel/' + userName + '/debug/' + key
    else
      path = '/global/inphoodLabel/' + userName + '/' + key
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

function* moveFirebaseData() {
  const {key} = yield select(state => state.nutritionReducer)
  if (key !== '') {
    const debug = Config.DEBUG
    const {result} = yield select(state => state.loginReducer)
    let userName = 'anonymous'
    let path
    if (debug) {
      path = '/global/inphoodLabel/' + userName + '/debug/' + key
    }
    else {
      path = '/global/inphoodLabel/' + userName + '/' + key
    }
    if (path) {
      const flag = (yield call(db.getPath, path)).exists()
      if (flag) {
        const data = (yield call(db.getPath, path)).val()
        console.log(firebase.auth().currentUser.user)
        userName = result.user.uid
        const newKey = firebase.database().ref('/global/inphoodLabel/' + userName).push().key
        if (debug) {
          path = '/global/inphoodLabel/' + userName + '/debug/' + newKey
        }
        else {
          path = '/global/inphoodLabel/' + userName + '/' + newKey
        }
        firebase.database().ref(path).update({
          ...data
        })
        yield put ({type: RESULT_KEY, key: newKey})
      }
    }
  }
}

function* getLabelData() {
  while (true) {
    const {labelId} = yield take (GET_LABEL_ID)
    const path = '/global/inphoodLabel/' + labelId
    const data = (yield call(db.getPath, path)).val()
    yield put({type: LABEL_DATA, data})
  }
}

function* initFirebaseKeys() {
  yield take (STORE_PARSED_DATA)
  const {result} = yield select(state => state.loginReducer)
  let userName = 'anonymous'
  if (firebase.auth().currentUser && (result && result !== 'anonymous')) {
    userName = result.user.uid
  }
  else {
    yield call (firebaseLogin)
  }
  const key = firebase.database().ref('/global/inphoodLabel/' + userName).push().key
  const debug = Config.DEBUG
  if (!debug) {
    var fulldate = Date.now()
    var date = new Date(fulldate).toDateString()
    Fingerprint2().get(function(result) {
      firebase.database().ref('/global/inphoodLabel/' + userName + '/' + key).update({
        fingerprint: result
      })
      firebase.database().ref('/global/inphoodLabel/' + userName + '/' + '/fingerprint/' + result + '/' + key).update({
        date,
        fulldate
      })
      firebase.database().ref('/global/inphoodLabel/analytics/' + date + '/fingerprints/' + result + '/' + key).update({
        fulldate
      })
      firebase.database().ref('/global/inphoodLabel/analytics/' + date + '/keys/' + key).update({
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
  yield fork(takeLatest, LOGIN_SUCCESS, moveFirebaseData)
}
