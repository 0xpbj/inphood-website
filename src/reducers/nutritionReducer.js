import { 
  AN_CLEAR_DATA,
  AN_ADD_CAPTION,
  AN_SELECTED_PHOTO,
  IG_SELECTED_PHOTO,
  IG_UPDATED_CAPTION,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
} from '../constants/ActionTypes'

const initialState = {
  link: '',
  picture: '',
  caption: '',
  username: '',
  anonymous: false,
  resultUrl: '',
  key: '',
  composite: '',
  full: ''
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
        resultUrl: action.url,
        key: action.key,
        anonymous: action.anonymous,
      }
    case SEND_SERIALIZED_DATA:
      return {
        ...state,
        composite: action.composite,
        full: action.full
      }
    default:
      return state
  }
}