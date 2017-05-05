import {
  LOGIN_REQUEST,
  LOGIN_ERROR
} from '../constants/ActionTypes'

import { take, put, call, fork, select, takeLatest } from 'redux-saga/effects'
const Config = require('Config')
const firebase = require('firebase')

const login = (provider) => {
  firebase.auth().signInWithRedirect(provider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log('Result: ', result)
  }).catch(function(error) {
    // Handle Errors here.
    console.log('Error: ', error)
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
  });
}

function* loginFlow() {
  try {
    var provider
    const {facebook} = yield select(state => state.loginReducer)
    if (facebook) {
      console.log('Facebook login')
      provider = new firebase.auth.FacebookAuthProvider()
    }
    else {
      console.log('Google login')
      provider = new firebase.auth.GoogleAuthProvider()
    }
    yield call (login, provider)
    // yield put({type: FB_LOGIN_SUCCESS})
    // const {profile} = yield call (fbProfile)
    // yield put({type: FB_PROFILE_SUCCESS, profile})
  }
  catch(error) {
    yield put ({type: LOGIN_ERROR, error})
  }
}

function* fbLogoutFlow() {
  try {
    yield call (fbLogout)
    yield put({type: FB_LOGOUT_SUCCESS})
  }
  catch(error) {
    yield put ({type: FB_LOGOUT_ERROR, error})
  }
}

export default function* root() {
  yield fork(takeLatest, LOGIN_REQUEST, loginFlow)
  // yield fork(takeLatest, FB_LOGOUT_REQUEST, fbLogoutFlow)
}
