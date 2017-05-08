import {
  INIT_LOG_IN,
  INIT_LOG_OUT,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_SUCCESS,
  EM_LOGIN_REQUEST
} from '../constants/ActionTypes'

import {REHYDRATE} from 'redux-persist/constants'

import { race, take, put, call, fork, select, takeLatest } from 'redux-saga/effects'
const Config = require('Config')
const firebase = require('firebase')
import Fingerprint2 from 'fingerprintjs2'

const login = (provider) => {
  return firebase.auth().signInWithPopup(provider)
  .then(result => ({ result }))
  .catch(error => ({ error }))
}

function* socialFlow() {
  const {flag} = yield take (LOGIN_REQUEST)
  var provider = null
  if (flag === 1) {
    provider = new firebase.auth.FacebookAuthProvider()
  }
  else if (flag === 2) {
    provider = new firebase.auth.GoogleAuthProvider()
  }
  else if (flag === 3) {
    provider = new firebase.auth.TwitterAuthProvider()
  }
  const {result, error} = yield call (login, provider)
  if (error) {
    yield put ({type: LOGIN_ERROR, error})
  }
  else {
    yield put({type: LOGIN_SUCCESS, result})
  }
}

const emLogin = (user, password, signup) => {
  if (signup) {
    return firebase.auth().createUserWithEmailAndPassword(user, password)
    .catch(error => ({ error }))
  }
  else {
    return firebase.auth().signInWithEmailAndPassword(user, password)
    .catch(error => ({ error }))  
  }
}

function* emailFlow() {
  const {user, password, signup} = yield take (EM_LOGIN_REQUEST)
  const {error} = yield call (emLogin, user, password, signup)
  if (error) {
    yield put ({type: LOGIN_ERROR, error})
  }
  else {
    yield put({type: LOGIN_SUCCESS, result: {user: firebase.auth().currentUser}})
  }
}

function* socialRace() {
  const { response, cancel } = yield race({
    response: call(socialFlow),
    cancel: take(EM_LOGIN_REQUEST)
  })
}

function* emailRace() {
  const { response, cancel } = yield race({
    response: call(emailFlow),
    cancel: take(LOGIN_REQUEST)
  })
}

const logout = () => {
  return firebase.auth().signOut()
  .then(() => ({}))
  .catch(error => ({ error }))
}

function* logoutFlow() {
  const {error} = yield call (logout)
  if (error) {
    yield put ({type: LOGOUT_ERROR, error})
  }
  else {
    yield put({type: LOGOUT_SUCCESS})
  }
}

function* userInfo() {
  if (!Config.DEBUG) {
    const path = '/global/inphoodLabel/analytics'
    const {result} = yield select(state => state.loginReducer)
    if (result) {
      const {user, credential} = result
      let {displayName, uid, email} = user
      email = email ? email : ''
      displayName = displayName ? displayName : 'unknown'
      const provider = credential ? credential.provider.substr(0, credential.provider.indexOf('.')) : 'email'
      var fulldate = Date.now()
      var dateValue = new Date(fulldate)
      var date = dateValue.toDateString()
      Fingerprint2().get(function(fingerprint) {
        firebase.database().ref('/global/inphoodLabel/analytics/users/' + uid + '/userInfo/').update({
          date,
          email,
          fulldate,
          provider,
          fingerprint,
          displayName
        })
        firebase.database().ref('/global/inphoodLabel/analytics/' + provider + '/' + uid).push({
          date,
          fulldate,
        })
      })
    }
  }
}

export default function* root() {
  yield fork(takeLatest, [LOGIN_SUCCESS, REHYDRATE], userInfo)
  yield fork(takeLatest, [INIT_LOG_IN, LOGIN_ERROR], socialRace)
  yield fork(takeLatest, [INIT_LOG_IN, LOGIN_ERROR], emailRace)
  yield fork(takeLatest, INIT_LOG_OUT, logoutFlow)
}
