import {
  MODEL_RESET,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  NM_SET_SERVINGS,
  NM_SCALE_INGREDIENT,
  NM_SET_LABEL_TYPE
} from '../constants/ActionTypes'

import {NutritionModel} from '../components/models/NutritionModel'

const initialState = {
  nutritionModel: new NutritionModel()
}

export default function nmModelFun(state = initialState, action) {
  switch (action.type) {
    case MODEL_RESET:
    {
      return {
        nutritionModel: new NutritionModel()
      }
    }
    case NM_ADD_INGREDIENT:
    {
      let {nutritionModel} = state
      nutritionModel.addIngredient(action.tag, action.ingredientModel, action.quantity, action.unit, action.append)
      return {
        ...state,
        nutritionModel: nutritionModel
      }
    }
    case NM_REM_INGREDIENT:
    {
      let {nutritionModel} = state
      nutritionModel.removeIngredient(action.tag)
      return {
        ...state,
        nutritionModel: nutritionModel
      }
    }
    case NM_SET_SERVINGS:
    {
      let {nutritionModel} = state
      const servingsControlModel = action.servingsControlModel
      nutritionModel.setSuggestedServingAmount(servingsControlModel.getValue(),
                                               servingsControlModel.getUnit(),
                                               servingsControlModel.getDisplayUnitCount(),
                                               servingsControlModel.getDisplayUnit())
      return {
        ...state,
        nutritionModel: nutritionModel
      }
    }
    case NM_SCALE_INGREDIENT:
    {
      let {nutritionModel} = state
      nutritionModel.scaleIngredientToUnit(action.tag, action.value, action.units)
      return {
        ...state,
        nutritionModel: nutritionModel
      }
    }
    case NM_SET_LABEL_TYPE:
    {
      let {nutritionModel} = state
      nutritionModel.setLabelType(action.labelType)
      return {
        ...state,
        nutritionModel
      }
    }
    default:
      return state
  }
}
