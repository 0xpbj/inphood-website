import { combineReducers } from 'redux'
import userReducer from './userReducer'
import nutritionReducer from './nutritionReducer'
import modelReducer from './modelReducer'
import resultsReducer from './resultsReducer'
import searchReducer from './searchReducer'

const appReducer = combineReducers({
    userReducer,
    modelReducer,
    nutritionReducer,
    resultsReducer,
    searchReducer
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
