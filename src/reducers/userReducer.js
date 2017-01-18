import { 
  IG_PHOTOS_SUCCESS,
  IG_LOGOUT_SUCCESS,
  IG_PROFILE_SUCCESS,
  IG_LOGIN_ERROR,
  IG_LOGOUT_ERROR,
  IG_PROFILE_ERROR,
} from '../constants/ActionTypes'

const initialState = {
  photos: [],
  profile: null,
  error: '',
  textFlow: null,
}
export default function igUser(state = initialState, action) {
  switch (action.type) {
    case IG_PHOTOS_SUCCESS:
      return {
        ...state,
        photos: action.photos
      }
    case IG_PROFILE_SUCCESS:
      return {
        ...state,
        profile: action.profile,
        textFlow: false
      }
    case IG_LOGOUT_SUCCESS:
      return {
        ...initialState
      }
    case IG_LOGIN_ERROR:
    case IG_LOGOUT_ERROR:
    case IG_PROFILE_ERROR:
      return {
        ...state,
        error: action.error
      }
    default:
      return state
  }
}