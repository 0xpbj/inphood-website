import {
  IG_LOGIN_REQUEST,
  IG_LOGOUT_REQUEST,
  IG_REFRESH_REQUEST,
} from '../constants/ActionTypes'

export function igLoginRequest() {
  return {
    type: IG_LOGIN_REQUEST
  }
}

export function igLogoutRequest() {
  return {
    type: IG_LOGOUT_REQUEST
  }
}

export function igRefreshRequest() {
  return {
    type: IG_REFRESH_REQUEST
  }
}