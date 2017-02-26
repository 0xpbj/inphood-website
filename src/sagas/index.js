import { fork } from 'redux-saga/effects'
import nutrition from './nutritionSagas'
import results from './resultsSagas'

export default function* rootSaga() {
  yield fork(nutrition)
  yield fork(results)
}
