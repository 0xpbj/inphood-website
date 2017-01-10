import {
  IG_UPLOAD_PHOTO,
  POST_LABEL_ID,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import firebase from 'firebase'
import request from 'request'
import Hello from 'hellojs'
const Config = require('Config')
var AWS = require('aws-sdk')

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
}

const uploadImageToS3 = (uri, key, username, thumbnail) => {
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
      firebase.database().ref('/global/nutritionLabel/'+key).update({ 
        key,
        user: username,
        oUrl: uri,
        iUrl: '',
        thumbnail
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
          firebase.database().ref('/global/nutritionLabel/'+key).update({ 
            key,
            user: username,
            oUrl: uri,
            iUrl: '',
            thumbnail
          })
        } else {
          console.log("success uploading to s3", data)
        }
      })
      console.log('Thumbnail: ', thumbnail)
      firebase.database().ref('/global/nutritionLabel/'+key).update({
        key,
        user: username,
        oUrl: uri,
        iUrl: 'http://label.inphood.com/' + username + '/' + key + '.jpg',
        thumbnail
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
  let thumbnail = ''
  if (!profile) {
    key = firebase.database().ref('/global/nutritionLabel/anonymous').push().key
  }
  else {
    key = slink.substring(slink.lastIndexOf('/')+1)
    thumbnail = profile.thumbnail
  }
  yield call (uploadImageToS3, picture, key, username, thumbnail)
  const url = "www.inphood.com/" + key
  if (profile)
    yield put ({type: RESULT_URL, url, key, anonymous: false})
  else
    yield put ({type: RESULT_URL, url, key, anonymous: true})
}

function* loadSerializedData() {
  const {composite, full, key, anonymous} = yield select(state => state.nutritionReducer)
  if (anonymous)
    firebase.database().ref('/global/nutritionLabel/anonymous/' + key).update({
      composite,
      full
    })
  else
    firebase.database().ref('/global/nutritionLabel/' + key).update({
      composite,
      full
    })
}

function* postLabelData() {
  while (true) {
    const {labelId, comment} = yield take (POST_LABEL_ID)
    const token = Hello('instagram').getAuthResponse().access_token
    const url = 'https://api.instagram.com/v1/media/' + labelId + '/comments'
    console.log('LabelId: ', labelId)
    console.log('Comment: ', comment)
    console.log('Token: ', token)
    console.log('URL: ', url)
    var options = {
      url: url,
      method: 'post',
      form: {
        access_token: token, 
        text: comment
      }
    }
    request(options, function(error, response, body) { 
      console.log('Error: ', error)
      console.log('Response: ', response)
      console.log('Body: ', body)
    })
    // fetch(url, {
    //   mode: 'no-cors',
    //   method: 'post',
    //   form: {access_token: token, text: 'www.inphood.com/BPCIqRoDtV4'}
    // }).then(function(response) {
    //   console.log(response.status)
    //   console.log("response");
    //   console.log(response)
    // })
    // Hello( 'instagram' ).api( 'me/comments', 'post', {
    //   id: labelId,
    //   text: comment
    // })
    // .then(function(r) {
    //   if (r.meta.code === 200) {
    //     console.log('Comment Added')
    //   }
    // }, console.error.bind(console))
  }
}

export default function* root() {
  yield fork(postLabelData)
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadSerializedData)
  yield fork(takeLatest, IG_UPLOAD_PHOTO, loadAWSPut)
}
