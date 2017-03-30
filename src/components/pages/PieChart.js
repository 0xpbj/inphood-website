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

function getScaledValue(value, scale) {
  return (value * scale).toFixed(2)
}

export default class NutritionChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showNutritionModal: false
    }
  }
  getLabelData(ingredientModel, scale) {
    const cholestrol = getScaledValue(ingredientModel.getCholestorol(), scale)
    const protein = getScaledValue(ingredientModel.getTotalProteinPerServing(), scale)
    const carbs = getScaledValue(ingredientModel.getTotalCarbohydratePerServing(), scale)
    const fat = getScaledValue(ingredientModel.getTotalFatPerServing(), scale)
    const sodium = getScaledValue(ingredientModel.getSodium()/1000, scale)  // /1000: convert mg to g
    const sugar = getScaledValue(ingredientModel.getSugars(), scale)
    const fiber = getScaledValue(ingredientModel.getDietaryFiber(), scale)
    return [
      {name: 'Protein ('+protein+'g)', uv: protein, fill: '#8dd1e1'},
      {name: 'Carbs ('+carbs+'g)', uv: carbs, fill: '#8884d8'},
      {name: 'Fat ('+fat+'g)', uv: fat, fill: '#00C49F'},
      {name: 'Fiber ('+fiber+'g)', uv: fiber, fill: 'teal'},
      {name: 'Cholestrol ('+cholestrol+'g)', uv: cholestrol, fill: '#FFBB28'},
      {name: 'Sodium ('+sodium+'g)', uv: sodium, fill: '#FF8042'},
      {name: 'Sugar ('+sugar+'g)', uv: sugar, fill: 'red'},
    ]
  }
  render () {
    const {nutritionModel, tag} = this.props
    const {showNutritionModal} = this.state
    const scaledIngredient = nutritionModel.getScaledIngredient(tag)

    if (scaledIngredient) {
      const ingredientModel = scaledIngredient.getIngredientModel()
      const key = ingredientModel.getKey()
      const scale = scaledIngredient.getScale()
      const quantity = scaledIngredient.getQuantity()
      const unit = scaledIngredient.getUnit()
      const labelData = this.getLabelData(ingredientModel, scale)

      if (showNutritionModal) {
        ReactGA.event({
          category: 'User',
          action: 'User in ingredient nutrition modal',
          nonInteraction: false,
          label: key
        });
      }

      const calories = getScaledValue(ingredientModel.getCalories(), scale)
      return (
        <div>
          <Button onClick={()=>this.setState({ showNutritionModal: true })}><Glyphicon glyph="glyphicon glyphicon-eye-open" /></Button>
          <Modal show={showNutritionModal} bsSize="large" aria-labelledby="contained-modal-title-lg">
            <Modal.Header closeButton onClick={()=>this.setState({ showNutritionModal: false })}>
              <Modal.Title id="contained-modal-title-lg">Nutrition Facts: {quantity} {unit} of <i>{key}</i> has <b>{calories}</b> calories</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <RadialBarChart width={500} height={300} cx={150} cy={150} innerRadius={20} outerRadius={140} barSize={10} data={labelData}>
                <RadialBar minAngle={15} background clockWise={true} dataKey='uv'/>
                <Legend iconSize={10} width={150} height={140} layout='vertical' verticalAlign='middle' align="right" wrapperStyle={style}/>
              </RadialBarChart>
            </Modal.Body>
          </Modal>
        </div>
      )
    }
    return null
  }
}
