import { combineReducers } from 'redux'
import nutritionReducer from './nutritionReducer'
import modelReducer from './modelReducer'
import resultsReducer from './resultsReducer'
import servingsControlsReducer from './servingsControllerReducer'
import ingredientControllerReducer from './ingredientControllerReducer'
import fdaReducer from './fdaReducer'

const appReducer = combineReducers({
    modelReducer,
    nutritionReducer,
    resultsReducer,
    servingsControlsReducer,
    ingredientControllerReducer,
    fdaReducer
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
