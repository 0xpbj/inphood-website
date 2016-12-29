import { 
  SELECTED_PHOTO,
} from '../constants/ActionTypes'

const initialState = {
  photo: {},
}
export default function nutrition(state = initialState, action) {
  switch (action.type) {
    case SELECTED_PHOTO:
      return {
        ...state,
        photo: action.photo
      }
    default:
      return state
  }
}