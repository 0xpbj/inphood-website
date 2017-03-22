import {
  CLEAR_DATA,
  RESULT_URL,
  LABEL_DATA,
  GET_LABEL_ID,
  STORE_PARSED_DATA,
  SEND_SERIALIZED_DATA,
  SEND_USER_GENERATED_DATA,
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

function* loadFirebaseData() {
  const {composite, full, parsedData, rawData, key} = yield select(state => state.nutritionReducer)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  firebase.database().ref('/global/nutritionLabel/' + user + '/' + key).update({
    full,
    user,
    rawData,
    parsedData,
    composite
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

function* sendUserGeneratedData() {
  while (true) {
    const {data, labelId, userId} = yield take (SEND_USER_GENERATED_DATA)
    firebase.database().ref('/global/nutritionLabel/'+userId+'/'+labelId).update({
      userGeneratedData: data
    })
  }
}

function* initFirebaseKeys() {
  yield take (STORE_PARSED_DATA)
  yield call (firebaseLogin)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  let key = firebase.database().ref('/global/nutritionLabel/' + user).push().key
  const url = "http://www.inphood.com/" + key
  yield put ({type: RESULT_URL, url, key, anonymous: true})
}

export default function* root() {
  yield fork(getLabelData)
  yield fork(sendUserGeneratedData)
  yield fork(takeLatest, CLEAR_DATA, initFirebaseKeys)
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadFirebaseData)
}
