import { fork } from 'redux-saga/effects'
import match from './matchSagas'
import results from './resultsSagas'
import elastic from './elasticSagas'
import email from './emailSagas'
import aws from './awsSagas'
import fda from './fdaSagas'

export default function* rootSaga() {
  yield fork(match)
  yield fork(results)
  yield fork(elastic)
  yield fork(email)
  yield fork(aws)
  yield fork(fda)
}
