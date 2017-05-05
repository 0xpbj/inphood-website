import { combineReducers } from 'redux'
import loginReducer from './loginReducer'
import searchReducer from './searchReducer'
import resultsReducer from './resultsReducer'
import tagModelReducer from './tagModelReducer'
import nutritionReducer from './nutritionReducer'
import nutritionModelReducer from './nutritionModelReducer'
import servingsControlsReducer from './servingsControllerReducer'
import ingredientControlModelReducer from './ingredientControlModelReducer'

const appReducer = combineReducers({
    loginReducer,
    searchReducer,
    resultsReducer,
    tagModelReducer,
    nutritionReducer,
    nutritionModelReducer,
    servingsControlsReducer,
    ingredientControlModelReducer,
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
