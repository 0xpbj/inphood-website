import { combineReducers } from 'redux'
import nutritionReducer from './nutritionReducer'
import modelReducer from './modelReducer'
import resultsReducer from './resultsReducer'
import servingsControlsReducer from './servingsControllerReducer'

const appReducer = combineReducers({
    modelReducer,
    nutritionReducer,
    resultsReducer,
    servingsControlsReducer
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
