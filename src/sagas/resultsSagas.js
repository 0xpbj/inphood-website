import {
  LABEL_DATA,
  GET_LABEL_ID,
  SEND_SERIALIZED_DATA,
  SEND_USER_GENERATED_DATA,
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import * as db from './firebaseCommands'
const Config = require('Config')
const firebase = require('firebase')

function* loadSerializedData() {
  const {composite, full, key} = yield select(state => state.nutritionReducer)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  firebase.database().ref('/global/nutritionLabel/'+user+'/'+key).update({
    composite,
    full
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

export default function* root() {
  yield fork(getLabelData)
  yield fork(sendUserGeneratedData)
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadSerializedData)
}
