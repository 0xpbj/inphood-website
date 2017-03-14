const React = require('react')
import ReactGA from 'react-ga'
import Modal from 'react-bootstrap/lib/Modal'
import Button from 'react-bootstrap/lib/Button'
import Legend from 'recharts/lib/component/Legend'
import Tooltip from 'recharts/lib/component/Tooltip'
import RadialBar from 'recharts/lib/polar/RadialBar'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import RadialBarChart from 'recharts/lib/chart/RadialBarChart'
    
const style = {
  top: 0,
  left: 350,
  lineHeight: '24px'
}

export default class NutritionChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showNutritionModal: false
    }
  }
  getLabelData(ingredientModel) {
    const calories = ingredientModel.getCalories()
    const protien = ingredientModel.getTotalProteinPerServing()
    const carbs = ingredientModel.getTotalCarbohydratePerServing()
    const fat = ingredientModel.getTotalFatPerServing()
    const sodium = ingredientModel.getSodium()
    const sugar = ingredientModel.getSugars()
    return [
      {name: 'Calories', uv: calories, fill: '#8884d8'},
      {name: 'Protien', uv: protien, fill: '#83a6ed'},
      {name: 'Carbs', uv: carbs, fill: '#8dd1e1'},
      {name: 'Fat', uv: fat, fill: '#82ca9d'},
      {name: 'Sodium', uv: sodium, fill: '#a4de6c'},
      {name: 'Sugar', uv: sugar, fill: '#ffc658'},
    ]
  }
  render () {
    const {nutritionModel, tag} = this.props
    const {showNutritionModal} = this.state
    const ingredientModel = nutritionModel.getIngredientScaledToServing(tag)
    const scaledIngredient = nutritionModel.getScaledIngredient(tag)
    const quantity = scaledIngredient.getQuantity() / nutritionModel.getSuggestedServingValue()
    if (nutritionModel.getSuggestedServingUnit() !== 'people') {
      throw "Unable to scale ingredient for indvidual display"
    }
    const measure = scaledIngredient.getUnit()
    if (showNutritionModal) {
      ReactGA.event({
        category: 'User',
        action: 'User in ingredient nutrition modal',
        nonInteraction: false,
        label: ingredientModel.getKey()
      });
    }
    if (ingredientModel) {
      return (
        <div>
          <Button onClick={()=>this.setState({ showNutritionModal: true })}><Glyphicon glyph="glyphicon glyphicon-signal" /></Button>
          <Modal show={showNutritionModal} bsSize="medium" aria-labelledby="contained-modal-title-md">
            <Modal.Header closeButton onClick={()=>this.setState({ showNutritionModal: false })}>
              <Modal.Title id="contained-modal-title-lg">Nutrition Facts for {quantity} {measure} of {tag}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <RadialBarChart width={500} height={300} cx={150} cy={150} innerRadius={20} outerRadius={140} barSize={10} data={this.getLabelData(ingredientModel)}>
                <RadialBar startAngle={90} endAngle={-90} minAngle={15} label background clockWise={true} dataKey='uv'/>
                <Legend iconSize={10} width={120} height={140} layout='vertical' verticalAlign='middle' align="right" wrapperStyle={style}/>
                <Tooltip />
              </RadialBarChart>
            </Modal.Body>
          </Modal>
        </div>
      )
    }
    return null
  }
}