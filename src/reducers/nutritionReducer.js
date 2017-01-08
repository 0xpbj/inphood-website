import { 
  AN_CLEAR_DATA,
  AN_ADD_CAPTION,
  AN_SELECTED_PHOTO,
  IG_SELECTED_PHOTO,
  IG_UPDATED_CAPTION,
  RESULT_URL,
} from '../constants/ActionTypes'

const initialState = {
  link: '',
  picture: '',
  caption: '',
  username: '',
  anonymous: false,
  resultUrl: '',
}
export default function nutrition(state = initialState, action) {
  switch (action.type) {
    case AN_CLEAR_DATA:
      return {
        ...initialState
      }
    case AN_ADD_CAPTION:
      return {
        ...state,
        caption: action.caption
      }
    case AN_SELECTED_PHOTO:
      return {
        ...state,
        anonymous: true,
        picture: action.photo,
        link: '',
        username: 'anonymous',
      }
    case IG_SELECTED_PHOTO:
      return {
        ...state,
        link: action.photo.link,
        picture: action.photo.picture,
        caption: action.photo.caption.text,
        username: action.photo.user.username
      }
    case IG_UPDATED_CAPTION:
      return {
        ...state,
        caption: action.caption
      }
    case RESULT_URL:
      return {
        ...state,
        resultUrl: action.url
      }
    default:
      return state
  }
}