import {
  MODEL_RESET,
  IM_ADD_CONTROL_MODEL,
  IM_UPDATE_MODEL,
  IM_REM_INGREDIENT_TAG,
} from '../constants/ActionTypes'

const initialState = {
  ingredientControlModels: {},
}

export default function imModelFun(state = initialState, action) {
  switch (action.type) {
    case MODEL_RESET:
    {
      return {
        ingredientControlModels: {},
      }
    }
    case IM_ADD_CONTROL_MODEL:
    {
      let {ingredientControlModels} = state
      ingredientControlModels[action.id] = action.ingredientControlModel
      return {
        ...state,
        ingredientControlModels: ingredientControlModels
      }
    }
    case IM_UPDATE_MODEL:
    {
      let {ingredientControlModels} = state
      ingredientControlModels[action.id] = action.ingredientControlModel
      return {
        ...state,
        ingredientControlModels: ingredientControlModels
      }
    }
    case IM_REM_INGREDIENT_TAG:
    {
      let {ingredientControlModels} = state
      delete ingredientControlModels[action.id]
      return {
        ...state,
        ingredientControlModels: ingredientControlModels
      }
    }
    default:
      return state
  }
}
