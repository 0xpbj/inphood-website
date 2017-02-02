import { fork } from 'redux-saga/effects'
import user from './userSagas'
import nutrition from './nutritionSagas'
import results from './resultsSagas'
import search from './searchSagas'

export default function* rootSaga() {
  yield fork(user)
  yield fork(nutrition)
  yield fork(results)
  yield fork(search)
}
