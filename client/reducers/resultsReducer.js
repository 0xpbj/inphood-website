import {
  LABEL_DATA,
  GET_LABEL_ID,
} from '../constants/ActionTypes'

const initialState = {
  labelId: '',
  data: {}
}
export default function results(state = initialState, action) {
  switch (action.type) {
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
    default:
      return state
  }
}