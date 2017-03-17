import {
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  SUPER_SEARCH_RESULTS,
  GET_FIREBASE_DATA,
  SEARCH_INGREDIENT_COMMERCIAL
} from '../constants/ActionTypes'

import {MatchResultsModel} from '../components/models/MatchResultsModel'
import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import request from 'request'
const Config = require('Config')

export const elasticSearchFetch = (request) => {
  return fetch(request)
  .then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function(json) {
        return json
      });
    }
    // else {
      //console.log("Unexpected server response (non-JSON object returned)");
    // }
  })
}

export function* callElasticSearchLambda(searchIngredient, foodName, size, userSearch, append) {
  const url = Config.ELASTIC_LAMBDA_URL
  const search = {
    'query': {'match' : {'Description': searchIngredient}},
    'size': size
  }
  let myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  let request = new Request(url, {
    method: 'POST',
    body: JSON.stringify(search),
    headers: myHeaders,
    mode: 'cors',
    cache: 'default'
  })
  const json = yield call (elasticSearchFetch, request)
  const {data} = json
  const info = data[0]
  if (info) {
    const {matchResultsModel} = yield select(state => state.tagModelReducer)
    let remEllipses = false
    if (matchResultsModel.hasSearchTerm(foodName)) {
        remEllipses = append &&
                      ((matchResultsModel.getSearchResultsLength(foodName) -1)
                       === Object.keys(data).length)
    }
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data, userSearch, append, remEllipses})
    yield put ({type: GET_FIREBASE_DATA, foodName, ingredient: info._source.Description, key: info._id, userSearch, append})
  }
  else {
    if (userSearch) {
      yield put ({type: SUPER_SEARCH_RESULTS,
                  matchResultsModel: new MatchResultsModel(),
                  ingredient: searchIngredient})
    }
    else
      yield put ({type: SEARCH_INGREDIENT_COMMERCIAL, searchIngredient})
  }
}
