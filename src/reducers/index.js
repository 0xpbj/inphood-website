import { combineReducers } from 'redux'
import userReducer from './userReducer'
import nutritionReducer from './nutritionReducer'
import resultsReducer from './resultsReducer'
import searchReducer from './searchReducer'

const appReducer = combineReducers({
    userReducer,
    nutritionReducer,
    resultsReducer,
    searchReducer
})

const rootReducer = (state, action) => {
  // if (action.type === LOGOUT_SUCCESS) { 
  //   state = undefined
  // }
  return appReducer(state, action)
}

export default rootReducer
