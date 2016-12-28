import { fork } from 'redux-saga/effects'
import data from './dataSagas'

export default function* rootSaga() {
  yield fork(data)
}
