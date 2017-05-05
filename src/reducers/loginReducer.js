import {
  CLEAR_DATA,
  INIT_LOG_IN,
  CANCEL_LOG_IN,
  LOGIN_REQUEST,
} from '../constants/ActionTypes'

const initialState = {
  initLogin: false,
  facebook: false,
  response: null,
}
export default function loginReducer(state = initialState, action) {
  switch (action.type) {
    case CLEAR_DATA:
      return {
        initLogin: false
      }
    case INIT_LOG_IN:
      return {
        ...state,
        initLogin: true
      }
    case LOGIN_REQUEST:
      return {
        ...state,
        facebook: action.flag
      }
    case CANCEL_LOG_IN:
      return {
        ...state,
        initLogin: false
      }
    default:
      return state
  }
}