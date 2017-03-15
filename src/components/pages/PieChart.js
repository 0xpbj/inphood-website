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
    const cholestrol = ingredientModel.getCholestorol()
    const protein = ingredientModel.getTotalProteinPerServing()
    const carbs = ingredientModel.getTotalCarbohydratePerServing()
    const fat = ingredientModel.getTotalFatPerServing()
    const sodium = ingredientModel.getSodium()/1000
    const sugar = ingredientModel.getSugars()
    const fiber = ingredientModel.getDietaryFiber()
    return [
      {name: 'Protein (g)', uv: protein, fill: '#8dd1e1'},
      {name: 'Carbs (g)', uv: carbs, fill: '#8884d8'},
      {name: 'Fat (g)', uv: fat, fill: '#00C49F'},
      {name: 'Fiber (g)', uv: fiber, fill: 'teal'},
      {name: 'Cholestrol (g)', uv: cholestrol, fill: '#FFBB28'},
      {name: 'Sodium (g)', uv: sodium, fill: '#FF8042'},
      {name: 'Sugar (g)', uv: sugar, fill: 'red'},
    ]
  }
  render () {
    const {nutritionModel, tag} = this.props
    const {showNutritionModal} = this.state
    const ingredientModel = nutritionModel.getIngredientModel(tag)
    if (showNutritionModal) {
      ReactGA.event({
        category: 'User',
        action: 'User in ingredient nutrition modal',
        nonInteraction: false,
        label: ingredientModel.getKey()
      });
    }
    if (ingredientModel) {
      const measure = ingredientModel.getMeasureUnit()
      const calories = ingredientModel.getCalories()
      return (
        <div>
          <Button onClick={()=>this.setState({ showNutritionModal: true })}><Glyphicon glyph="glyphicon glyphicon-signal" /></Button>
          <Modal show={showNutritionModal} bsSize="medium" aria-labelledby="contained-modal-title-md">
            <Modal.Header closeButton onClick={()=>this.setState({ showNutritionModal: false })}>
              <Modal.Title id="contained-modal-title-lg">Nutrition Facts: 1 {measure} of <i>{tag}</i> has <b>{calories}</b> calories</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <RadialBarChart width={500} height={300} cx={150} cy={150} innerRadius={20} outerRadius={140} barSize={10} data={this.getLabelData(ingredientModel)}>
                <RadialBar minAngle={15} label background clockWise={true} dataKey='uv'/>
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