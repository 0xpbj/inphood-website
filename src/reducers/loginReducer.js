import {
  CLEAR_DATA,
  INIT_LOG_IN,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_SUCCESS,
  CANCEL_LOG_IN,
} from '../constants/ActionTypes'

const initialState = {
  initLogin: false,
  result: null,
  error: null,
}
export default function loginReducer(state = initialState, action) {
  switch (action.type) {
    case CLEAR_DATA:
      return {
        initLogin: false,
        result: null,
        error: null
      }
    case INIT_LOG_IN:
      return {
        ...state,
        initLogin: true
      }
    case CANCEL_LOG_IN:
      return {
        ...state,
        initLogin: false
      }
    case LOGIN_ERROR:
      return {
        ...state,
        result: null,
        error: action.error
      }
    case LOGIN_SUCCESS:
      return {
        ...state,
        result: action.result,
        error: null,
        initLogin: false
      }
    case LOGOUT_SUCCESS:
      return {
        ...state,
        result: null,
        error: null
      }
    default:
      return state
  }
}