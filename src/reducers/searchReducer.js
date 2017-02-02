import {
  SEARCH_INGREDIENT,
  SEARCH_RESULT,
  SEARCH_ERROR
} from '../constants/ActionTypes'

const initialState = {
  searchIngredient: '',
  searchResults: [],
  searchError: ''
}
export default function nutrition(state = initialState, action) {
  switch (action.type) {
    case SEARCH_INGREDIENT:
      return {
        ...state,
        searchIngredient: action.searchIngredient
    }
    case SEARCH_RESULT:
      return {
        ...state,
        searchResults: action.data
      }
    case SEARCH_ERROR:
      return {
        ...state,
        searchError: 'search term not found'
      }
    default:
      return state
  }
}
