const React = require('react')
import ReactGA from 'react-ga'
const Config = require('Config')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Chip from 'react-toolbox/lib/chip'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

import Label from './NutritionEstimateJSX'
import {IngredientModel} from '../models/IngredientModel'
import {rationalToFloat} from '../../helpers/ConversionUtils'
import {IngredientControlModel} from '../models/IngredientControlModel'
import IngredientController from '../../containers/IngredientControllerContainer'
import PieChart from './PieChart'

import {IconButton} from 'react-toolbox/lib/button'
import Tooltip from 'react-toolbox/lib/tooltip'
const TooltipButton = Tooltip(IconButton)

function tagInParsedData(tag, parsedData) {
  for (let parseObj of parsedData) {
    if (parseObj.name === tag) {
      return true
    }
  }
  return false
}

function getRecipeLine(aParseObj) {
  const amount = aParseObj.amount
  const unit = aParseObj.unit
  const name = aParseObj.name

  let recipeLine = ''
  if (amount) {
    if (Object.prototype.hasOwnProperty.call(amount, 'min') &&
        Object.prototype.hasOwnProperty.call(amount, 'max')) {
      const parseMinQuantity = rationalToFloat(amount.min)
      const parseMaxQuantity = rationalToFloat(amount.max)
      const parseQuantity = (parseMinQuantity + parseMaxQuantity) / 2.0
      recipeLine = recipeLine + parseQuantity + ' '
    } else {
      recipeLine = recipeLine + amount + ' '
    }
  }
  if ((unit !== undefined) && (unit !== '')) {
    recipeLine = recipeLine + unit.toLowerCase() + ' '
  }
  recipeLine = recipeLine + name

  return recipeLine
}

export default class Nutrition extends React.Component {
  constructor(props) {
    super(props)
    this._key = 0
  }
  //
  getKey() {
    return this._key++
  }
  //
  getRecipeText(aNutritionModel) {
    let recipeText = ''
    const nmTags = aNutritionModel.getIds()
    for (let index in nmTags) {
      const tag = nmTags[index]
      const scaledIngredient = aNutritionModel.getScaledIngredient(tag)
      recipeText = recipeText +
                   scaledIngredient.getQuantity().toFixed(2) + " " +
                   scaledIngredient.getUnit() + " " +
                   scaledIngredient.getIngredientModel().getKey() +
                   "\n"
    }
    return recipeText
  }
  //
  handleChipDelete(id) {
    const {nutritionModel} = this.props.nutritionModelRed
    const tag = nutritionModel.getIngredientModel(id).getTag()

    this.props.nutritionModelRemIng(id)
    this.props.ingredientControlModelRemTag(id)

    let {parsedData} = this.props.nutrition
    for (let i = 0; i < parsedData.length; i++) {
      if (id === parsedData[i].id) {
        parsedData.splice(i, 1)
        break
      }
    }
    this.props.setParsedData(parsedData)

    // Remove the tag from the matchResultsModel if another ingredient isn't
    // using it:
    if (!tagInParsedData(tag, parsedData)) {
      let {matchResultsModel} = this.props.tagModel
      matchResultsModel.removeSearch(tag)
      this.props.updateMatchResultsModel(matchResultsModel)
    }

    this.props.serializeToFirebase()

    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User deleted ingredient',
      nonInteraction: false,
      label: tag
    });
  }
  //
  render() {
    const {parsedData} = this.props.nutrition
    const {matchResultsModel} = this.props.tagModel
    const {nutritionModel} = this.props.nutritionModelRed
    const {ingredientControlModels} = this.props.ingredientControlModelRed

    // 1. Generate a list of tags not found in our DB and build the array of
    //    sliders:
    let sliders = []

    for (let idx = 0; idx < parsedData.length; idx++) {
      const parseObj = parsedData[idx]
      const id = parseObj.id
      const recipeLine = getRecipeLine(parseObj)

      const ingredientModel = nutritionModel.getIngredientModel(id)
      if (!ingredientModel) {
        continue
      }
      const tag = ingredientModel.getTag()

      // Skip ingredients we don't have results or a control model for.
      if (!(matchResultsModel.hasSearchTerm(tag) &&
          (id in ingredientControlModels))) {
        continue
      }

      sliders.push(
        <div key={this.getKey()}>
          <Row style={{marginTop: 10, paddingRight: 15}}>
            <Col xs={10} sm={10} md={10} style={{paddingRight:0, paddingTop:10}}>
              <text style={{fontWeight: 'bold'}}>{recipeLine}</text>
            </Col>
            <Col xs={1} sm={1} md={1}>
              <PieChart nutritionModel={nutritionModel} id={id}/>
            </Col>
            <Col xs={1} sm={1} md={1}>
              <TooltipButton
                tooltip='Click to delete ingredient'
                tooltipPosition='right'
                tooltipDelay={500}
                icon='delete'
                style={{color: '#BD362F'}}
                onClick={this.handleChipDelete.bind(this, id)}
              />
            </Col>
          </Row>
          <IngredientController recipeLine={recipeLine} id={id}/>
        </div>
      )
    }

    return (
      <div
        style={{marginTop:10,
                backgroundColor:'white',
                borderColor:'black',
                borderRadius:5,
                borderWidth:1,
                padding:10,
                paddingBottom:30,
                borderStyle:'solid'}}>
        {sliders}
      </div>
    )
  }
}
