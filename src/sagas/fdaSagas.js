import {
  UNUSED_TAGS,
  GET_MORE_DATA,
  GET_COMMERCIAL_DATA,
  SET_FDA_RESULTS,
  PARSE_SEARCH_FDA_DATA,
  GET_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INITIALIZE_RECIPE_FLOW,
  INITIALIZE_SEARCH_FLOW
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

function* reportFDA(searchIngredient, ndbnoInfo) {
  const fdaReportUrl = Config.FDA_REPORT_URL +
    '?' + ndbnoInfo + '&api_key=' + Config.FDA_API_KEY
  const requestReport = new Request(fdaReportUrl)
  const resultsReport = yield call (fdaFetch, requestReport)
  yield put.resolve ({type: SET_FDA_RESULTS,
                     searchTerm: searchIngredient,
                    results: resultsReport})

  yield put ({type: INITIALIZE_RECIPE_FLOW})
}

function* searchFDA(searchIngredient) {
  const fdaSearchUrl = Config.FDA_SEARCH_URL +
    '?format=json&q=' +
    searchIngredient +
    '&ds=Branded Food Products&sort=r&max=25&offset=0&api_key=' +
    Config.FDA_API_KEY
  const requestNDBNO = new Request(fdaSearchUrl)
  const resultsNDBNO = yield call (fdaFetch, requestNDBNO)
  if (resultsNDBNO && resultsNDBNO.list) {
    const items = resultsNDBNO.list.item
    let ndbnoInfo = ''
    for (let i of items) {
      ndbnoInfo += '&ndbno=' + i.ndbno
    }
    if (ndbnoInfo !== '') {
      yield call (reportFDA, searchIngredient, ndbnoInfo)
    }
  }
  else {
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName: searchIngredient, data: []})
    yield put ({type: GET_FIREBASE_DATA, foodName: searchIngredient, ingredient: searchIngredient, key: 'undefined', index: 0, length: 0})
    yield put ({type: INITIALIZE_RECIPE_FLOW})
    yield put ({type: UNUSED_TAGS, tags: searchIngredient})
  }
}

function* fdaRecipe() {
  while (true) {
    const {foodName} = yield take(GET_COMMERCIAL_DATA)
    yield call (searchFDA, foodName)
  }
}

export default function* root() {
  // yield fork(fdaSearch)
  yield fork(fdaRecipe)
}
