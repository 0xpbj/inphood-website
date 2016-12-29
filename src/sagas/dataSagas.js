import {
  IG_LOGIN_REQUEST, IG_LOGIN_SUCCESS, IG_LOGIN_ERROR,
  IG_LOGOUT_REQUEST, IG_LOGOUT_SUCCESS, IG_LOGOUT_ERROR,
  IG_PHOTOS_SUCCESS, IG_PHOTOS_ERROR, IG_PROFILE_SUCCESS,
  IG_PROFILE_ERROR, IG_REFRESH_REQUEST,
} from '../constants/ActionTypes'

import { take, put, call, fork, select, takeLatest } from 'redux-saga/effects'
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

const igLogout = () => {
  return Hello('instagram').logout()
}

function* igLoginFlow() {
  try {
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

function* igLogoutFlow() {
  try {
    yield call (igLogout)
    yield put({type: IG_LOGOUT_SUCCESS})
  }
  catch(error) {
    yield put ({type: IG_LOGOUT_ERROR, error})
  }
}

function* igRefreshFlow() {
  const {photos} = yield call (igPhotos)
  yield put({type: IG_PHOTOS_SUCCESS, photos})
}

export default function* root() {
  yield fork(takeLatest, IG_LOGIN_REQUEST, igLoginFlow)
  yield fork(takeLatest, IG_LOGOUT_REQUEST, igLogoutFlow)
  yield fork(takeLatest, IG_REFRESH_REQUEST, igRefreshFlow)
}