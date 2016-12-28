import {
  IG_LOGIN_REQUEST, IG_LOGIN_SUCCESS, IG_LOGIN_ERROR,
  IG_PHOTOS_SUCCESS, IG_PHOTOS_ERROR, IG_PROFILE_SUCCESS,
  IG_PROFILE_ERROR,
} from '../constants/ActionTypes'

import { take, put, call, fork, select } from 'redux-saga/effects'
import fetch from 'isomorphic-fetch'
import Hello from 'hellojs'

const igLogin = () => {
  Hello.init({
      instagram : '7ca65e72ec6f4763aae5ad5e3779a1f8'
  },{
      scope : 'basic+public_content+follower_list',
      redirect_uri:'http://127.0.0.1:3000/'
  });
  return Hello('instagram').login()
  .then(() => {})
}

const igProfile = () => {
  return Hello('instagram').api('me')
  .then(profile => ({ profile }))
}

const igPhotos = () => {
  return Hello('instagram').api('me/photos')
  .then(photos => ({ photos }))
}

function* igDataFlow() {
  try {
    yield take(IG_LOGIN_REQUEST)
    yield call (igLogin)
    yield put({type: IG_LOGIN_SUCCESS})
    const {profile} = yield call (igProfile)
    yield put({type: IG_PROFILE_SUCCESS, profile})
    const {photos} = yield call (igPhotos)
    yield put({type: IG_PHOTOS_SUCCESS, photos})
  }
  catch(error) {
    yield put ({type: IG_LOGIN_ERROR, error})
  }
}

export default function* root() {
  yield fork(igDataFlow)
}