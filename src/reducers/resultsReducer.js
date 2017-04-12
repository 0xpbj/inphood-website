import {
  LABEL_DATA,
  GET_LABEL_ID,
  SET_TITLE,
  SELECTED_PHOTO,
  CLEAR_DATA,
  SET_SHARE_URL,
  SAVE_LABEL_AWS
} from '../constants/ActionTypes'

const initialState = {
  labelId: '',
  data: {},
  title: '',
  picture: '',
  shareUrl: '',
  embedUrl: '',
  inProgress: false
}
export default function results(state = initialState, action) {
  switch (action.type) {
    case CLEAR_DATA:
      return {
        labelId: '',
        data: {},
        title: '',
        picture: '',
        shareUrl: '',
        inProgress: false
      }
    case SAVE_LABEL_AWS:
      return {
        ...state,
        inProgress: true
      }
    case LABEL_DATA:
      return {
        ...state,
        data: action.data
      }
    case GET_LABEL_ID:
      return {
        ...state,
        labelId: action.labelId
      }
    case SELECTED_PHOTO:
      return {
        ...state,
        file: action.photo,
        picture: action.photo.preview,
      }
    case SET_TITLE:
      return {
        ...state,
        title: action.title
      }
    case SET_SHARE_URL:
      return {
        ...state,
        shareUrl: action.shareUrl,
        embedUrl: action.embedUrl,
        inProgress: false
      }
    default:
      return state
  }
}