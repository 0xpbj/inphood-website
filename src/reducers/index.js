import { combineReducers } from 'redux'
import dataReducer from './dataReducer'

const appReducer = combineReducers({
    dataReducer
})

const rootReducer = (state, action) => {
  // if (action.type === LOGOUT_SUCCESS) { 
  //   state = undefined
  // }
  return appReducer(state, action)
}

export default rootReducer
