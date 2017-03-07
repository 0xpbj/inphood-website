import {
  SEARCH_INGREDIENT,
  SET_FDA_RESULTS
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import request from 'request'
const Config = require('Config')

const fdaFetch = (request) => {
  return fetch(request)
  .then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function(json) {
        return json
      })
    }
  })
}

function* reportFDA(ndbnoInfo) {
  const fdaReportUrl = Config.FDA_REPORT_URL + '?' + ndbnoInfo + '&api_key=' + Config.FDA_API_KEY
  const requestReport = new Request(fdaReportUrl)
  const resultsReport = yield call (fdaFetch, requestReport)
  yield put ({type: SET_FDA_RESULTS, results: resultsReport})
}

function* searchFDA() {
  while (true) {
    const {searchIngredient} = yield take(SEARCH_INGREDIENT)
    const fdaSearchUrl = Config.FDA_SEARCH_URL + '?format=json&q=' + searchIngredient + '&ds=Branded Food Products&sort=r&max=25&offset=0&api_key=' + Config.FDA_API_KEY 
    const requestNDBNO = new Request(fdaSearchUrl)
    const resultsNDBNO = yield call (fdaFetch, requestNDBNO)
    const items = resultsNDBNO.list.item
    let ndbnoInfo = ''
    for (let i of items) {
      ndbnoInfo += '&ndbno=' + i.ndbno
    }
    if (ndbnoInfo !== '')
      yield call (reportFDA, ndbnoInfo)
  }
}

export default function* root() {
  yield fork(searchFDA)
}