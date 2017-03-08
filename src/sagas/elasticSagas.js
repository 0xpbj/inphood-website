import {
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  REMOVE_ELLIPSES,
  SEARCH_INGREDIENT,
  GET_MORE_DATA,
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import request from 'request'
const Config = require('Config')
import {getDataFromFireBase} from './nutritionSagas'

const elasticSearchFetch = (request) => {
  return fetch(request)
  .then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function(json) {
        return json
      });
    } else {
      //console.log("Unexpected server response (non-JSON object returned)");
    }
  })
}

function* fallbackSearch(searchIngredient, foodName, size, userSearch, append, fallback, tokenize, parse) {
  const token = foodName.split(",")
  if (token[0] && tokenize) {
    yield fork(callElasticSearchLambda, token[0], foodName, size, userSearch, append, true, false, true)
  }
  else if (parse) {
    const regex = /[^\r\n]+/g
    const file = require("raw-loader!../data/ingredients.txt")
    const fileWords = new Set(file.match(regex))
    let results = []
    for (let i of fileWords) {
      if (i.match(searchIngredient + '.?') || searchIngredient.indexOf(i) !== -1) {
        results.push(i)
      }
    }
    if (results.length) {
      const levenshtein = require('fast-levenshtein')
      let sortedData = []
      for (let i of results) {
        let d = levenshtein.get(foodName, i)
        sortedData.push({info: i, distance: d})
      }
      sortedData.sort(function(a, b) {
        return a.distance - b.distance
      })
      yield fork(callElasticSearchLambda, sortedData[0].info, foodName, size, userSearch, append, false, false, false)
    }
    else {
      yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: [], append})
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient: '', data: [], userSearch, append})
    }
  }
}

export function* callElasticSearchLambda(searchIngredient, foodName, size, userSearch, append, fallback, tokenize, parse) {
  const url = Config.ELASTIC_LAMBDA_URL
  const search = {
    'query': {'match' : {'Description': searchIngredient}},
    'size': size
  }
  let myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  // From MDN and here: https://github.com/matthew-andrews/isomorphic-fetch/issues/34
  let request = new Request(url, {
    method: 'POST',
    body: JSON.stringify(search),
    headers: myHeaders,
    mode: 'cors',
    cache: 'default'
  })
  const json = yield call (elasticSearchFetch, request)
  let {data} = json
  var levenshtein = require('fast-levenshtein');
  let sortedData = []
  for (let i of data) {
    var res = i._source.Description.split(",")
    var spr = res[0].split(" ")
    let d = levenshtein.get(foodName, spr[0])
    sortedData.push({info: i, distance: d})
  }
  if (sortedData[0]) {
    sortedData.sort(function(a, b) {
      return a.distance - b.distance;
    })
    const {matchData} = yield select(state => state.modelReducer)
    const remEllipses = matchData[foodName] ? ((Object.keys(matchData[foodName]).length - 1 === Object.keys(sortedData).length) && append) : false
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: sortedData, userSearch, append, remEllipses})
    yield fork(getDataFromFireBase, foodName, sortedData[0].info._source.Description, sortedData[0].info._id, 0, userSearch, append)
  }
  else if (fallback) {
    yield fork(fallbackSearch, searchIngredient, foodName, 5, userSearch, append, fallback, tokenize, parse)
  }
  else {
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: [], append})
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient: '', data: [], userSearch, append})
  }
}

function* lambdaHack() {
  if (!Config.DEBUG) {
    const url = Config.ELASTIC_LAMBDA_URL
    const search = {
      'query': {'match' : {'Description': 'kale'}},
      'size': 1
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
    yield call (elasticSearchFetch, request)
  }
}

function* userSearchIngredient() {
  while (true) {
    const {searchIngredient} = yield take(SEARCH_INGREDIENT)
    const userSearch = true
    const append = false
    const fallback = true
    if (searchIngredient) {
      const size = 10
      const tokenize = false
      const parse = false
      yield fork(callElasticSearchLambda, searchIngredient, searchIngredient, size, userSearch, append, fallback, tokenize, parse)
    }
    else {
      yield put ({type: INITIALIZE_FIREBASE_DATA, foodName: searchIngredient, data: [], append})
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName: searchIngredient, ingredient: '', data: [], userSearch, append})
    }
  }
}

function* fetchMoreData() {
  while (true) {
    const {foodName, size} = yield take(GET_MORE_DATA)
    const userSearch = false
    const append = true
    const fallback = false
    const tokenize = false
    const parse = false
    yield fork(callElasticSearchLambda, foodName, foodName, size+5, userSearch, append, fallback, tokenize, parse)
  }
}

export default function* root() {
  yield call(lambdaHack)
  yield fork(userSearchIngredient)
  yield fork(fetchMoreData)
}