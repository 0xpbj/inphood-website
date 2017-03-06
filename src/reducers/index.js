import { combineReducers } from 'redux'
import nutritionReducer from './nutritionReducer'
import modelReducer from './modelReducer'
import resultsReducer from './resultsReducer'
import servingsControlsReducer from './servingsControllerReducer'
import ingredientControllerReducer from './ingredientControllerReducer'

const appReducer = combineReducers({
    modelReducer,
    nutritionReducer,
    resultsReducer,
    servingsControlsReducer,
    ingredientControllerReducer
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
