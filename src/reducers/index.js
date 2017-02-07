import { combineReducers } from 'redux'
import userReducer from './userReducer'
import nutritionReducer from './nutritionReducer'
import modelReducer from './modelReducer'
import resultsReducer from './resultsReducer'

const appReducer = combineReducers({
    userReducer,
    modelReducer,
    nutritionReducer,
    resultsReducer,
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
