import {
  SET_FDA_RESULTS,
  SEARCH_INGREDIENT,
  GET_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  SEARCH_INGREDIENT_COMMERCIAL
} from '../constants/ActionTypes'

import {changesFromSearch, changesFromRecipe} from './parserFunctions'

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

function* reportFDA(searchIngredient, ndbnoInfo, userSearch) {
  // console.log('reportFDA ---------------------------------------------------');
  const fdaReportUrl = Config.FDA_REPORT_URL +
    '?' + ndbnoInfo + '&api_key=' + Config.FDA_API_KEY
  const requestReport = new Request(fdaReportUrl)
  const resultsReport = yield call (fdaFetch, requestReport)
  yield put.resolve({type: SET_FDA_RESULTS,
                     searchTerm: searchIngredient,
                    results: resultsReport})

  const {selectedTags, matchResultsModel, unusedTags} =
    yield select(state => state.tagModelReducer)

  if (userSearch === false) {
    const {missingData, parsedData} = yield select(state => state.nutritionReducer)
    yield fork (changesFromRecipe, parsedData, missingData, matchResultsModel)
  } 
  else if (userSearch === true) {
    yield fork (changesFromSearch, selectedTags, matchResultsModel, searchIngredient, unusedTags, userSearch)
  }
}

function* searchFDA(searchIngredient, userSearch) {
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
      yield call (reportFDA, searchIngredient, ndbnoInfo, userSearch)
    }
  }
  else {
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName: searchIngredient, data: [], append: false})
    yield put ({type: GET_FIREBASE_DATA, foodName: searchIngredient, ingredient: searchIngredient, key: 'undefined', userSearch, append: false})
  }
}

// TODO: might make more sense to combine these functions and pass in an
//       argument indicating what type of search, 'user' or 'recipe'
function* fdaUserSearch() {
  while (true) {
    const {searchIngredient} = yield take(SEARCH_INGREDIENT)
    const userSearch = true
    yield call (searchFDA, searchIngredient, userSearch)
  }
}

function* fdaRecipeSearch() {
  while (true) {
    const {searchIngredient} = yield take(SEARCH_INGREDIENT_COMMERCIAL)
    const userSearch = false
    yield call (searchFDA, searchIngredient, userSearch)
  }
}

export default function* root() {
  yield fork(fdaUserSearch)
  yield fork(fdaRecipeSearch)
}
