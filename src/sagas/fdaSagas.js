import {
  GET_MORE_DATA,
  GET_COMMERCIAL_DATA,
  SET_FDA_RESULTS,
  PARSE_SEARCH_FDA_DATA,
  GET_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import request from 'request'
const Config = require('Config')
import {changesFromRecipe, changesFromSearch} from './parserFunctions'

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

function* reportFDA(searchIngredient, ndbnoInfo, append) {
  const fdaReportUrl = Config.FDA_REPORT_URL +
    '?' + ndbnoInfo + '&api_key=' + Config.FDA_API_KEY
  const requestReport = new Request(fdaReportUrl)
  const resultsReport = yield call (fdaFetch, requestReport)
  yield put ({type: SET_FDA_RESULTS,
                     searchTerm: searchIngredient,
                    results: resultsReport})
  if (append) {
    yield put ({type: PARSE_SEARCH_FDA_DATA, ingredient: searchIngredient})
    yield fork (changesFromSearch)
  }
  else {
    const {missingData} = yield select(state => state.nutritionReducer)
    let newData = []
    newData.push(searchIngredient)
    const {matchResultsModel} = yield select(state => state.tagModelReducer)
    yield fork (changesFromRecipe, newData, missingData, matchResultsModel)
  }
}

function* searchFDA(searchIngredient, append) {
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
      yield call (reportFDA, searchIngredient, ndbnoInfo, append)
    }
  }
  else {
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName: searchIngredient, data: [], append})
    yield put ({type: GET_FIREBASE_DATA, foodName: searchIngredient, ingredient: searchIngredient, key: 'undefined', append, index: 0, length: 0})
  }
}

function* fdaSearch() {
  while (true) {
    const {foodName} = yield take(GET_MORE_DATA)
    const append = true
    yield call (searchFDA, foodName, append)
  }
}

function* fdaRecipe() {
  while (true) {
    const {foodName} = yield take(GET_COMMERCIAL_DATA)
    const append = false
    yield call (searchFDA, foodName, append)
  }
}

export default function* root() {
  yield fork(fdaSearch)
  yield fork(fdaRecipe)
}
