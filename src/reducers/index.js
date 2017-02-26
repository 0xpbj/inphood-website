import { combineReducers } from 'redux'
import nutritionReducer from './nutritionReducer'
import modelReducer from './modelReducer'
import resultsReducer from './resultsReducer'

const appReducer = combineReducers({
    modelReducer,
    nutritionReducer,
    resultsReducer,
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
