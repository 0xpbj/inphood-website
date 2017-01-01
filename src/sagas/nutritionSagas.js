import {
  SELECTED_PHOTO,
} from '../constants/ActionTypes'

import { take, put, call, fork, select, takeLatest } from 'redux-saga/effects'
import fetch from 'isomorphic-fetch'

// var request = require('request')

const uploadImageToS3 = (uri) => {
  // var options = {
  //     uri: uri,
  //     encoding: null
  // };
  // request(options, function(error, response, body) {
  //   if (error || response.statusCode !== 200) {
  //     console.log("failed to get image");
  //     console.log(error);
  //   }
  //   else {
  //     s3.putObject({
  //       Body: body,
  //       Key: path,
  //       Bucket: 'bucket_name'
  //     }, function(error, data) {
  //       if (error) {
  //         console.log("error downloading image to s3");
  //       } else {
  //         console.log("success uploading to s3");
  //       }
  //     });
  //   }
  // });
}

function* loadAWSPut() {
  const {photo} = yield select(state => state.nutritionReducer)
  yield call (uploadImageToS3, photo.picture)
}

export default function* root() {
  yield fork(takeLatest, SELECTED_PHOTO, loadAWSPut)
}
