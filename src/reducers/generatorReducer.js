import {
  MODEL_RESET,
  SHOW_NUTRITION_MIXERS
} from '../constants/ActionTypes'

const initialState = {
  showNutritionMixers: false
}
export default function generator(state = initialState, action) {
  switch (action.type) {
    case MODEL_RESET:
      return {
        ...state,
        showNutritionMixers: false
      }
    case SHOW_NUTRITION_MIXERS:
      return {
        ...state,
        showNutritionMixers: true
      }
    default:
      return state
  }
}