import {
  IG_UPLOAD_PHOTO,
  POST_LABEL_ID,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  CLEAR_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  LAZY_FETCH_FIREBASE,
  LAZY_LOAD_FIREBASE
} from '../constants/ActionTypes'

import * as db from './firebaseCommands'
import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
const firebase = require('firebase')
import request from 'request'
import Hello from 'hellojs'
const Config = require('Config')
// var AWS = require('aws-sdk')

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
}

const sendToS3 = (request) => {
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

function* uploadImageToS3(url, key, username, thumbnail, parsedData, rawData, recipeFlag) {
  const lUrl = Config.SCRAPER_LAMBDA_URL
  let myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  const awsData = {
    url,
    username,
    key
  }
  let request = new Request(lUrl, {
    method: 'POST',
    body: JSON.stringify(awsData),
    headers: myHeaders,
    mode: 'cors',
    cache: 'default'
  })
  const response = yield call (sendToS3, request)
  if (Object.prototype.hasOwnProperty.call(response, 'success')) {
    firebase.database().ref('/global/nutritionLabel/'+username+'/'+key).update({
      key,
      user: username,
      oUrl: url,
      iUrl: 'http://www.image.inphood.com/' + username + '/' + key + '.jpg',
      thumbnail,
      rawData: rawData,
      parsedData: parsedData,
      recipe: recipeFlag,
      caption: !recipeFlag
    })
  }
}

function* loadAWSPut() {
  const {profile} = yield select(state => state.userReducer)
  const {link, picture, username, parsedData, rawData, recipeFlag} = yield select(state => state.nutritionReducer)
  const slink = link.slice(0, link.length - 1)
  yield call (firebaseLogin)
  let key = ''
  let thumbnail = ''
  if (!profile) {
    key = firebase.database().ref('/global/nutritionLabel/anonymous').push().key
  }
  else {
    key = slink.substring(slink.lastIndexOf('/')+1)
    thumbnail = profile.thumbnail
  }
  yield call (uploadImageToS3, picture, key, username, thumbnail, parsedData, rawData, recipeFlag)
  const url = "http://www.inphood.com/" + key
  if (profile)
    yield put ({type: RESULT_URL, url, key, anonymous: false})
  else
    yield put ({type: RESULT_URL, url, key, anonymous: true})
}

function* loadSerializedData() {
  const {composite, full, key, anonymous,username} = yield select(state => state.nutritionReducer)
  if (anonymous)
    firebase.database().ref('/global/nutritionLabel/anonymous/'+key).update({
      composite,
      full
    })
  else
    firebase.database().ref('/global/nutritionLabel/'+username+'/'+key).update({
      composite,
      full
    })
}

function* getDataFromFireBase(foodName, ingredient, key, index) {
  console.log('foodName, ingredient, key: ', foodName, ingredient, key)
  const path = 'global/nutritionInfo/' + key
  const data = (yield call(db.getPath, path)).val()
  if (index)
    yield put ({type: LAZY_LOAD_FIREBASE, foodName, ingredient, index, data})
  else
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data})
}

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

function* callElasticSearchLambda(searchTerm, foodName) {
  // Call elastic search (effectively this curl request):
  //
  // curl Config.ELASTIC_LAMBDA_URL
  //      -X POST
  //      -d '{"query": {"match": {"Description": "nutritional yeast"}}, "size": 10}'
  //      --header 'content-type: application/json'
  //
  const url = Config.ELASTIC_LAMBDA_URL

  const search = {
    'query': {'match' : {'Description': searchTerm}},
    'size': 20
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
  const start = Date.now()
  const json = yield call (elasticSearchFetch, request)
  // TODO: possibly need to preserve the order of the results (the parallel get and
  // object construction in nutritionReducer destroys this.)
  let {data} = json
  var levenshtein = require('fast-levenshtein');
  let sortedData = []
  for (let i of data) {
    var res = i._source.Description.split(",")
    console.log('First word: ', res[0]);
    console.log('Foodname: ', foodName);
    console.log('Ingredient: ', searchTerm);
    let d = levenshtein.get(searchTerm, res[0].toLowerCase())
    sortedData.push({info: i, distance: d})
  }
  sortedData.sort(function(a, b) {
    return a.distance - b.distance;
  })
  yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: sortedData})
  if (sortedData && sortedData[0]) {
    yield fork(getDataFromFireBase, foodName, sortedData[0].info._source.Description, sortedData[0].info._id, 0)
  }
}

function* lazyFetchFirebaseData() {
  while (true) {
    const {foodName, ingredient, key, index} = yield take(LAZY_FETCH_FIREBASE)
    yield fork(getDataFromFireBase, foodName, ingredient, key, index)
  }
}

function filterOutNonFoodWords(foodPhrase) {
  const regex = /\w+/g
  let words = foodPhrase.match(regex)

  // TODO: look into best way to do this (i.e. if we're bombing memory with this
  //       list being allocated every time this is called, then restructure).
  const listOfFoods = require("raw-loader!../data/ingredients.txt")
  const foodWords = new Set(listOfFoods.match(regex))

  const foodIntersection = new Set([...words].filter(x => foodWords.has(x)))
  return [...foodIntersection]
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
  // for (let i = 0; i < 2; i++) {
    const parseObj = parsedData[i]
    const foodName = parseObj['name']

    let searchTerm = foodName
    const foodWords = filterOutNonFoodWords(searchTerm)
    if (foodWords.length > 0) {
      searchTerm = foodWords.toString().replace(',', ' ')
    }

    yield put({type: CLEAR_FIREBASE_DATA})
    yield fork(callElasticSearchLambda, searchTerm, foodName)
  }

}

export default function* root() {
  yield fork(lazyFetchFirebaseData)
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadSerializedData)
  yield fork(takeLatest, IG_UPLOAD_PHOTO, loadAWSPut)
  yield fork(takeLatest, STORE_PARSED_DATA, processParseForLabel)
}
