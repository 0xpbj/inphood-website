import {
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  CLEAR_FIREBASE_DATA,
  GET_FIREBASE_DATA,
  STORE_PARSED_DATA,
  GET_MORE_DATA,
  PARSE_SEARCH_DATA,
  INITIALIZE_RECIPE_FLOW,
  INITIALIZE_SEARCH_FLOW,
  UNUSED_TAGS
} from '../constants/ActionTypes'

import {MatchResultsModel} from '../components/models/MatchResultsModel'
import { call, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects'
import * as db from './firebaseCommands'
import request from 'request'
const Config = require('Config')
import {callElasticSearchLambda, elasticSearchFetch} from './elasticFunctions'

function* getDataFromFireBase() {
  const {foodName, ingredient, key, index, length} = yield take(GET_FIREBASE_DATA)
  const path = 'global/nutritionInfo/' + key
  const flag = (yield call(db.getPath, path)).exists()
  if (flag) {
    const data = (yield call(db.getPath, path)).val()
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data})
    if (index === length) {
      yield put ({type: INITIALIZE_RECIPE_FLOW})
    }
  }
  else {
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data: []})
  }
}

function* processParseForLabel() {
  const {newData} = yield select(state => state.nutritionReducer)
  const length = newData.length
  for (let i = 0; i < length; i++) {
    const parseObj = newData[i]
    const foodName = parseObj['name']
    const size = 20
    yield call (callElasticSearchLambda, foodName, size, i, length-1)
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
  yield fork(takeEvery, INITIALIZE_FIREBASE_DATA, getDataFromFireBase)
  yield fork(takeEvery, STORE_PARSED_DATA, processParseForLabel)
}
