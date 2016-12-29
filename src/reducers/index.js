import { combineReducers } from 'redux'
import userReducer from './userReducer'
import nutritionReducer from './nutritionReducer'

const appReducer = combineReducers({
    userReducer,
    nutritionReducer,
})

const rootReducer = (state, action) => {
  // if (action.type === LOGOUT_SUCCESS) { 
  //   state = undefined
  // }
  return appReducer(state, action)
}

export default rootReducer
