import {
  INIT_SUPER_SEARCH,
  SUPER_SEARCH_RESULTS,
} from '../constants/ActionTypes'

const initialState = {
  ingredient: '',
  matches: [],
  searching: false
}
export default function matches(state = initialState, action) {
  switch (action.type) {
    case INIT_SUPER_SEARCH:
      return {
        ...state,
        searching: action.flag,
        ingredient: '',
        matches: []
      }
    case SUPER_SEARCH_RESULTS:
      return {
        ...state,
        ingredient: action.ingredient,
        matches: action.matches,
        searching: false
      }
    default:
      return state
  }
}