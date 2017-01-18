import { combineReducers } from 'redux'
import userReducer from './userReducer'
import nutritionReducer from './nutritionReducer'
import resultsReducer from './resultsReducer'

const appReducer = combineReducers({
    userReducer,
    nutritionReducer,
    resultsReducer,
})

const rootReducer = (state, action) => {
  // if (action.type === LOGOUT_SUCCESS) { 
  //   state = undefined
  // }
  return appReducer(state, action)
}

export default rootReducer
