import {
  INIT_LOG_IN,
  INIT_LOG_OUT,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_SUCCESS,
  CANCEL_LOG_IN,
  LOGIN_REQUEST,
  EM_LOGIN_REQUEST,
  ANONYMOUS_FLOW,
  PROMPT_LOG_OUT,
  CANCEL_LOG_OUT
} from '../constants/ActionTypes'

import {REHYDRATE} from 'redux-persist/constants'

const initialState = {
  initLogin: false,
  inProgress: false,
  result: null,
  error: null,
  promptLogout: false
}
export default function loginReducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return {
        ...action.payload.loginReducer
      }
    case INIT_LOG_IN:
      return {
        ...state,
        initLogin: true,
        inProgress: false
      }
    case INIT_LOG_OUT:
      return {
        ...state,
        promptLogout: false
      }
    case ANONYMOUS_FLOW:
      return {
        ...state,
        initLogin: false,
        inProgress: false,
        error: null,
        result: 'anonymous'
      }
    case CANCEL_LOG_IN:
      return {
        ...state,
        initLogin: false,
        error: null,
        inProgress: false
      }
    case LOGIN_ERROR:
      return {
        ...state,
        result: null,
        error: action.error,
        inProgress: false
      }
    case LOGIN_SUCCESS:
      return {
        ...state,
        result: action.result,
        error: null,
        initLogin: false,
        inProgress: false
      }
    case LOGOUT_SUCCESS:
      return {
        ...state,
        result: null,
        error: null
      }
    case EM_LOGIN_REQUEST:
    case LOGIN_REQUEST:
      return {
        ...state,
        inProgress: true
      }
    case PROMPT_LOG_OUT:
      return {
        ...state,
        promptLogout: true
      }
    case CANCEL_LOG_OUT:
      return {
        ...state,
        promptLogout: false
      }
    default:
      return state
  }
}