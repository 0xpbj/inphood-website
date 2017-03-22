import { combineReducers } from 'redux'
import searchReducer from './searchReducer'
import resultsReducer from './resultsReducer'
import tagModelReducer from './tagModelReducer'
import nutritionReducer from './nutritionReducer'
import nutritionModelReducer from './nutritionModelReducer'
import ingredientControlModelReducer from './ingredientControlModelReducer'
import servingsControlsReducer from './servingsControllerReducer'

const appReducer = combineReducers({
    searchReducer,
    resultsReducer,
    tagModelReducer,
    nutritionReducer,
    nutritionModelReducer,
    ingredientControlModelReducer,
    servingsControlsReducer
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
