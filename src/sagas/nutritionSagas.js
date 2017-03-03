import {
  UPLOAD_PHOTO,
  POST_LABEL_ID,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  CLEAR_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  LAZY_FETCH_FIREBASE,
  LAZY_LOAD_FIREBASE,
  SEARCH_INGREDIENT,
  SELECTED_TAGS,
  GET_MORE_DATA,
  INIT_EMAIL_FLOW,
  GET_EMAIL_DATA
} from '../constants/ActionTypes'

import * as db from './firebaseCommands'
import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import request from 'request'
const firebase = require('firebase')
const Config = require('Config')
const S3 = require('aws-sdk').S3
const SES = require('aws-sdk').SES

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
      })
    } else {
      //console.log("Unexpected server response (non-JSON object returned)");
    }
  })
}

function* sendToLambdaScraper(url, key, username, thumbnail, parsedData, rawData, title, allergen, dietary) {
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
      rawData,
      parsedData,
      title,
      dietary,
      allergen
    })
  }
}

function* uploadImageToS3(file, key, username, extension) {
  const s3 = new S3({
    accessKeyId:     Config.AWS_ACCESS_ID,
    secretAccessKey: Config.AWS_SECRET_KEY,
    region: 'us-west-2',
  })
  const params = {
    Bucket: 'inphoodlabelimagescdn', 
    Key: username +'/'+ key+extension, 
    Body: file,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  }
  s3.upload(params, function(err, data) {})
}

function* loadAWSPut() {
  const {parsedData, rawData, title, dietary, allergen, file} = yield select(state => state.nutritionReducer)
  yield call (firebaseLogin)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  let key = firebase.database().ref('/global/nutritionLabel/' + user).push().key
  // yield call (sendToLambdaScraper, picture, key, username, thumbnail, parsedData, rawData, title, dietary, allergen)
  let iUrl = ''
  if (file && !Config.DEBUG) {
    const extension = file.name.substr(file.name.lastIndexOf('.'))
    yield call (uploadImageToS3, file, key, 'anonymous', extension)
    iUrl = 'http://www.image.inphood.com/anonymous/'+key+extension
  }
  firebase.database().ref('/global/nutritionLabel/' + user + '/' + key).update({
    key,
    user,
    iUrl,
    rawData,
    parsedData,
    title,
    dietary,
    allergen
  })
  const url = "http://www.inphood.com/" + key
  yield put ({type: RESULT_URL, url, key, anonymous: true})
}

function* loadSerializedData() {
  const {composite, full, key} = yield select(state => state.nutritionReducer)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  firebase.database().ref('/global/nutritionLabel/'+user+'/'+key).update({
    composite,
    full
  })
}

function* getDataFromFireBase(foodName, ingredient, key, index, userSearch, append) {
  const path = 'global/nutritionInfo/' + key
  const flag = (yield call(db.getPath, path)).exists()
  if (flag) {
    const data = (yield call(db.getPath, path)).val()
    if (index)
      yield put ({type: LAZY_LOAD_FIREBASE, foodName, ingredient, index, data})
    else {
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data, userSearch, append})
    }
  }
  else {
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data: [], userSearch, append})
  }
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
      //console.log("Unexpected server response (non-JSON object returned)");
    }
  })
}

function* callElasticSearchLambda(searchTerm, foodName, size, userSearch, append) {
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
  // TODO: possibly need to preserve the order of the results (the parallel get and
  // object construction in nutritionReducer destroys this.)
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
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: sortedData, append})
    yield fork(getDataFromFireBase, foodName, sortedData[0].info._source.Description, sortedData[0].info._id, 0, userSearch, append)
  }
  else {
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: [], append})
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient: '', data: [], userSearch, append})
  }
}

function* fetchMoreData() {
  while (true) {
    const {foodName, size} = yield take(GET_MORE_DATA)
    yield fork(callElasticSearchLambda, foodName, foodName, size+10, false, true)
  }
}

function* lazyFetchFirebaseData() {
  while (true) {
    const {foodName, ingredient, key, index} = yield take(LAZY_FETCH_FIREBASE)
    yield fork(getDataFromFireBase, foodName, ingredient, key, index)
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
    const searchTerm = parseObj['clean'] ? parseObj['clean'] : foodName
    yield put({type: CLEAR_FIREBASE_DATA})
    yield fork(callElasticSearchLambda, searchTerm, foodName, 10, false, false)
  }
}

function* userSearchIngredient() {
  while (true) {
    const {searchIngredient} = yield take(SEARCH_INGREDIENT)
    if (searchIngredient) {
      yield fork(callElasticSearchLambda, searchIngredient, searchIngredient, 10, true, false)
    }
    else {
      yield put ({type: INITIALIZE_FIREBASE_DATA, foodName: searchIngredient, data: [], append: false})
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName: searchIngredient, ingredient: '', data: [], userSearch: true, append: false})
    }
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

function* sendEmail () {
  const {data} = yield take(GET_EMAIL_DATA)
  var params = {
    Destination: { /* required */
      ToAddresses: [
        'info@inphood.com',
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Data: data, /* required */
        },
        Text: {
          Data: data, /* required */
        }
      },
      Subject: { /* required */
        Data: 'Feedback Email', /* required */
      }
    },
    Source: 'no-reply@inphood.com', /* required */
    Tags: [
      {
        Name: 'STRING_VALUE', /* required */
        Value: 'STRING_VALUE' /* required */
      },
    ]
  }
  const ses = new SES({
    accessKeyId:     Config.AWS_ACCESS_ID,
    secretAccessKey: Config.AWS_SECRET_KEY,
    region: 'us-west-2',
  })
  ses.sendEmail(params, function(err, data) {
    if(err) 
      throw err
    console.log('Email sent:', data);
  })
}

export default function* root() {
  yield call(lambdaHack)
  yield fork(lazyFetchFirebaseData)
  yield fork(userSearchIngredient)
  yield fork(fetchMoreData)
  yield fork(takeLatest, INIT_EMAIL_FLOW, sendEmail)
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadSerializedData)
  yield fork(takeLatest, UPLOAD_PHOTO, loadAWSPut)
  yield fork(takeLatest, STORE_PARSED_DATA, processParseForLabel)
}
