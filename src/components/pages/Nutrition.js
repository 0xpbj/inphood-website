var React = require('react')
import ReactGA from 'react-ga'
import Label from './NutritionEstimateJSX'
import {IngredientModel} from '../models/IngredientModel'
import {IngredientControlModel} from '../models/IngredientControlModel'
import {getValueInUnits,
        getIngredientValueInUnits,
        mapToSupportedUnits,
        mapToSupportedUnitsStrict,
        rationalToFloat} from '../../helpers/ConversionUtils'
import TagController from '../controllers/TagController'
import ServingsController from '../controllers/ServingsController'
import IngredientController from '../controllers/IngredientController'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Button from 'react-bootstrap/lib/Button'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ProgressBar from 'react-bootstrap/lib/ProgressBar'

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
      servingControls: {
        value: 2,
        unit: 'people',
        min: 1,
        max: 12,
        step: 1
      },
      progress: 0,
      matchIndex: 0
    }
  }
  componentWillMount() {
    if (!this.props.user.login && !this.props.user.anonymous) {
      this.props.router.push('/')
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'Get nutrition information for image',
        nonInteraction: false
      });
      this.props.igUploadPhoto()
      ReactGA.event({
        category: 'User',
        action: 'Uploading image to AWS',
        nonInteraction: true
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    // HORRIBLE HACK:
    //  - the code below here used to be in componentWillMount, it was essentially
    //    designed to be run once. When we inserted the code to lazy load the pulldown
    //    data from firebase, we ended up introducing additional calls to this method.
    //    The check below uses the state of the lazyLoadOperation in redux to prevent
    //    the code below from being repeatedly run, which introduces a host of bugs, i.e.:
    //      * the pulldown gets re-rendered with incorrect information
    //      * items from the unselected list get pushed back into the selected list
    //
    //    TODO: in MVP3, re-architect this properly to work with the redux store
    //
    const {parsedData} = nextProps.nutrition
    const {modelSetup, matchData, lazyLoadOperation, userSearch, append, tag} = nextProps.model
    if (lazyLoadOperation.status === 'done') {
      this.completeMatchDropdownChange(lazyLoadOperation.tag, lazyLoadOperation.value)
      this.props.resetLazyLoadOperation()
    }
    else if (!modelSetup && (Object.keys(matchData).length === Object.keys(parsedData).length))
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
            this.getPossibleUnits(measureUnit),
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
    let unmatchedTags = []
    if (tagMatches.length === 0) {
      let {unmatchedTags} = this.state
      unmatchedTags.push(tag)
      this.setState({
        unmatchedTags: unmatchedTags,
      })
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
    let ingredientControlModel = new IngredientControlModel(
      tryQuantity,
      this.getPossibleUnits(tryUnit),
      tryUnit,
      tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
      description)
    this.props.ingredientAddModel(tag, ingredientControlModel)
    // Hackity hack hack--init the serving amount from the servingControls so they
    // match on presentation of the label
    let servingControls = this.state.servingControls
    this.props.nutritionModelSetServings(servingControls['value'], servingControls['unit'])
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
      if(tagMatches.length === 0) {
        missingData.push(tag)
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
        this.getPossibleUnits(tryUnit),
        tryUnit,
        tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
        description)
      this.props.ingredientAddModel(tag, ingredientControlModel)
      selectedTags.push(tag)
    }
    // Hackity hack hack--init the serving amount from the servingControls so they
    // match on presentation of the label
    let servingControls = this.state.servingControls
    this.props.nutritionModelSetServings(servingControls['value'], servingControls['unit'])
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
    this.props.sendSerializedData(composite, full)
    this.props.router.push('result?label='+ this.props.nutrition.key)
  }
  handleServingValuesChange(servingValue) {
    let servingControls = this.state.servingControls

    servingControls['value'] = servingValue
    this.props.nutritionModelSetServings(servingValue, servingControls['unit'])

    this.setState({
      servingControls: servingControls
    })
  }
  handleServingDropDownChange(servingUnit) {
    let servingControls = this.state.servingControls
    if (servingUnit === 'people') {
      servingControls['min'] = 1
      servingControls['max'] = 12
      servingControls['step'] = 1
      servingControls['value'] = 2
    } else {
      servingControls['min'] = 0
      servingControls['max'] = 300
      servingControls['step'] = 25
      servingControls['value'] = 100
    }
    servingControls['unit'] = servingUnit
    this.props.nutritionModelSetServings(servingControls['value'], servingUnit)
    this.setState({
      servingControls: servingControls
    })
  }
  handleSliderValuesChange(tag, value) {
    this.props.ingredientSetSliderValue(tag, value)
    this.props.nutritionModelScaleIng(tag, value, this.props.model.ingredientControlModels[tag].getDropdownUnitValue())
  }
  completeMatchDropdownChange(tag, value) {
    //console.log('completeMatchDropdownChange ----------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('value = ' + value);
    const {nutritionModel, ingredientControlModels} = this.props.model
    // 1. Save the current ingredient key for deletion at the end of this
    //    process:
    let ingredientKeyToDelete = ingredientControlModels[tag].getDropdownMatchValue()
    let ingredientModelToDelete = nutritionModel.getIngredientModel(tag)
    // 2. Create a new IngredientModel:
    let dataForKey = tupleHelper.getDataForDescription(this.props.model.matchData[tag], value)
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(value, tag, dataForKey)
    // 3. Update the match value state for the dropdown:
    this.props.ingredientSetDropdownMatchValue(tag,value)
    // 4. Update the dropdown units and unit value:
    //
    //    a. Get the list of new measurement units that are possible:
    let newMeasureUnit = mapToSupportedUnits(ingredientModel.getMeasureUnit())
    let newUnits = this.getPossibleUnits(newMeasureUnit)
    this.props.ingredientSetDropdownUnits(tag, newUnits)
    //    b. See if the current unit is within the new possibilies, if not
    //       then set to the FDA measure defaults
    //    (TODO: or perhaps fallback to the recipe amount/unit if they worked)
    const currentValue = ingredientControlModels[tag].getSliderValue()
    const currentUnit = ingredientControlModels[tag].getDropdownUnitValue()
    let newValue = undefined
    let newUnit = undefined
    if (newUnits.includes(currentUnit)) {
      newValue = currentValue
      newUnit = currentUnit
    } else {
      //console.log('Ingredient change conversion--using grams to convert:');
      //console.log('   ' + currentValue + currentUnit + ' to ' + newMeasureUnit);
      // Convert current unit to grams, then convert grams to new measure unit
      // for new ingredient
      let valueInGrams = getValueInUnits(
        currentValue, currentUnit, 'g', ingredientModelToDelete)
      newValue = getValueInUnits(
        valueInGrams, 'g', newMeasureUnit, ingredientModel)
      newUnit = newMeasureUnit
      this.props.ingredientSetSliderValue(tag, newValue)
      this.props.ingredientSetDropdownUnitsValue(tag, newUnit)
      // TODO: possibly an alert to tell the user we've converted their number
      //       to a new amount due to unit change and the old units are not
      //       available.
    }
    // 5. Remove the current IngredientModel from the NutritionModel:
    this.props.nutritionModelRemIng(tag)
    // 6. Add the new IngredientModel to the NutritionModel:
    this.props.nutritionModelAddIng(tag,
                                 ingredientModel,
                                 newValue,
                                 newUnit)
  }
  handleMatchDropdownChange(tag, value) {
    //console.log('handleMatchDropdownChange ----------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('value = ' + value);
    // TODO: refactor and compbine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2
    let tagMatches = this.props.model.matchData[tag]
    let dataForKey = tupleHelper.getDataForDescription(tagMatches, value)
    if (dataForKey === undefined) {   // Lazy loading from FB
      let index = tupleHelper.getIndexForDescription(tagMatches, value)
      let tuple = tagMatches[index]
      if (value === '.....')
        this.props.getMoreData(tag, tagMatches.length)
      else
        this.props.lazyFetchFirebase(value, tag, tuple[keyOffset], index)
    } else {
      this.completeMatchDropdownChange(tag, value)
    }
  }
  handleUnitDropdownChange(tag, value) {
    //console.log('handleUnitDropdownChange ----------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('value = ' + value);
    let newUnit = value
    let ingredientControlModel = this.props.model.ingredientControlModels[tag]
    let ingredientModel = this.props.model.nutritionModel.getIngredientModel(tag)
    // TODO: catch the exception from here and mention that their current value
    // will be lost if we change to those units.
    let newValue = getIngredientValueInUnits(
      newUnit, ingredientModel, ingredientControlModel)
    this.props.ingredientSetSliderValue(tag, newValue)
    this.props.ingredientSetDropdownUnitsValue(tag, newUnit)
    this.props.ingredientAddModel(tag, ingredientControlModel)
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
            this.getPossibleUnits(measureUnit),
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
  }
  //////////////////////////////////////////////////////////////////////////////
  // Miscellany:
  //////////////////////////////////////////////////////////////////////////////
  //
  // TODO: probably move this to ConversionUtils.js
  getPossibleUnits(measureUnit) {
    const excludedUnits = [
      'mm3', 'cm3', 'm3', 'km3', 'in3', 'ft3', 'yd3',
      'mcg', 'mg']

    let sanitizedMeasureUnit = mapToSupportedUnits(measureUnit)
    // We can also convert anything to grams so include those measures since
    // our data is in grams (mass):
    const massUnits = Convert().from('g').possibilities()
    let unitData = []
    const allUnits = Convert().possibilities()
    if (allUnits.includes(sanitizedMeasureUnit)) {
    // if (Convert().possibilities().includes(measureUnit)) {
      // Cryptic one-liner for set-union (3rd result on following SO):
      // http://stackoverflow.com/questions/3629817/getting-a-union-of-two-arrays-in-javascript
      unitData = [...new Set([...massUnits,...Convert().from(sanitizedMeasureUnit).possibilities()])]
      // unitData = massUnits.concat(Convert().from(measureUnit).possibilities())

      // One-liner for set difference
      // From: http://stackoverflow.com/questions/1723168/what-is-the-fastest-or-most-elegant-way-to-compute-a-set-difference-using-javasc
      unitData = unitData.filter(x => excludedUnits.indexOf(x) < 0)
    } else {
      //console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      //console.log("Unsupported measureUnit = " + sanitizedMeasureUnit);
      unitData = massUnits.concat([sanitizedMeasureUnit])
      unitData = unitData.filter(x => excludedUnits.indexOf(x) < 0)
    }
    return unitData
  }
  render() {
    const numIngredients = Object.keys(this.props.nutrition.parsedData).length
    const loadedIngredients = Object.keys(this.props.model.matchData).length
    if (!this.props.user.login && !this.props.user.anonymous) {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Oh snap! Login Error!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    } else if (loadedIngredients < numIngredients) {
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
    for (let tag in matchData) {
      if (! (tag in ingredientControlModels)) {
        notFound = notFound + tag + " "
        continue
      }
      sliders.push(
        <IngredientController
          tag={tag}
          ingredientControlModel={this.props.model.ingredientControlModels[tag]}
          handleChipDelete={this.handleChipDelete.bind(this, tag)}
          handleSliderValuesChange={this.handleSliderValuesChange.bind(this, tag)}
          handleUnitDropdownChange={this.handleUnitDropdownChange.bind(this, tag)}
          handleMatchDropdownChange={this.handleMatchDropdownChange.bind(this, tag)}
        />
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
    const {servingControls} = this.state

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
        <TopBar step="3"
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
                <ServingsController
                  value={servingControls['value']}
                  min={servingControls['min']}
                  max={servingControls['max']}
                  step={servingControls['step']}
                  unit={servingControls['unit']}
                  handleServingValuesChange={this.handleServingValuesChange.bind(this)}
                  handleServingDropDownChange={this.handleServingDropDownChange.bind(this)}
                />
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
                    tagName={'No match found for these tags:'}
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
