import {
  LABEL_DATA,
  GET_LABEL_ID,
  SEND_USER_GENERATED_DATA,
} from '../constants/ActionTypes'

import { call, fork, put, select, take } from 'redux-saga/effects'
import * as db from './firebaseCommands'

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
}
