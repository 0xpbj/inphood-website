import {
  UPLOAD_PHOTO,
} from '../constants/ActionTypes'

import { call, fork, select, takeLatest } from 'redux-saga/effects'
import request from 'request'

const uploadImageToS3 = (uri) => {
  var AWS = require('aws-sdk')
  AWS.config.region = 'us-west-2'
  var s3 = new AWS.S3({
    accessKeyId:     "AKIAI25XHNISG4KDDM3Q",
    secretAccessKey: "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"
  })
  var options = {
    uri: uri,
    encoding: null
  }
  request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log("failed to get image")
    }
    else {
      s3.putObject({
        Body: body,
        Key: "data/test.jpeg",
        ACL: "public-read",
        Bucket: "inphoodlabels",
        ContentType: "image/jpeg"
      }, function(error, data) {
        if (error) {
          console.log("error downloading image to s3", error)
        } else {
          console.log("success uploading to s3", data)
        }
      })
    }
  })
}

function* loadAWSPut() {
  const {photo} = yield select(state => state.nutritionReducer)
  yield call (uploadImageToS3, photo.picture)
}

export default function* root() {
  yield fork(takeLatest, UPLOAD_PHOTO, loadAWSPut)
}
