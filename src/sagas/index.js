import { fork } from 'redux-saga/effects'
import nutrition from './nutritionSagas'
import results from './resultsSagas'
import elastic from './elasticSagas'
import email from './emailSagas'
import aws from './awsSagas'

export default function* rootSaga() {
  yield fork(nutrition)
  yield fork(results)
  yield fork(elastic)
  yield fork(email)
  yield fork(aws)
}
