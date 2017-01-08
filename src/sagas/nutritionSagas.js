import {
  IG_UPLOAD_PHOTO,
  RESULT_URL,
} from '../constants/ActionTypes'

import { call, fork, put, select, takeLatest } from 'redux-saga/effects'
import firebase from 'firebase'
import request from 'request'
const Config = require('Config')
var AWS = require('aws-sdk')

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
}

const uploadImageToS3 = (uri, key, username) => {
  var s3 = new AWS.S3({
    accessKeyId:     Config.AWS_ACCESS_ID,
    secretAccessKey: Config.AWS_SECRET_KEY,
    region: 'us-west-2', 
  })
  var options = {
    uri: uri,
    encoding: null
  }
  request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log("failed to get image", error)
      firebase.database().ref('/global/nutritionLabel/'+key).set({ 
        key,
        user: username,
        oUrl: uri,
        iUrl: ''
      })
    }
    else {
      s3.putObject({
        Body: body,
        Key: username + '/' + key + '.jpg',
        ACL: "public-read",
        Bucket: "inphoodlabels",
        ContentType: "image/jpeg"
      }, function(error, data) {
        if (error) {
          console.log("error downloading image to s3", error)
          firebase.database().ref('/global/nutritionLabel/'+key).set({ 
            key,
            user: username,
            oUrl: uri,
            iUrl: ''
          })
        } else {
          console.log("success uploading to s3", data)
        }
      })
      firebase.database().ref('/global/nutritionLabel/'+key).set({
        key,
        user: username,
        oUrl: uri,
        iUrl: 'http://label.inphood.com/' + username + '/' + key + '.jpg'
      })
    }
  })
}

function* loadAWSPut() {
  const {profile} = yield select(state => state.userReducer)
  const {link, picture, username} = yield select(state => state.nutritionReducer)
  const slink = link.slice(0, link.length - 1)
  yield call (firebaseLogin)
  let key = ''
  if (!profile) {
    key = firebase.database().ref('/global/nutritionLabel/anonymous').push().key
  }
  else {
    key = slink.substring(slink.lastIndexOf('/')+1)
  }
  yield call (uploadImageToS3, picture, key, username)
  const url = "www.inphood.com/" + key
  yield put ({type: RESULT_URL, url})
}

export default function* root() {
  yield fork(takeLatest, IG_UPLOAD_PHOTO, loadAWSPut)
}
