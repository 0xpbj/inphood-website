import {
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  CLEAR_FIREBASE_DATA,
  GET_FIREBASE_DATA,
  STORE_PARSED_DATA,
  GET_MORE_DATA,
  PARSE_SEARCH_DATA,
  INITIALIZE_RECIPE_FLOW,
  INITIALIZE_SEARCH_FLOW
} from '../constants/ActionTypes'

import {MatchResultsModel} from '../components/models/MatchResultsModel'
import { call, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects'
import * as db from './firebaseCommands'
import request from 'request'
const Config = require('Config')
import {callElasticSearchLambda, elasticSearchFetch} from './elasticFunctions'

function* getDataFromFireBase() {
  const {foodName, ingredient, key, append, index, length} = yield take(GET_FIREBASE_DATA)
  const path = 'global/nutritionInfo/' + key
  const flag = (yield call(db.getPath, path)).exists()
  if (flag) {
    const data = (yield call(db.getPath, path)).val()
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data, append})
    if (append) {
      yield put ({type: PARSE_SEARCH_DATA, ingredient})
      yield put ({type: INITIALIZE_SEARCH_FLOW})
    }
    else if (index === length) {
      yield put ({type: INITIALIZE_RECIPE_FLOW})
    }
  }
  else {
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data: [], append})
  }
}

function* processParseForLabel() {
  const {newData} = yield select(state => state.nutritionReducer)
  const length = newData.length
  for (let i = 0; i < length; i++) {
    const parseObj = newData[i]
    const foodName = parseObj['name']
    const append = false
    const size = 5
    yield call (callElasticSearchLambda, foodName, size, append, i, length-1)
  }
}

function* appendData() {
  while (true) {
    const {foodName} = yield take(GET_MORE_DATA)
    const append = true
    const size = 25
    const i = 0
    const length = 0
    yield fork(callElasticSearchLambda, foodName, size, append, i, length)
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

export default function* root() {
  yield call(lambdaHack)
  yield fork(appendData)
  yield fork(takeEvery, INITIALIZE_FIREBASE_DATA, getDataFromFireBase)
  yield fork(takeEvery, STORE_PARSED_DATA, processParseForLabel)
}
