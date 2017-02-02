import {
  SEARCH_INGREDIENT,
  SEARCH_RESULT,
  SEARCH_ERROR
} from '../constants/ActionTypes'

import * as db from './firebaseCommands'
import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
const firebase = require('firebase')
import request from 'request'
const Config = require('Config')

const elasticSearchFetch = (request) => {
  return fetch(request)
  .then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function(json) {
        return json
      });
    } else {
      console.log("Unexpected server response (non-JSON object returned)");
    }
  })
}

function* searchForIngredients() {
  while (true) {
    const {searchIngredient} = yield take(SEARCH_INGREDIENT)
    const url = Config.ELASTIC_LAMBDA_URL
    const search = {
      'query': {'match' : {'Description': searchIngredient}},
      'size': 20
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
    let sortedData = []
    var levenshtein = require('fast-levenshtein');
    for (let i of data) {
      var res = i._source.Description.split(",")
      //console.log('First word: ', res[0]);
      //console.log('Foodname: ', foodName);
      //console.log('Ingredient: ', searchTerm);
      let d = levenshtein.get(searchIngredient, res[0].toLowerCase())
      sortedData.push({info: i, distance: d})
    }
    if (data.length) {
      sortedData.sort(function(a, b) {
        return a.distance - b.distance;
      })
      yield put ({type: SEARCH_RESULT, data: sortedData})
    }
    else
      yield put ({type: SEARCH_ERROR})
  }
}

export default function* root() {
  yield fork(searchForIngredients)
}
