import {SC_STORE_MODEL} from '../constants/ActionTypes'

import {ServingsControlModel} from '../components/models/ServingsControlModel'

const initialState = {
  servingsControlModel: new ServingsControlModel()
}

export default function servingsControllerReducerLogic(state = initialState, action) {
  switch (action.type) {
    case SC_STORE_MODEL:
    {
      return {
        ...state,
        servingsControlModel: action.servingsControlModel
      }
    }
    default:
      return state
  }
}
