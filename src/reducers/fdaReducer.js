import {
  SET_FDA_RESULTS,
} from '../constants/ActionTypes'

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
      //     if (!(foodObject.hasOwnProperty('desc') &&
      //         foodObject.desc.hasOwnProperty('name') &&
      //         foodObject.desc.hasOwnProperty('ndbno'))) {
      //       console.log('SKIPPING food object number ' + i + '(no desc/name/ndbno)')
      //       continue
      //     }
      //
      //     const description = foodObject.desc.name
      //     const ndbno = foodObject.desc.ndbno
      //
      //     if (!foodObject.hasOwnProperty('nutrients')) {
      //       console.log('SKIPPING food object number ' + i + '(no nutrients)')
      //       continue
      //     }
      //
      //     console.log('')
      //     console.log(description + "(" + ndbno + "):")
      //     console.log('=======================================================')
      //
      //     const nutrients = foodObject.nutrients
      //     for (let j = 0; j < nutrients.length; j++) {
      //       const nutrient = nutrients[j]
      //       console.log(nutrient.name + "(" + nutrient.unit + "):")
      //
      //       if (!foodObject.hasOwnProperty('measures')) {
      //         const measures = nutrient.measures
      //         for (let k = 0; k < measures.length; k++) {
      //           const measure = measures[k]
      //           console.log()
      //         }
      //       }
      //     }
      //
      //   }
      // }

      return {
        ...state,
        results: action.results
      }
    default:
      return state
  }
}
