import {
  SAVE_TO_CLOUD,
  SELECTED_PHOTO
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
const firebase = require('firebase')
const Config = require('Config')
const S3 = require('aws-sdk').S3

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
  const {key} = yield select(state => state.nutritionReducer)
  const {title, file} = yield select(state => state.resultsReducer)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  let iUrl = 'null.jpg'
  let iTitle = title ? title : ''
  if (file) {
    const extension = file.name.substr(file.name.lastIndexOf('.'))
    yield call (uploadImageToS3, file, key, user, extension)
    iUrl = 'http://www.image.inphood.com/'+user+'/'+key+extension
  }
  firebase.database().ref('/global/nutritionLabel/' + user + '/' + key).update({
    iUrl,
    title: iTitle,
  })
}

export default function* root() {
  yield fork(takeLatest, [SAVE_TO_CLOUD, SELECTED_PHOTO], loadAWSPut)
}