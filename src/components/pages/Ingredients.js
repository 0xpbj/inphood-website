const React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Well from 'react-bootstrap/lib/Well'
import * as constants from '../../constants/Constants'

// Returns an array of mass, scaledIngredient pairs that have been sorted in
// order of descending mass.
function getSortedMassScaledIngredPairs(nutritionModel) {
  const ingredientIds = nutritionModel.getIds()

  let massScaledIngredArr = []

  for (let id of ingredientIds) {
    const scaledIngredient = nutritionModel.getScaledIngredient(id)
    const ingredientMass = scaledIngredient.getQuantityInGrams()
    massScaledIngredArr.push({ingredientMass, scaledIngredient})
  }

  massScaledIngredArr.sort(function(a, b) {
    return b.ingredientMass - a.ingredientMass
  });

  return massScaledIngredArr
}

// The ingredients and contains statement as required under FALCPA are described
// in depth here:
//
//   https://www.fda.gov/Food/GuidanceRegulation/GuidanceDocumentsRegulatoryInformation/LabelingNutrition/ucm064880.htm
//
export default class Ingredients extends React.Component {
  render() {
    let nutritionModel = this.props.nutritionModel

    // Get the scaled ingredients from the nutrition model
    // Sort them by mass
    // Produce an ingredients list
    // Produce a contains list
    //
    const massScaledIngredArr =
      getSortedMassScaledIngredPairs(nutritionModel)
    //
    //
    let ingredients = ''
    for (let idx = 0; idx < massScaledIngredArr.length; ++idx) {
      const {scaledIngredient} = massScaledIngredArr[idx]
      const ingredientModel = scaledIngredient.getIngredientModel()
      const description = ingredientModel.getTag() //ingredientModel.getKey()
      ingredients += description
      if (idx !== massScaledIngredArr.length - 1) {
        ingredients += ', '
      }
    }
    if (ingredients === '') {
      return null
    }
    //
    //
    let contains = ''
    //
    //
    return(
      <Row style={{
          width:constants.LABEL_WIDTH, 
          margin:'auto', 
          marginTop:(constants.VERT_SPACE-2),
          marginLeft: 2
      }}>
        <b>INGREDIENTS:&nbsp;</b>{ingredients.toUpperCase()}
      </Row>
    )
  }
}
