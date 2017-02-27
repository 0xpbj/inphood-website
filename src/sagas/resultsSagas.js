import {
  GET_LABEL_ID,
  LABEL_DATA
} from '../constants/ActionTypes'

import { call, fork, put, select, take } from 'redux-saga/effects'
import * as db from './firebaseCommands'

function* getLabelData() {
  while (true) {
    const {userId, labelId} = yield take (GET_LABEL_ID)
    const path = '/global/nutritionLabel/' + userId + '/' + labelId
    console.log('Path: ', path);
    const data = (yield call(db.getPath, path)).val()
    yield put({type: LABEL_DATA, data})
  }
}

export default function* root() {
  yield fork(getLabelData)
}
