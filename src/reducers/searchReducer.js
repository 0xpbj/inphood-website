import {
  SUPER_SEARCH_RESULTS,
} from '../constants/ActionTypes'

const initialState = {
  ingredient: '',
  matches: []
}
export default function matches(state = initialState, action) {
  switch (action.type) {
    case SUPER_SEARCH_RESULTS:
      return {
        ...state,
        ingredient: action.ingredient,
        matches: action.matches
      }
    default:
      return state
  }
}