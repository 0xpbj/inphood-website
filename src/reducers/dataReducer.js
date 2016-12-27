import { CONNECTION_INACTIVE } from '../constants/ActionTypes'

const initialState = {}

export default function authentication(state = initialState, action) {
  switch (action.type) {
    case CONNECTION_INACTIVE:
      return {
        ...state,
      }
    default:
      return state
  }
}