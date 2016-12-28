import { 
  IG_PHOTOS_SUCCESS,
  IG_PROFILE_SUCCESS,
} from '../constants/ActionTypes'

const initialState = {
  photos: [],
  profile: null,
}
export default function igdata(state = initialState, action) {
  switch (action.type) {
    case IG_PHOTOS_SUCCESS:
      return {
        ...state,
        photos: action.photos
      }
    case IG_PROFILE_SUCCESS:
      return {
        ...state,
        profile: action.profile
      }
    default:
      return state
  }
}