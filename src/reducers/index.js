import { combineReducers } from 'redux'
import nutritionReducer from './nutritionReducer'
import modelReducer from './modelReducer'
import resultsReducer from './resultsReducer'
import servingsControlsReducer from './servingsControllerReducer'
import ingredientControllerReducer from './ingredientControllerReducer'
import fdaReducer from './fdaReducer'
import searchReducer from './searchReducer'

const appReducer = combineReducers({
    modelReducer,
    nutritionReducer,
    resultsReducer,
    servingsControlsReducer,
    ingredientControllerReducer,
    fdaReducer,
    searchReducer
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
