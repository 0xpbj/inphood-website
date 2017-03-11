import {
  INIT_SUPER_SEARCH,
  SUPER_SEARCH_RESULTS,
} from '../constants/ActionTypes'

import {MatchResultsModel} from '../components/models/MatchResultsModel'

const initialState = {
  ingredient: '',
  matchResultsModel: new MatchResultsModel(),
  searching: false
}
export default function matches(state = initialState, action) {
  switch (action.type) {
    case INIT_SUPER_SEARCH:
      return {
        ...state,
        searching: action.flag,
        ingredient: '',
        matchResultsModel: new MatchResultsModel()
      }
    case SUPER_SEARCH_RESULTS:
      return {
        ...state,
        ingredient: action.ingredient,
        matchResultsModel: action.matchResultsModel,
        searching: false
      }
    default:
      return state
  }
}
