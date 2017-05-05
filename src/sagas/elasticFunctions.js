import {
  INITIALIZE_FIREBASE_DATA,
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
  let info = data[0]
  if (info) {
    yield put.resolve({type: INITIALIZE_FIREBASE_DATA, foodName, data})

    // This used to use info = data[0], but now that heurisitics are applied in INITIALIZE_FIREBASE_DATA, we have to
    // get the new ndbNo to fetch:
    // yield put ({type: GET_FIREBASE_DATA, foodName, ingredient: info._source.inPhood001, key: info._id, index, length})
    const {matchResultsModel} = yield select(state => state.tagModelReducer)
    const searchResult = matchResultsModel.getSearchResultByIndex(foodName)
    let key = searchResult.getNdbNo()
    let ingredient = searchResult.getDescription()

    console.log('callElasticSearchLambda ------------------------------------');
    console.log('matchResultsModel: ', matchResultsModel);
    console.log('searchResult: ', searchResult);
    console.log('key: ', key);
    console.log('ingredient: ', ingredient);

    yield put({type: GET_FIREBASE_DATA, foodName, ingredient, key, index, length})
  }
  else {
    yield put ({type: GET_COMMERCIAL_DATA, foodName})
  }
}
