import {
  SET_FDA_RESULTS,
} from '../constants/ActionTypes'

const initialState = {
  results: []
}
export default function results(state = initialState, action) {
  switch (action.type) {
    case SET_FDA_RESULTS:
      return {
        ...state,
        results: action.results
      }
    default:
      return state
  }
}