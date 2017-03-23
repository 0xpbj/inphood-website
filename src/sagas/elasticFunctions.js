import {
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  SUPER_SEARCH_RESULTS,
  GET_FIREBASE_DATA,
  GET_COMMERCIAL_DATA
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
    else {
      console.log("Unexpected server response (non-JSON object returned)");
    }
  })
}

export function* callElasticSearchLambda(foodName, size, index, length) {
  const url = Config.ELASTIC_LAMBDA_URL
  const search = {
    'query': {'match' : {'Description': foodName}},
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
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data})
    yield put ({type: GET_FIREBASE_DATA, foodName, ingredient: info._source.Description, key: info._id, index, length})
  }
  else {
    yield put ({type: GET_COMMERCIAL_DATA, foodName})
  }
}
