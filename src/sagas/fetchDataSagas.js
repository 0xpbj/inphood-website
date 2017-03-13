import {
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  REMOVE_ELLIPSES,
  SEARCH_INGREDIENT,
  GET_MORE_DATA,
  STORE_PARSED_DATA,
  CLEAR_FIREBASE_DATA,
  GET_FIREBASE_DATA,
  SUPER_SEARCH_RESULTS
} from '../constants/ActionTypes'

import {MatchResultsModel} from '../components/models/MatchResultsModel'
import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import * as db from './firebaseCommands'
import request from 'request'
const Config = require('Config')
import {callElasticSearchLambda} from './elasticFunctions'
import {changesFromAppend, changesFromSearch, changesFromRecipe} from './parserFunctions'

function* getDataFromFireBase() {
  while (true) {
    const {foodName, ingredient, key, userSearch, append} = yield take(GET_FIREBASE_DATA)
    const path = 'global/nutritionInfo/' + key
    const flag = (yield call(db.getPath, path)).exists()
    if (flag) {
      const data = (yield call(db.getPath, path)).val()
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data, userSearch, append})
    }
    else {
      if (userSearch) {
        yield put ({type: SUPER_SEARCH_RESULTS,
                    matchResultsModel: new MatchResultsModel(),
                    ingredient: searchIngredient})
      }
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data: [], userSearch, append})
    }
    if (append) {
      const {matchResultsModel} = yield select(state => state.tagModelReducer)
      yield fork (changesFromAppend, foodName, matchResultsModel)
    }
    else if (userSearch) {
      const {selectedTags, matchResultsModel, searchIngredient} = yield select(state => state.tagModelReducer)
      let {unmatchedTags} = yield select(state => state.tagModelReducer)
      yield fork (changesFromSearch, selectedTags, matchResultsModel, searchIngredient, unmatchedTags)
    }
    else {
      const {parsedData} = yield select(state => state.nutritionReducer)
      const {missingData} = yield select(state => state.nutritionReducer)
      const {matchResultsModel} = yield select(state => state.tagModelReducer)
      if (matchResultsModel.getNumberOfSearches() === Object.keys(parsedData).length) {
        yield fork (changesFromRecipe, parsedData, missingData, matchResultsModel)
      }
    }
  }
}

function* processParseForLabel() {
  // Get the parse data out of the nutrition reducer and call elastic search on
  // it to build the following structure:
  //   [
  //     'Green Onion' : ['dbKey1', 'dbKey2' ...],
  //     'red bean' : ['dbKey1', ...],
  //     'yakisoba' : []
  //   ]
  const {parsedData} = yield select(state => state.nutritionReducer)
  for (let i = 0; i < parsedData.length; i++) {
    const parseObj = parsedData[i]
    const foodName = parseObj['name']
    yield put({type: CLEAR_FIREBASE_DATA})
    const userSearch = false
    const append = false
    const size = 5
    yield fork(callElasticSearchLambda, foodName, foodName, size, userSearch, append)
  }
}

function* userSearchIngredient() {
  while (true) {
    const {searchIngredient} = yield take(SEARCH_INGREDIENT)
    const userSearch = true
    const append = false
    if (searchIngredient) {
      const size = 10
      yield fork(callElasticSearchLambda, searchIngredient, searchIngredient, size, userSearch, append)
    }
    else {
      yield put ({type: INITIALIZE_FIREBASE_DATA, foodName: searchIngredient, data: [], append})
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName: searchIngredient, ingredient: '', data: [], userSearch, append})
    }
  }
}

function* appendData() {
  while (true) {
    const {foodName, size} = yield take(GET_MORE_DATA)
    const userSearch = false
    const append = true
    yield fork(callElasticSearchLambda, foodName, foodName, size+5, userSearch, append)
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
  yield fork(getDataFromFireBase)
  yield fork(userSearchIngredient)
  yield fork(takeLatest, STORE_PARSED_DATA, processParseForLabel)
}
