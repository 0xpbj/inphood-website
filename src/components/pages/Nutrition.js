var React = require('react')
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
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ProgressBar from 'react-bootstrap/lib/ProgressBar'
import Chip from 'react-toolbox/lib/chip'

import Search from './Search'
const Config = require('Config')
const Convert = require('convert-units')
import * as tupleHelper from '../../helpers/TupleHelpers'

import MarginLayout from '../../helpers/MarginLayout'
import TopBar from '../layout/TopBar'

export default class Nutrition extends React.Component {
  //////////////////////////////////////////////////////////////////////////////
  // React / Component API:
  //////////////////////////////////////////////////////////////////////////////
  constructor(props) {
    super(props)
    this.state = {
      labelRedirect: false,
      matchData: {},
      deletedTags: [],
      unmatchedTags: [],
      progress: 0,
      matchIndex: 0
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
  componentWillReceiveProps(nextProps) {
    const {parsedData} = nextProps.nutrition
    const {modelSetup, matchData, userSearch, append, tag} = nextProps.model

    if (!modelSetup && (Object.keys(matchData).length === Object.keys(parsedData).length))
    {
      this.changesFromRecipe()
    }
    else if (userSearch) {
      this.changesFromSearch(nextProps)
    }
    else if (append) {
      this.changesFromAppend(tag)
    }
  }
  changesFromAppend(tag) {
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2
    let tagMatches = this.props.model.matchData[tag]
    if (tagMatches.length === 0) {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'No ellipses results returned',
        nonInteraction: false,
        label: tag
      });
      return
    }
    // TODO: A lot of this is common to componentWillMount. Refactor
    // 1. Add this tag to:
    //    - this.state.nutritionModel
    //    - ingredientControlModels
    const description = tagMatches[0][descriptionOffset]
    const dataForKey = tagMatches[0][dataObjOffset]
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(description, tag, dataForKey)
    const measureQuantity = ingredientModel.getMeasureQuantity()
    const measureUnit = ingredientModel.getMeasureUnit()
    this.props.nutritionModelAddIng(
      tag, ingredientModel, measureQuantity, measureUnit, true)
    let ingredientControlModel =
      new IngredientControlModel(
            measureQuantity,
            getPossibleUnits(measureUnit),
            measureUnit,
            tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
            description)
    this.props.ingredientAddModel(tag, ingredientControlModel)
    this.props.resetAppendData()
  }
  //TODO: this can be cleaned & merged with the recipe code
  changesFromSearch(nextProps) {
    const {matchData, searchIngredient, selectedTags} = nextProps.model
    // TODO: refactor and compbine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2
    // Check that the first dataObject is not undefined (modified from non-lazy
    // load where every match was checked)
    const firstMatch = 0
    const tag = searchIngredient
    const tagMatches = matchData[tag]
    if (tagMatches.length === 0) {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'No search results returned',
        nonInteraction: false,
        label: searchIngredient
      });
      let {unmatchedTags} = this.state
      if (unmatchedTags.indexOf(tag) === -1) {
        unmatchedTags.push(tag)
        this.setState({
          unmatchedTags: unmatchedTags,
        })
      }
      return
    }
    // We use the first value in the list (assumes elastic search returns results
    // in closest match order)
    const description = tagMatches[0][descriptionOffset]
    const dataForKey = tagMatches[0][dataObjOffset]
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(description, tag, dataForKey)
    let measureQuantity = ingredientModel.getMeasureQuantity()
    let measureUnit = ingredientModel.getMeasureUnit()
    let tryQuantity = measureQuantity
    let tryUnit = measureUnit
    let errorStr = ''
    try {
      this.props.nutritionModelAddIng(tag, ingredientModel, tryQuantity, tryUnit)
    }
    catch(err) {
      errorStr = err
    }
    finally {
      // We failed to add the ingredient with the specified quantity/unit, so try
      // using the FDA values (not try/catch--if this fails we have a serious internal
      // error--i.e. this should always work.)
      if (errorStr !== '') {
        tryQuantity = measureQuantity
        tryUnit = measureUnit
        this.props.nutritionModelAddIng(tag, ingredientModel, tryQuantity, tryUnit)
      }
    }
    //console.log('===========================================================');
    //console.log('after addIngredient: ' + tag + '(' + description + ')');
    //console.log('nutritionModel:');
    // for (let key in nutritionModel._scaledIngredients) {
      //console.log('key = ' + key);
    // }
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Search results added to label',
      nonInteraction: false,
      label: searchIngredient
    });
    let ingredientControlModel = new IngredientControlModel(
      tryQuantity,
      getPossibleUnits(tryUnit),
      tryUnit,
      tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
      description)
    this.props.ingredientAddModel(tag, ingredientControlModel)
    // Hackity hack hack--init the serving amount from the servingsControls so they
    // match on presentation of the label
    const {servingsControls} = this.props
    this.props.nutritionModelSetServings(servingsControls['value'], servingsControls['unit'])
    selectedTags.push(tag)
    this.props.selectedTags(selectedTags)
    this.props.resetSearchFlag()
  }
  changesFromRecipe() {
    // A spinner gets rendered until this method gets here.
    // //console.log('% % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    // //console.log(' % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    //console.log('% % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    // //console.log('');
    //console.log('Complete data received from firebase');
    //console.log(nextProps.nutrition);
    let {parsedData, missingData} = this.props.nutrition
    const {matchData} = this.props.model
    // TODO: refactor and compbine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2
    // Check that the first dataObject is not undefined (modified from non-lazy
    // load where every match was checked)
    const firstMatch = 0
    for (let tag in matchData) {
      if (matchData[tag].length === 0) {
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Missing data for ingredient',
          nonInteraction: false,
          label: tag
        });
        continue
      }
      if (matchData[tag][firstMatch][dataObjOffset] === undefined) {
        return
      }
    }
    let selectedTags = []
    for (let tag in matchData) {
      const tagMatches = matchData[tag]
      // We use the first value in the list (assumes elastic search returns results
      // in closest match order)
      //const key = tagMatches[0][keyOffset]
      if (tagMatches.length === 0) {
        if (missingData.indexOf(tag) === -1) {
          missingData.push(tag)
          ReactGA.event({
            category: 'Nutrition Mixer',
            action: 'Missing data for ingredient',
            nonInteraction: false,
            label: tag
          });
        }
        continue
      }
      const description = tagMatches[0][descriptionOffset]
      const dataForKey = tagMatches[0][dataObjOffset]
      let ingredientModel = new IngredientModel()
      ingredientModel.initializeSingle(description, tag, dataForKey)
      let measureQuantity = ingredientModel.getMeasureQuantity()
      let measureUnit = ingredientModel.getMeasureUnit()
      let tryQuantity = measureQuantity
      let tryUnit = measureUnit
      let parseQuantity = undefined
      let parseUnit = undefined
      for (let i = 0; i < parsedData.length; i++) {
        const parseObj = parsedData[i]
        const foodName = parseObj['name']
        if (foodName === tag) {
          // Sometimes the parseObj returns things like 'toTaste=true' and no
          // amount or unit fields. TODO: we should probably exclude those tags/
          // ingredients from the label in MVP3 or put them in their own bucket.
          if ('amount' in parseObj) {
            if ((parseObj['amount'].hasOwnProperty('min')) &&
                 parseObj['amount'].hasOwnProperty('max')) {
              const parseMinQuantity = rationalToFloat(parseObj['amount'].min)
              const parseMaxQuantity = rationalToFloat(parseObj['amount'].max)
              parseQuantity = (parseMinQuantity + parseMaxQuantity) / 2.0
            } else {
              parseQuantity = rationalToFloat(parseObj['amount'])
            }
          }
          if ('unit' in parseObj) {
            parseUnit = mapToSupportedUnitsStrict(parseObj['unit'])
          }
          if ((parseQuantity !== undefined) && (parseQuantity !== "") && (!isNaN(parseQuantity))) {
            //console.log(tag + ', setting measureQuantity to parseQuantity: ' + parseQuantity);
            tryQuantity = parseQuantity
          }
          if ((parseUnit !== undefined) && (parseUnit !== "")) {
            //console.log(tag + ', setting measureUnit to parseUnit: ' + parseUnit);
            tryUnit = parseUnit
          }
          break
        }
      }
      let errorStr = ''
      try {
        this.props.nutritionModelAddIng(tag, ingredientModel, tryQuantity, tryUnit)
      }
      catch(err) {
        errorStr = err
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Error adding ingredient',
          nonInteraction: false,
          label: tag
        });
        //console.log(errorStr);
      }
      finally {
        // We failed to add the ingredient with the specified quantity/unit, so try
        // using the FDA values (not try/catch--if this fails we have a serious internal
        // error--i.e. this should always work.)
        if (errorStr !== '') {
          tryQuantity = measureQuantity
          tryUnit = measureUnit
          this.props.nutritionModelAddIng(tag, ingredientModel, tryQuantity, tryUnit)
        }
      }
      //console.log('===========================================================');
      //console.log('after addIngredient: ' + tag + '(' + description + ')');
      //console.log('nutritionModel:');
      // for (let key in nutritionModel._scaledIngredients) {
        //console.log('key = ' + key);
      // }
      let ingredientControlModel = new IngredientControlModel(
        tryQuantity,
        getPossibleUnits(tryUnit),
        tryUnit,
        tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
        description)
      this.props.ingredientAddModel(tag, ingredientControlModel)
      selectedTags.push(tag)
    }
    // Hackity hack hack--init the serving amount from the servingsControls so they
    // match on presentation of the label
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User recipe parsed',
      nonInteraction: false,
    });
    const {servingsControls} = this.props
    this.props.nutritionModelSetServings(servingsControls['value'], servingsControls['unit'])
    this.props.selectedTags(selectedTags)
    this.setState({
      unmatchedTags: missingData,
      progress: 1
    })
    this.props.nutritionModelSetup(true)
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
    this.props.router.push('result?label='+ this.props.nutrition.key)
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
    let selectedTags = this.props.model.selectedTags
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
    //console.log('handleChipAdd    ------------------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('selectedTags = ');
    //console.log(this.state.selectedTags);
    //console.log('deletedTags = ');
    //console.log(this.state.deletedTags);
    // TODO: refactor and compbine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2
    let tagMatches = this.props.model.matchData[tag]
    let selectedTags = this.props.model.selectedTags
    let deletedTags = this.state.deletedTags
    // TODO: A lot of this is common to componentWillMount. Refactor
    // 1. Add this tag to:
    //    - this.state.nutritionModel
    //    - ingredientControlModels
    const description = tagMatches[0][descriptionOffset]
    const dataForKey = tagMatches[0][dataObjOffset]
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(description, tag, dataForKey)
    const measureQuantity = ingredientModel.getMeasureQuantity()
    const measureUnit = ingredientModel.getMeasureUnit()
    this.props.nutritionModelAddIng(
      tag, ingredientModel, measureQuantity, measureUnit)
    let ingredientControlModel =
      new IngredientControlModel(
            measureQuantity,
            getPossibleUnits(measureUnit),
            measureUnit,
            tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
            description)
    this.props.ingredientAddModel(tag, ingredientControlModel)
    // 2. Add the tag to selectedTags and remove it from deleted tags ...
    //
    for (let i = 0; i < deletedTags.length; i++) {
      if (tag === deletedTags[i]) {
        deletedTags.splice(i, 1)
        break
      }
    }
    selectedTags.push(tag)
    this.props.selectedTags(selectedTags)
    this.setState({
      deletedTags: deletedTags
    })
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User added ingredient',
      nonInteraction: false,
      label: tag
    });
  }
  //////////////////////////////////////////////////////////////////////////////
  // Miscellany:
  //////////////////////////////////////////////////////////////////////////////
  render() {
    const numIngredients = Object.keys(this.props.nutrition.parsedData).length
    const loadedIngredients = Object.keys(this.props.model.matchData).length
    if (loadedIngredients < numIngredients) {
      const progress = (100.0 * loadedIngredients) / numIngredients
      //console.log('\n\n\nProgress: ', progress)
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
    let notFound = ""
    const {ingredientControlModels, matchData} = this.props.model
    //
    //  a. Order the tags so they appear in search + recipe order to the user:
    const parsedData = this.props.nutrition.parsedData
    let tagsInOrder = []
    for (let i = 0; i < parsedData.length; i++) {
      const tag = parsedData[i].name
      tagsInOrder.push(tag)
    }
    for (let tag in matchData) {
      if ((tagsInOrder.indexOf(tag) === -1)) {
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

      //too strict, doesn't allow fractions
      // if (!isNaN(amount)) {}
      if (amount) {
        recipeLine = recipeLine + amount + " "
      }

      if ((unit !== undefined) && (unit !== "")) {
        recipeLine = recipeLine + unit.toLowerCase() + " "
      }

      recipeLine = recipeLine + name
      recipeLines[name] = recipeLine
    }
    //
    //  c. Now create the slider array:
    for (let i = 0; i < tagsInOrder.length; i++) {
      const tag = tagsInOrder[i]
      if (! (tag in matchData)) {
        continue
      }
      if (! (tag in ingredientControlModels)) {
        notFound = notFound + tag + " "
        continue
      }
      let recipeLine = tag
      if (tag in recipeLines) {
        recipeLine = recipeLines[tag]
      }

      sliders.push(
        <div>
          <Row
            style={{marginTop: 20}}>
            <Col xs={12} md={12}>
              <Chip onDeleteClick={this.handleChipDelete.bind(this, tag)} deletable>
                {recipeLine}
              </Chip>
            </Col>
          </Row>

          <IngredientController tag={tag}/>

        </div>
      )
    }
    if (notFound != "") {
      notFound = "(No data for: " + notFound + ")"
    }

    // 2. Serialize the nutrition model and composite ingreident model:
    const full = this.props.model.nutritionModel.serialize()
    const compositeModel = this.props.model.nutritionModel.getScaledCompositeIngredientModel()
    const composite = compositeModel.serialize()
    const eventKey = this.props.nutrition.anonymous === false ? "2" : "1"

    const ml = new MarginLayout()
    const searchWidget = (
      <Search
        searchIngredientData={(ingredient) => this.props.searchIngredientData(ingredient)}/>
    )
    const shareResultsButton = (
      <Button bsStyle="success"
              onClick={this.transitionToLabelPage.bind(this, composite, full)}>
        Share Results
      </Button>
    )
    return (
      <div>
        <TopBar step=""
                stepText=""
                altContent={searchWidget}
                aButton={shareResultsButton}/>

        {/*Serving size below: TODO refactor*/}
        <Row>
          {ml.marginCol}
          <Col xs={ml.xsCol}
               sm={ml.smCol}
               md={ml.mdCol}
               lg={ml.lgCol}>
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
                    <Label ingredientComposite={compositeModel}/>
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
                    tags={this.state.unmatchedTags}
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
