import { combineReducers } from 'redux'
import fdaReducer from './fdaReducer'
import searchReducer from './searchReducer'
import resultsReducer from './resultsReducer'
import tagModelReducer from './tagModelReducer'
import nutritionReducer from './nutritionReducer'
import nutritionModelReducer from './nutritionModelReducer'
import ingredientModelReducer from './ingredientModelReducer'
import servingsControlsReducer from './servingsControllerReducer'

const appReducer = combineReducers({
    fdaReducer,
    searchReducer,
    resultsReducer,
    tagModelReducer,
    nutritionReducer,
    nutritionModelReducer,
    ingredientModelReducer,
    servingsControlsReducer,
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
