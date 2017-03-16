import {
  INIT_SUPER_SEARCH,
  SUPER_SEARCH_RESULTS,
  FDA_SEARCH_RESULTS_FLAG,
} from '../constants/ActionTypes'

import {MatchResultsModel} from '../components/models/MatchResultsModel'

const initialState = {
  ingredient: '',
  matchResultsModel: new MatchResultsModel(),
  firebaseSearch: false,
  fdaSearch: false
}
export default function matches(state = initialState, action) {
  switch (action.type) {
    case INIT_SUPER_SEARCH:
      return {
        ...state,
        firebaseSearch: action.flag,
        fdaSearch: action.flag,
        ingredient: '',
        matchResultsModel: new MatchResultsModel()
      }
    case SUPER_SEARCH_RESULTS:
      return {
        ...state,
        ingredient: action.ingredient,
        matchResultsModel: action.matchResultsModel,
        firebaseSearch: false
      }
    case FDA_SEARCH_RESULTS_FLAG:
      return {
        ...state,
        fdaSearch: false
      }
    default:
      return state
  }
}
