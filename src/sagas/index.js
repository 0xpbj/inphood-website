import { fork } from 'redux-saga/effects'
import user from './userSagas'
import nutrition from './nutritionSagas'

export default function* rootSaga() {
  yield fork(user)
  yield fork(nutrition)
}
