import {
  PARSE_SEARCH_DATA,
  PARSE_SEARCH_FDA_DATA,
  GET_MORE_DATA,
  CLOSE_SEARCH_MODAL,
  ADD_SEARCH_SELECTION
} from '../constants/ActionTypes'

const initialState = {
  firebaseSearch: false,
  fdaSearch: false,
  showModal: false
}
export default function matches(state = initialState, action) {
  switch (action.type) {
    case PARSE_SEARCH_DATA:
      return {
        ...state,
        ingredient: action.ingredient,
        firebaseSearch: true
      }
    case PARSE_SEARCH_FDA_DATA:
      return {
        ...state,
        ingredient: action.ingredient,
        fdaSearch: true
      }
    case GET_MORE_DATA:
      return {
        ...state,
        showModal: true,
      }
    case CLOSE_SEARCH_MODAL:
      return {
        ...state,
        showModal: false,
      }
    case ADD_SEARCH_SELECTION:
      return {
        ...state,
        showModal: false,
      }
    default:
      return state
  }
}
