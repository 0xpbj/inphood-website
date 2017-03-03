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
        max: 24,
        step: 1
      },
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
        this.getPossibleUnits(tryUnit),
        tryUnit,
        tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
        description)
      this.props.ingredientAddModel(tag, ingredientControlModel)
      selectedTags.push(tag)
    }
    // Hackity hack hack--init the serving amount from the servingControls so they
    // match on presentation of the label
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User recipe parsed',
      nonInteraction: false,
    });
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
    ReactGA.event({
      category: 'User',
      action: 'User sharing results',
      nonInteraction: false
    });
    this.props.sendSerializedData(composite, full)
    this.props.router.push('result?label='+ this.props.nutrition.key)
  }
  handleServingValuesChange(servingValue) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Servings value changed',
      nonInteraction: false,
    });
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
      servingControls['max'] = 24
      servingControls['step'] = 1
      servingControls['value'] = 2
    } else {
      servingControls['min'] = 0
      servingControls['max'] = 600
      servingControls['step'] = 25
      servingControls['value'] = 100
    }
    servingControls['unit'] = servingUnit
    this.props.nutritionModelSetServings(servingControls['value'], servingUnit)
    this.setState({
      servingControls: servingControls
    })
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Servings value dropdown triggered',
      nonInteraction: false,
    });
  }
  handleSliderValuesChange(tag, value) {
    console.log('-------------------------------------------------------------');
    console.log('handleSliderValuesChange:');
    console.log('tag = ' + tag);
    console.log('value = ' + value);
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Slider value changed',
      nonInteraction: false,
    });
    this.props.ingredientSetSliderValue(tag, value)
    this.props.nutritionModelScaleIng(tag, value, this.props.model.ingredientControlModels[tag].getDropdownUnitValue())
  }
  handleSliderValuesChangeEditBox(tag, value, units) {
    // console.log('------------------------------------------------------------');
    // console.log('handleSliderValuesChangeEditBox:');
    // console.log('tag = ' + tag);
    // console.log('value = ' + value);
    this.props.ingredientSetSliderValue(tag, value)
    this.props.nutritionModelScaleIng(tag, value, units)
  }
  handleEditBoxValueChange(tag, value) {
    // console.log('------------------------------------------------------------');
    // console.log('handleEditBoxValueChange:');
    // console.log('tag = ' + tag);
    // console.log('value = ' + value);

    this.props.ingredientSetEditBoxValue(tag, value)
  }
  completeMatchDropdownChange(tag, value) {
    //console.log('completeMatchDropdownChange ----------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('value = ' + value);
    const {nutritionModel, ingredientControlModels} = this.props.model
    // 1. Save the current ingredient key for deletion at the end of this
    //    process:
    const ingredientControlModel = ingredientControlModels[tag]
    let ingredientKeyToDelete = ingredientControlModel.getDropdownMatchValue()
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
    const currentValue = ingredientControlModel.getSliderValue()
    const currentUnit = ingredientControlModel.getDropdownUnitValue()
    let newUnit = currentUnit
    if (! newUnits.includes(currentUnit)) {
      newUnit = newMeasureUnit
      this.props.ingredientSetDropdownUnitsValue(tag, newUnit)
    }
    // 5. Remove the current IngredientModel from the NutritionModel:
    this.props.nutritionModelRemIng(tag)
    // 6. Add the new IngredientModel to the NutritionModel:
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User added dropdown ingredient',
      nonInteraction: false,
      label: tag
    });
    this.props.nutritionModelAddIng(tag,
                                 ingredientModel,
                                 currentValue,
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
      if (value === '.....') {
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'User triggered elipses search',
          nonInteraction: false,
          label: tag
        });
        this.props.getMoreData(tag, tagMatches.length)
      }
      else {
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'User triggered dropdown lazy firebase fetch',
          nonInteraction: false,
          label: tag
        });
        this.props.lazyFetchFirebase(value, tag, tuple[keyOffset], index)
      }
    } else {
      this.completeMatchDropdownChange(tag, value)
    }
  }
  handleUnitDropdownChange(tag, value) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User changed units for ingredient',
      nonInteraction: false,
      label: tag
    });

    //console.log('handleUnitDropdownChange ----------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('value = ' + value);
    let newUnit = value
    let ingredientControlModel = this.props.model.ingredientControlModels[tag]
    let sliderValue = ingredientControlModel.getSliderValue()
    this.props.ingredientSetDropdownUnitsValue(tag, newUnit)
    this.props.nutritionModelScaleIng(tag, sliderValue, newUnit)
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
      // Removed following lines from <IngredientController:
      //           ingredientSetSliderValue={(tag, value)=>this.props.ingredientSetSliderValue(tag, value)}
      //           nutritionModelScaleIng={(tag, value, units)=>this.props.nutritionModelScaleIng(tag, value, units)}
      //
      // TODO: see what if anything can be deleted
      //
      sliders.push(
        <IngredientController
          tag={tag}
          recipeLine={recipeLine}
          ingredientControlModel={this.props.model.ingredientControlModels[tag]}
          handleChipDelete={this.handleChipDelete.bind(this, tag)}
          handleSliderValuesChange={(tag, value) => this.handleSliderValuesChange(tag, value)}
          handleUnitDropdownChange={this.handleUnitDropdownChange.bind(this, tag)}
          handleMatchDropdownChange={this.handleMatchDropdownChange.bind(this, tag)}
          handleSliderValuesChangeEditBox={(tag, value, units)=>this.handleSliderValuesChangeEditBox(tag, value, units)}
          handleEditBoxValueChange={(tag, value) => this.handleEditBoxValueChange(tag, value)}
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
