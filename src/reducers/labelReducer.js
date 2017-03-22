import {
  SET_LABEL_TYPE
} from '../constants/ActionTypes'

const initialState = {
  labelType: 'standard'
}
export default function label(state = initialState, action) {
  switch (action.type) {
    case SET_LABEL_TYPE:
      return {
        ...state,
        labelType: action.labelType
      }
    default:
      return state
  }
}