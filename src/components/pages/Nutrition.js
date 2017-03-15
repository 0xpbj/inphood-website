const React = require('react')
import ReactGA from 'react-ga'
import Label from './NutritionEstimateJSX'
import {IngredientModel} from '../models/IngredientModel'
import {IngredientControlModel} from '../models/IngredientControlModel'
import {getValueInUnits,
        getIngredientValueInUnits,
        mapToSupportedUnits,
        mapToSupportedUnitsStrict,
        rationalToFloat,
        getPossibleUnits} from '../../helpers/ConversionUtils'
import TagController from '../controllers/TagController'
import ServingsController from '../../containers/ServingsControllerContainer'
import IngredientController from '../../containers/IngredientControllerContainer'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ProgressBar from 'react-bootstrap/lib/ProgressBar'
import Chip from 'react-toolbox/lib/chip'
import PieChart from './PieChart'
import Search from '../../containers/SearchContainer'
const Config = require('Config')
const Convert = require('convert-units')

import MarginLayout from '../../helpers/MarginLayout'
import TopBar from '../layout/TopBar'

export default class Nutrition extends React.Component {
  //////////////////////////////////////////////////////////////////////////////
  // React / Component API:
  //////////////////////////////////////////////////////////////////////////////
  constructor(props) {
    super(props)
    this.state = {
      deletedTags: []
    }
  }
  componentWillMount() {
    if (this.props.nutrition.rawData === '') {
      this.props.router.push('/recipe')
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'User in nutrition page',
        nonInteraction: false
      });
    }
  }
  //////////////////////////////////////////////////////////////////////////////
  // Action Handlers:
  //////////////////////////////////////////////////////////////////////////////
  transitionToLabelPage(composite, full) {
    ReactGA.event({
      category: 'User',
      action: 'User sharing results',
      nonInteraction: false
    });
    this.props.sendSerializedData(composite, full)
    this.props.router.push('/?label='+ this.props.nutrition.key)
  }
  handleChipDelete(tag) {
    //console.log('handleChipDelete ------------------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('selectedTags = ');
    //console.log(this.state.selectedTags);
    //console.log('deletedTags = ');
    //console.log(this.state.deletedTags);
    // 1. Delete this tag from:
    //    this.state..
    //    this.state.nutritionModel
    //    ingredientControlModels
    let selectedTags = this.props.tagModel.selectedTags
    let deletedTags = this.state.deletedTags
    this.props.nutritionModelRemIng(tag)
    this.props.ingredientModelRemTag(tag)
    // 2. Remove the tag from selectedTags (use splice--delete just makes the
    //    element undefined):
    for (let i = 0; i < selectedTags.length; i++) {
      if (tag === selectedTags[i]) {
        selectedTags.splice(i, 1)
        break
      }
    }
    deletedTags.push(tag)
    this.props.selectedTags(selectedTags)
    this.setState({
      deletedTags: deletedTags
    })
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User deleted ingredient',
      nonInteraction: false,
      label: tag
    });
  }

  handleChipAdd(tag) {
    const {selectedTags} = this.props.tagModel
    let deletedTags = this.state.deletedTags

    const searchTerm = tag
    const {matchResultsModel} = this.props.tagModel
    const searchResult = matchResultsModel.getSearchResultByIndex(searchTerm)
    const description = searchResult.getDescription()
    // TODO: need to disambiguate from Branded results object here
    const stdRefObj = searchResult.getStandardRefDataObj()
    if (stdRefObj === undefined) {
      throw 'Unable to get std ref obj in handle chip add'
    }

    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(description, searchTerm, stdRefObj)
    const measureQuantity = ingredientModel.getMeasureQuantity()
    const measureUnit = ingredientModel.getMeasureUnit()
    this.props.nutritionModelAddIng(
      searchTerm, ingredientModel, measureQuantity, measureUnit)
    let ingredientControlModel =
      new IngredientControlModel(
            measureQuantity,
            getPossibleUnits(measureUnit),
            measureUnit,
            matchResultsModel.getSearchResultDescriptions(searchTerm),
            description)
    this.props.ingredientAddModel(searchTerm, ingredientControlModel)

    // 2. Add the tag to selectedTags and remove it from deleted tags ...
    //
    for (let i = 0; i < deletedTags.length; i++) {
      if (searchTerm === deletedTags[i]) {
        deletedTags.splice(i, 1)
        break
      }
    }
    selectedTags.push(searchTerm)
    this.props.selectedTags(selectedTags)
    this.setState({
      deletedTags: deletedTags
    })
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User added ingredient',
      nonInteraction: false,
      label: searchTerm
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Miscellany:
  //////////////////////////////////////////////////////////////////////////////
  render() {
    const numIngredients = Object.keys(this.props.nutrition.parsedData).length
    const {matchResultsModel} = this.props.tagModel
    const loadedIngredients = matchResultsModel.getNumberOfSearches()
    const {unusedTags} = this.props.tagModel
    if (loadedIngredients < numIngredients) {
      const progress = (100.0 * loadedIngredients) / numIngredients
      return (
        <div className="text-center">
          <ProgressBar striped
           bsStyle="success" now={progress} />
        </div>
      )
    }
    // 1. Generate a list of tags not found in our DB and build the array of
    //    sliders:
    let sliders = []
    let notFound = []
    const {ingredientControlModels} = this.props.ingredientModel
    //
    //  a. Order the tags so they appear in search + recipe order to the user:
    const parsedData = this.props.nutrition.parsedData
    let tagsInOrder = []
    for (let i = 0; i < parsedData.length; i++) {
      const tag = parsedData[i].name
      tagsInOrder.push(tag)
    }
    //
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
    //
    //  c. Now create the slider array:
    const {nutritionModel} = this.props.nutritionModelRed
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
          <Row
            style={{marginTop: 20}}>
            <Col xs={12} md={12}>
              <div>
                <Row>
                  <Col xs={6} md={6}>
                    <Chip onDeleteClick={this.handleChipDelete.bind(this, tag)} deletable>
                      {recipeLine}
                    </Chip>
                  </Col>
                  <Col xs={4} md={4} />
                  <Col xs={2} md={2}>
                    <PieChart nutritionModel={nutritionModel} tag={tag} />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <IngredientController tag={tag}/>
        </div>
      )
    }
    // 2. Serialize the nutrition model and composite ingreident model:
    const full = nutritionModel.serialize()
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
    const composite = compositeModel.serialize()

    const ml = new MarginLayout()
    const shareResultsButton = (
      <Button bsStyle="success"
              onClick={this.transitionToLabelPage.bind(this, composite, full)}>
        Next: Share Results
      </Button>
    )
    return (
      <div>
        <TopBar step=""
                stepText=""
                altContent={(<Search />)}
                aButton={shareResultsButton}/>
        {/*Serving size below: TODO refactor*/}
        <Row>
          {ml.marginCol}
          <Col xs={ml.xsCol} sm={ml.smCol} md={ml.mdCol} lg={ml.lgCol}>
            <Row>
              <Col xs={12} sm={12} md={12} lg={7}>
                <ServingsController/>
                {sliders}
              </Col>
              <Col xs={12} sm={12} md={12} lg={5}>
                <Row>
                  <pre>{this.props.nutrition.rawData}</pre>
                </Row>
                <Row>
                  <div>
                    <text>&nbsp;</text>
                    <Label id='nutritionLabel' ingredientComposite={compositeModel}/>
                  </div>
                </Row>
                {/* temporary hack to align top to adjacent slider */}
                <Row style={{marginTop: 9}}>
                  <TagController
                    tags={this.state.deletedTags}
                    tagName={'Discarded Tags:'}
                    deletable={true}
                    handleChipAdd={this.handleChipAdd.bind(this)}
                  />
                </Row>
                <Row>
                  <TagController
                    tags={unusedTags}
                    tagName={'No match found for these ingredients:'}
                    deletable={false}
                    handleChipAdd={this.handleChipAdd.bind(this)}
                  />
                </Row>
              </Col>
            </Row>
          </Col>
          {ml.marginCol}
        </Row>
      </div>
    )
  }
}
