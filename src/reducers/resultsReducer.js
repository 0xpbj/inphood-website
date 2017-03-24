import {
  LABEL_DATA,
  GET_LABEL_ID,
  SET_TITLE,
  SELECTED_PHOTO,
  CLEAR_DATA
} from '../constants/ActionTypes'

const initialState = {
  userId: '',
  labelId: '',
  data: {},
  title: '',
  picture: ''
}
export default function results(state = initialState, action) {
  switch (action.type) {
    case CLEAR_DATA:
      return {
        userId: '',
        labelId: '',
        data: {},
        title: '',
        picture: ''
      }
    case LABEL_DATA:
      return {
        ...state,
        data: action.data
      }
    case GET_LABEL_ID:
      return {
        ...state,
        userId: action.userId,
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
    default:
      return state
  }
}