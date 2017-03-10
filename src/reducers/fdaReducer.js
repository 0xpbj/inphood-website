import {
  SET_FDA_RESULTS,
} from '../constants/ActionTypes'

import {IngredientModel} from '../components/models/IngredientModel'

const initialState = {
  results: []
}

export default function results(state = initialState, action) {
  switch (action.type) {
    case SET_FDA_RESULTS:
      // console.log('fdaReducer SET_FDA_RESULTS:');
      // console.log('-----------------------------------------------------------')
      // const fdaBrandedResults = action.results
      // if (fdaBrandedResults.hasOwnProperty('count') &&
      //     fdaBrandedResults.hasOwnProperty('foods')) {
      //   for (let i = 0; i < fdaBrandedResults.count; i++) {
      //     const foodObject = foods[i]
      //
      //     if (!(foodObject.hasOwnProperty('desc')
      //           && foodObject.desc.hasOwnProperty('name'))) {
      //       continue
      //     }
      //
      //     const name = foodObject.desc.name
      //     let ingredientModel = new IngredientModel()
      //     ingredientModel.initializeFromBrandedFdaObj(foodObject)
      //   }
      // }
      //
      return {
        ...state,
        results: action.results
      }
    default:
      return state
  }
}
