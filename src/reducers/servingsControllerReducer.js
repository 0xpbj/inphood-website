import {SC_STORE_VALUES} from '../constants/ActionTypes'

const initialState = {
  servingsControls: {
    value: 2,
    unit: 'people',
    min: 1,
    max: 24,
    step: 1
  }
}

export default function servingsControllerReducerLogic(state = initialState, action) {
  switch (action.type) {
    case SC_STORE_VALUES:
    {
      return {
        ...state,
        servingsControls: action.servingsControls
      }
    }
    default:
      return state
  }
}
