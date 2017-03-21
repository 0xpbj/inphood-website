import { combineReducers } from 'redux'
import searchReducer from './searchReducer'
import resultsReducer from './resultsReducer'
import tagModelReducer from './tagModelReducer'
import nutritionReducer from './nutritionReducer'
import nutritionModelReducer from './nutritionModelReducer'
import ingredientModelReducer from './ingredientModelReducer'
import servingsControlsReducer from './servingsControllerReducer'
import generatorReducer from './generatorReducer'

const appReducer = combineReducers({
    searchReducer,
    resultsReducer,
    tagModelReducer,
    nutritionReducer,
    nutritionModelReducer,
    ingredientModelReducer,
    generatorReducer,
    servingsControlsReducer,
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
