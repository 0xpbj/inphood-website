import {
  IG_LOGIN_REQUEST, IG_LOGIN_SUCCESS, IG_LOGIN_ERROR
} from '../constants/ActionTypes'


import { take, put, call, fork, select } from 'redux-saga/effects'
import fetch from 'isomorphic-fetch'

export function fetchAccessToken() {
  // return fetch(`http://www.reddit.com/r/${reddit}.json` )
  return fetch('https://api.instagram.com/oauth/authorize/?client_id=7ca65e72ec6f4763aae5ad5e3779a1f8redirect_uri=REDIRECT-URI&response_type=token')
  .then(response => ({response.json()}))
}

export function* fetchPosts() {
  try {
    // yield take(IG_LOGIN_REQUEST)
    const response = yield call(fetchAccessToken)
    console.log('IG response: ', response)
    yield put({type: IG_LOGIN_SUCCESS})
  }
  catch(error) {
    yield put ({type: IG_LOGIN_ERROR, error})
  }
}

export default function* root() {
  yield fork(fetchPosts)
}