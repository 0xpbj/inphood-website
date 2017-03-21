import { fork } from 'redux-saga/effects'
import match from './matchSagas'
import results from './resultsSagas'
import fetchData from './fetchDataSagas'
import email from './emailSagas'
import aws from './awsSagas'
import fda from './fdaSagas'
import parser from './parserSagas'

export default function* rootSaga() {
  yield fork(match)
  yield fork(results)
  yield fork(fetchData)
  yield fork(email)
  yield fork(aws)
  yield fork(fda)
  yield fork(parser)
}
