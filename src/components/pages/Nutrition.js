const React = require('react')
import ReactGA from 'react-ga'
const Config = require('Config')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Chip from 'react-toolbox/lib/chip'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

import PieChart from './PieChart'
import Label from './NutritionEstimateJSX'
import {IngredientModel} from '../models/IngredientModel'
import {rationalToFloat} from '../../helpers/ConversionUtils'
import {IngredientControlModel} from '../models/IngredientControlModel'
import IngredientController from '../../containers/IngredientControllerContainer'

export default class Nutrition extends React.Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    ReactGA.event({
      category: 'User',
      action: 'User in nutrition page',
      nonInteraction: false
    });
  }
  handleChipDelete(tag) {
    let {deletedTags} = this.props.tagModel
    let {parsedData} = this.props.nutrition

    this.props.nutritionModelRemIng(tag)
    this.props.ingredientControlModelRemTag(tag)

    for (let i = 0; i < parsedData.length; i++) {
      if (tag === parsedData[i].name) {
        parsedData.splice(i, 1)
        break
      }
    }
    if (deletedTags.indexOf(tag) === -1) {
      deletedTags.push(tag)
      this.props.deletedTags(deletedTags)
    }
    this.props.setParsedData(parsedData)

    // Remove the tag from the matchResultsModel:
    let {matchResultsModel} = this.props.tagModel
    matchResultsModel.removeSearch(tag)
    this.props.updateMatchResultsModel(matchResultsModel)

    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User deleted ingredient',
      nonInteraction: false,
      label: tag
    });
  }
  render() {
    const {parsedData, missingData} = this.props.nutrition
    const {matchResultsModel} = this.props.tagModel
    const {nutritionModel} = this.props.nutritionModelRed
    const {ingredientControlModels} = this.props.ingredientModel
    // 1. Generate a list of tags not found in our DB and build the array of
    //    sliders:
    let sliders = []
    let notFound = []
    //  a. Order the tags so they appear in search + recipe order to the user:
    let tagsInOrder = []
    for (let i = 0; i < parsedData.length; i++) {
      const tag = parsedData[i].name
      tagsInOrder.push(tag)
    }
    const searchTerms = matchResultsModel.getSearchTerms()
    for (let idx = 0; idx < searchTerms.length; idx++) {
      const tag = searchTerms[idx]
      if (tagsInOrder.indexOf(tag) === -1) {
        tagsInOrder.splice(0, 0, tag)
      }
    }
    //
    //  b. Create a list of recipeLines for display
    let recipeLines = {}
    for (let i = 0; i < parsedData.length; i++) {
      const amount = parsedData[i].amount
      const unit = parsedData[i].unit
      const name = parsedData[i].name
      let recipeLine = ""
      if (amount) {
        if (Object.prototype.hasOwnProperty.call(amount, 'min') && Object.prototype.hasOwnProperty.call(amount, 'max')) {
          const parseMinQuantity = rationalToFloat(amount.min)
          const parseMaxQuantity = rationalToFloat(amount.max)
          const parseQuantity = (parseMinQuantity + parseMaxQuantity) / 2.0
          recipeLine = recipeLine + parseQuantity + " "
        }
        else {
          recipeLine = recipeLine + amount + " "
        }
      }
      if ((unit !== undefined) && (unit !== "")) {
        recipeLine = recipeLine + unit.toLowerCase() + " "
      }
      recipeLine = recipeLine + name
      recipeLines[name] = recipeLine
    }
    for (let i = 0; i < tagsInOrder.length; i++) {
      const tag = tagsInOrder[i]
      if (! matchResultsModel.hasSearchTerm(tag)) {
        continue
      }
      if (! (tag in ingredientControlModels)) {
        notFound.push(tag)
        continue
      }
      let recipeLine = tag
      if (tag in recipeLines) {
        recipeLine = recipeLines[tag]
      }
      sliders.push(
        <div key={tag}>
          <Row style={{marginTop: 20}}>
            <Col xs={12} md={12}>
              <div key={tag}>
                <Row>
                  <Col xs={6}>
                    <Chip onDeleteClick={this.handleChipDelete.bind(this, tag)} deletable>
                      {recipeLine}
                    </Chip>
                  </Col>
                  <Col className="text-right" xs={6}>
                    <PieChart nutritionModel={nutritionModel} tag={tag}/>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <IngredientController tag={tag}/>
        </div>
      )
    }
    return (
      <div>
        {sliders}
      </div>
    )
  }
}
