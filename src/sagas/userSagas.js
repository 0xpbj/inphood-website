import {
  IG_LOGIN_REQUEST, IG_LOGIN_SUCCESS, IG_LOGIN_ERROR,
  IG_LOGOUT_REQUEST, IG_LOGOUT_SUCCESS, IG_LOGOUT_ERROR,
  IG_PHOTOS_SUCCESS, IG_PHOTOS_ERROR, IG_PROFILE_SUCCESS,
  IG_PROFILE_ERROR, IG_REFRESH_REQUEST,
} from '../constants/ActionTypes'

import { take, put, call, fork, select, takeLatest } from 'redux-saga/effects'
import Hello from 'hellojs'
const Config = require('Config')

const igLogin = () => {
  Hello.init({
      instagram : Config.instagram
  },{
      scope : 'basic+public_content',
      redirect_uri: Config.redirect_uri
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