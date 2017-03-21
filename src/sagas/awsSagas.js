import {
  UPLOAD_PHOTO,
  POST_LABEL_ID,
  RESULT_URL,
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
const firebase = require('firebase')
const Config = require('Config')
const S3 = require('aws-sdk').S3

// const sendToS3 = (request) => {
//   return fetch(request)
//   .then(function(response) {
//     var contentType = response.headers.get("content-type");
//     if(contentType && contentType.indexOf("application/json") !== -1) {
//       return response.json().then(function(json) {
//         return json
//       })
//     } else {
//       //console.log("Unexpected server response (non-JSON object returned)");
//     }
//   })
// }

// function* sendToLambdaScraper(url, key, username, thumbnail, parsedData, rawData, title, allergen, dietary) {
//   const lUrl = Config.SCRAPER_LAMBDA_URL
//   let myHeaders = new Headers()
//   myHeaders.append('Content-Type', 'application/json')
//   const awsData = {
//     url,
//     username,
//     key
//   }
//   let request = new Request(lUrl, {
//     method: 'POST',
//     body: JSON.stringify(awsData),
//     headers: myHeaders,
//     mode: 'cors',
//     cache: 'default'
//   })
//   const response = yield call (sendToS3, request)
//   if (Object.prototype.hasOwnProperty.call(response, 'success')) {
//     firebase.database().ref('/global/nutritionLabel/'+username+'/'+key).update({
//       key,
//       user: username,
//       oUrl: url,
//       iUrl: 'http://www.image.inphood.com/' + username + '/' + key + '.jpg',
//       thumbnail,
//       rawData,
//       parsedData,
//       title,
//       dietary,
//       allergen
//     })
//   }
// }

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
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
  const {parsedData, rawData, file} = yield select(state => state.nutritionReducer)
  yield call (firebaseLogin)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  let key = firebase.database().ref('/global/nutritionLabel/' + user).push().key
  // yield call (sendToLambdaScraper, picture, key, username, thumbnail, parsedData, rawData, title, dietary, allergen)
  let iUrl = ''
  if (file) {
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
  })
  const url = "http://www.inphood.com/" + key
  yield put ({type: RESULT_URL, url, key, anonymous: true})
}

export default function* root() {
  yield fork(takeLatest, UPLOAD_PHOTO, loadAWSPut)
}