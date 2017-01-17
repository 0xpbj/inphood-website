var React = require('react')
import Label from './NutritionEstimateJSX'
import NutritionAlg from '../../algorithms/NutritionAlg'
import {IngredientModel} from '../models/IngredientModel'
import {NutritionModel} from '../models/NutritionModel'
import {IngredientControlModel} from '../models/IngredientControlModel'
import {Redirect} from 'react-router'

// import { VictoryPie } from 'victory'
import Chip from 'react-toolbox/lib/chip'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Modal from 'react-bootstrap/lib/Modal'
import Slider from 'react-toolbox/lib/slider'
import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'

const Config = require('Config')
const Convert = require('convert-units')

// TODO: Move this somewhere appropriate (i.e. utils/dataUtils etc.)
const UnitTranslationMap = {
  tbsp: ['T', 'Tbs', 'tbs', 'tbsp.', 'Tbsp.', 'Tbsp', 'tbsp', 'TB', 'TBS', 'TBSP'],
  tsp: ['t', 'Tsp', 'tsp', 'tsp.', 'Tsp.', 'TS', 'TSP'],
  cup: ['C', 'c'],
  pnt: ['pt', 'PT', 'Pt'],
  qt: ['QT', 'Qt', 'qt'],
  gal: ['Gal', 'GAL', 'gal'],
  'fl-oz': ['oz', 'Oz', 'OZ', 'oz.', 'Oz.', 'OZ.'],
  ml: ['ml'],
  l: ['L', 'l'],
  lb: ['lb', 'Lb', 'LB', 'lb.', 'Lb.', 'LB.'],
  g: ['g', 'gram'],
  kg: ['kg', 'Kg', 'kilogram', 'Kilogram']
}

export default class Nutrition extends React.Component {
  //////////////////////////////////////////////////////////////////////////////
  // React / Component API:
  //////////////////////////////////////////////////////////////////////////////
  constructor(props) {
    super(props)
    this.state = {
      ingredientControlModels: {},
      nutritionModel: new NutritionModel(),
      matches: {},
      nutAlg: new NutritionAlg(),
      showUrlModal: false,
      selectedTags: [],
      deletedTags: [],
      servingValue: 100,
      transition: false
    }
  }
  componentWillMount() {
    // Process the caption for matches in the FDA database:
    //
    const tagString = this.generateSelectedTags().trim()
    // const tagString = "#tomato #cucumber #onion #lettuce #olive #feta"
    // TODO: AC! **************** regexp errors here for / characters
    this.state.nutAlg.processTags(tagString)
    //
    // Create the slider values dictionary state and initialize each one to 100:
    //
    const sliderInitValue = -1
    let nutritionModel = this.state.nutritionModel
    let ingredientControlModels = this.state.ingredientControlModels

    for (let tag in this.state.nutAlg.getMatches()) {
      const key = this.state.nutAlg.getBestMatchForTag(tag)
      const dataForKey = this.state.nutAlg.getDataForKey(key)

      let ingredientModel = new IngredientModel()
      ingredientModel.initializeSingle(key, tag, dataForKey)
      nutritionModel.addIngredient(key, ingredientModel, sliderInitValue)

      // Get the Unit data
      let measureUnit = ingredientModel.getMeasureUnit()

      let ingredientControlModel =
        new IngredientControlModel(
              sliderInitValue,
              this.getPossibleUnits(measureUnit),
              measureUnit,
              this.state.nutAlg.getMatchList(tag),
              key)

      ingredientControlModels[tag] = ingredientControlModel
    }

    this.setState({
      matches: this.state.nutAlg.getMatches(),
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels
    })
  }
  //////////////////////////////////////////////////////////////////////////////
  // Action Handlers:
  //////////////////////////////////////////////////////////////////////////////
  transitionToLabelPage(flag, composite, full) {
    if (flag)
      this.props.postLabelId(this.props.nutrition.key, this.props.resultUrl)
    this.props.sendSerializedData(composite, full)
    this.setState({transition: true})
    // this.props.router.push('/'+this.props.nutrition.key)
  }
  //
  handleServingValuesChange(servingValue) {
    let nutritionModel = this.state.nutritionModel
    nutritionModel.setSuggestedServingAmount(servingValue)
    this.setState({
      servingValue: servingValue,
      nutritionModel: nutritionModel
    })
  }
  //
  handleSliderValuesChange(tag, value) {
    let ingredientControlModels= this.state.ingredientControlModels
    ingredientControlModels[tag].setSliderValue(value)

    let nutritionModel = this.state.nutritionModel
    nutritionModel.scaleIngredientToPercent(tag, value)

    this.setState({
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels
    })
  }
  //
  handleMatchDropdownChange(tag, value) {
    console.log('handleMatchDropdownChange ----------------------------------------')
    console.log('tag = ' + tag)
    console.log('value = ' + value)

    let ingredientControlModels = this.state.ingredientControlModels

    // 1. Remove the current IngredientModel from the NutritionModel:
    //
    let nutritionModel = this.state.nutritionModel
    nutritionModel.removeIngredient(
      ingredientControlModels[tag].getDropdownMatchValue())
    //
    // 2. Create a new IngredientModel and add it to the NutritionModel:
    //
    const dataForKey = this.state.nutAlg.getDataForKey(value)
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(value, tag, dataForKey)
    nutritionModel.addIngredient(value,
                                 ingredientModel,
                                 ingredientControlModels[tag].getSliderValue())
    //
    // 3. Update the match value state for the dropdown:
    //
    ingredientControlModels[tag].setDropdownMatchValue(value)
    //
    // 4. Update the Units and Unit Value:
    //
    //    a. Get the list of new measurement units that are possible:
    //
    let newMeasureUnit = ingredientModel.getMeasureUnit()
    let newUnits = this.getPossibleUnits(newMeasureUnit)
    ingredientControlModels[tag].setDropdownUnits(newUnits)
    //
    //    b. See if the current unit is within the new possibilies (if not
    //       perform a conversion)
    //
    let currentUnit = ingredientControlModels[tag].getDropdownUnitValue()
    if (!newUnits.includes(currentUnit)) {
      console.log('TODO -----------------------------------------------------------')
      console.log('Need to convert unit ' + currentUnit + ' to one of:')
      console.log(newUnits.toString())
      //
      // TODO: remove this temporary hack
      ingredientControlModels[tag].setDropdownUnitValue(newMeasureUnit)
      //
      // TODO: conversion to next best thing
      //         - choose a unit
      //         - perform a numerical conversion
    }

    this.setState({
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels
    })
  }
  //
  handleUnitDropdownChange(tag, value) {
    console.log('handleUnitDropdownChange ----------------------------------------')
    console.log('tag = ' + tag)
    console.log('value = ' + value)

    let newUnit = value
    let ingredientControlModels = this.state.ingredientControlModels
    let ingredientControlModel = ingredientControlModels[tag]
    let ingredientModel = this.state.nutritionModel.getIngredientModel(tag)
    let newValue = this.getConvertedValue(newUnit, ingredientModel, ingredientControlModel)

    ingredientControlModels[tag].setSliderValue(newValue)
    ingredientControlModels[tag].setDropdownUnitValue(newUnit)

    this.setState({
      ingredientControlModels: ingredientControlModels
    })
  }
  //
  handleChipDelete(tag) {
    console.log('handleChipDelete ------------------------------------------------')
    console.log('tag = ' + tag)
    console.log('selectedTags = ')
    console.log(this.state.selectedTags)
    console.log('deletedTags = ')
    console.log(this.state.deletedTags)

    // 1. Delete this tag from:
    //    this.state.matches
    //    this.state.nutritionModel
    //    ingredientControlModels
    //
    let matches = this.state.matches
    let nutritionModel = this.state.nutritionModel
    let ingredientControlModels = this.state.ingredientControlModels
    //
    let selectedTags = this.state.selectedTags
    let deletedTags = this.state.deletedTags
    //
    delete matches[tag]
    nutritionModel.removeIngredient(ingredientControlModels[tag].getDropdownMatchValue())
    delete ingredientControlModels[tag]
    //
    // 2. Remove the tag from selectedTags (use splice--delete just makes the
    //    element undefined):
    //
    for (let i = 0; i < selectedTags.length; i++) {
      if (tag === selectedTags[i]) {
        selectedTags = selectedTags.splice(i, 1)
        break
      }
    }
    deletedTags.push(tag)
    //
    this.setState({
      matches: matches,
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels,
      selectedTags: selectedTags,
      deletedTags: deletedTags
    })
  }
  //////////////////////////////////////////////////////////////////////////////
  // Miscellany:
  //////////////////////////////////////////////////////////////////////////////
  //
  // This method filters out words in the caption that do not match a list of the
  // unique words in our current DB
  //
  filterCaptionWords(caption) {
    if (caption !== '') {
      let regex = /\w+/g
      let words = caption.match(regex)
      var file = require("raw-loader!../../data/complete-001.unique-words.txt")
      let fileWords = new Set(file.match(regex))
      let fileIntersection = new Set([...words].filter(x => fileWords.has(x)))
      // var food = require("raw-loader!../../data/ingredients.txt")
      // let foodWords = new Set(food.match(regex))
      // let foodIntersection = new Set([...fileIntersection].filter(x => foodWords.has(x)))
      return fileIntersection
    }
  }
  // Given the original catpion string (caption) and one with selections by a user (updatedCaption),
  // this method generates two arrays, selectedTagArr and deletedTagArr, as well as returning a
  // space delimited string containing selected tags.
  //
  generateSelectedTags() {
    let {caption, updatedCaption} = this.props.nutrition

    if (Config.fastDevelopNutritionPage) {
      caption = "seasoning breakfast eggs spinach butter"
      updatedCaption = "eggs spinach butter"
    }

    let deletedTagArr = []
    let selectedTagArr = []
    let originalWordSet = this.filterCaptionWords(caption)

    if (updatedCaption === '') {
      selectedTagArr = [...originalWordSet]
    } else {
      const regex = /\w+/g
      let updatedWordSet = new Set(updatedCaption.match(regex))
      let cancelledWordSet = new Set([...originalWordSet].filter(x => !updatedWordSet.has(x)))

      selectedTagArr = [...updatedWordSet]
      deletedTagArr = [...cancelledWordSet]
    }

    this.setState({
      selectedTags: selectedTagArr,
      deletedTags: deletedTagArr
    })

    const result = selectedTagArr.toString().replace(/,/g, ' ')
    return result
  }
  //
  getPossibleUnits(measureUnit) {
    const excludedUnits = [
      'mm3', 'cm3', 'm3', 'km3', 'in3', 'ft3', 'yd3',
      'mcg', 'mg']

    // We can also convert anything to grams so include those measures since
    // our data is in grams (mass):
    const massUnits = Convert().from('g').possibilities()

    let unitData = []
    if (Convert().possibilities().includes(measureUnit)) {
      unitData = massUnits.concat(Convert().from(measureUnit).possibilities())
      // From: http://stackoverflow.com/questions/1723168/what-is-the-fastest-or-most-elegant-way-to-compute-a-set-difference-using-javasc
      unitData = unitData.filter(x => excludedUnits.indexOf(x) < 0)
    } else {
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      console.log("Unsupported measureUnit = " + measureUnit)
      unitData = massUnits.concat([measureUnit])
      unitData = unitData.filter(x => excludedUnits.indexOf(x) < 0)
    }
    return unitData
  }
  //
  mapToSupportedUnits(aUnit) {
    for (let supportedUnit in UnitTranslationMap) {
      if ((aUnit === supportedUnit)
          || (UnitTranslationMap[supportedUnit].includes(aUnit))) {
        return supportedUnit
      }
    }

    // TODO Throw an error!!!!
    return undefined
  }
  //
  isVolumeUnit(aUnit) {
    if (Convert().possibilities().includes(aUnit)) {
      return (Convert().describe(aUnit)['measure'] === 'volume')
    }
    // If it's not a supported unit, return false
    return false
  }
  //
  getConvertedValue(newUnit, ingredientModel, ingredientControlModel) {
    // 1. Determine the type of measure for the current and proposed units:
    //
    const currentUnit = ingredientControlModel.getDropdownUnitValue()
    const currentValue = ingredientControlModel.getSliderValue()

    let currentUnitType = 'other'
    if (Convert().possibilities().includes(currentUnit)) {
      currentUnitType = Convert().describe(currentUnit)['measure']
    }

    let newUnitType = 'other'
    if (Convert().possibilities().includes(newUnit)) {
      newUnitType = Convert().describe(newUnit)['measure']
    }

    // TODO: consider a second call here to do custom mappings (i.e. 1 pat butter
    //       to 1/2 tablespoon)
    const fdaMeasureUnit =
      this.mapToSupportedUnits(ingredientModel.getMeasureUnit())
    const fdaMeasureQuantity = ingredientModel.getMeasureQuantity()
    const fdaMeasureInGrams = ingredientModel.getMeasureWeightGrams()

    let newValue = 0
    // 2. Perform the required conversion:
    //
    //   a) from unit type 'mass' to 'mass' or unit type 'volume' to 'volume':
    if ((newUnitType === currentUnitType) && (newUnitType !== 'other')) {
      newValue = Convert(currentValue).from(currentUnit).to(newUnit)
    }
    //   b) from unit type 'mass' to 'volume':
    else if ((currentUnitType === 'mass') && (newUnitType === 'volume')) {
      // - get the current unit into grams
      let gramValue = Convert(currentValue).from(currentUnit).to('g')
      // - see if the FDA 'measure' is a volume unit
      if (! this.isVolumeUnit(fdaMeasureUnit)) {
        // TODO: MVP2 error for some measures
        // TODO: MVP3 / MVP2 alternate conversion (i.e. butter 'pat' -> 1/2 Tbsp)
      }
      // - if so use the FDA 'measure' data to convert 'grams' to 'measures'
      let fdaMeasureVolumeValue = gramValue * fdaMeasureQuantity / fdaMeasureInGrams
      // - convert the measure to the new unit
      newValue = Convert(fdaMeasureVolumeValue).from(fdaMeasureUnit).to(newUnit)
    }
    //   c) from unit type 'volume' to 'mass':
    else if ((currentUnitType === 'volume') && (newUnitType === 'mass')) {
      // - see if the FDA 'measure' is a volume unit
      if (! this.isVolumeUnit(fdaMeasureUnit)) {
        // TODO: MVP2 error for some measures
        // TODO: MVP3 / MVP2 alternate conversion (i.e. butter 'pat' -> 1/2 Tbsp)
      }
      // - if so, get the current unit into the fda measure units
      let fdaMeasureValue = Convert(currentValue).from(currentUnit).to(fdaMeasureUnit)
      // - use the fda 'measure' data to convert 'measures' to 'grams'
      let gramValue = fdaMeasureValue * fdaMeasureInGrams / fdaMeasureQuantity
      // convert 'grams' to the new mass unit
      newValue = Convert(gramValue).from('g').to(newUnit)
    }
    //   d) from unit type 'other' (unsupported volume) to 'mass':
    else if ((currentUnitType === 'other') && (newUnitType === 'mass')) {
      // - presumably currentUnit (other) is an FDA unit, check:
      if (! currentUnit === fdaMeasureUnit) {
        // TODO: MVP2 error for some measures (this should probably never happen)
      }
      // - Convert the FDA unit to grams using the fda 'measure' data
      let gramValue = currentValue * fdaMeasureInGrams / fdaMeasureQuantity
      // - Convert 'grams' to the new mass unit
      newValue = Convert(gramValue).from('g').to(newUnit)
    }
    //   e) from unit type 'mass' to 'other' (unsupported volume):
    else if ((currentUnitType === 'mass') && (newUnitType === 'other')) {
      // - presumably newUnitType (other) is an FDA unit, check:
      if (! newUnitType === fdaMeasureUnit) {
        // TODO: MVP2 error for some measures (this should probably never happen)
      }
      // - Conver the current unit to grams
      let gramValue = Convert(currentValue).from(currentUnit).to('g')
      // - Use the fda 'measure' data to convert grams to newUnitType
      newValue = gramValue * fdaMeasureQuantity / fdaMeasureInGrams
    }
    //   f) error:
    else {
      // TODO:
      // This probably shouldn't happen
      newValue = 0
    }

    console.log('Converted ' + currentValue + currentUnit
                + " to " + newValue + newUnit + " ---------")

    return newValue
  }
  //////////////////////////////////////////////////////////////////////////////
  // UI Element Generation:
  //////////////////////////////////////////////////////////////////////////////
  getChipsFromArray(anArray) {
    let htmlResult = []
    for (let i = 0; i < anArray.length; i++) {
      htmlResult.push(
        <Chip><span style={{textDecoration: 'line-through'}}>
          {anArray[i]}
        </span></Chip>)
    }
    return (
      <div>{htmlResult}</div>
    )
  }
  //
  getIngredientController(tag) {
    // Layout:
    //
    //      Egg:
    //      <--------*-------------------------> [   1] [egg]^v
    //      [Eggs, scrambled, frozen mixture                ]^v
    //
    // TODO: - the meta info about the unit (probably make it a little info
    // button next to the units that pops up)
    //
    const ingredientControlModel = this.state.ingredientControlModels[tag]

    return (
      <div>
          {/* row 1 from above: */}
          <Row
            style={{marginTop: 20}}>
            <Col xs={12} md={12}>
              <Chip
                onDeleteClick={this.handleChipDelete.bind(this, tag)}
                deletable>
                {tag}
              </Chip>
            </Col>
          </Row>
          <div style={{borderWidth: 1,
                       borderColor: 'black',
                       borderStyle: 'solid',
                       borderRadius: 5,
                       padding: 10,
                       marginRight: 10,
                       marginLeft: 10}}>
            {/* row 2 from above: */}
            <Row>
              <Col xs={10} md={10} style={{paddingLeft: 5, paddingRight: 5}}>
                <Slider
                  value={ingredientControlModel.getSliderValue()}
                  onChange={this.handleSliderValuesChange.bind(this, tag)}
                  min={ingredientControlModel.getSliderMin()}
                  max={ingredientControlModel.getSliderMax()}
                  step={ingredientControlModel.getSliderStep()}
                  editable
                  snaps/>
              </Col>
              <Col xs={2} md={2} style={{paddingLeft: 0}}>
                <Dropdownlist
                  data={ingredientControlModel.getDropdownUnits()}
                  value={ingredientControlModel.getDropdownUnitValue()}
                  onChange={this.handleUnitDropdownChange.bind(this, tag)}/>
              </Col>
            </Row>
            {/* row 3 from above: */}
            <Row
              style={{marginTop: 10}}>
              <Col xs={12} md={12}>
              <Dropdownlist
                data={ingredientControlModel.getDropdownMatches()}
                value={ingredientControlModel.getDropdownMatchValue()}
                onChange={this.handleMatchDropdownChange.bind(this, tag)}/>
              </Col>
            </Row>
          </div>
      </div>
    )
  }
  //
  render() {
    if (this.state.transition) {
      const path = '/label/' + this.props.nutrition.key
      return <Redirect to={path} />
    }

    //
    // 1. Generate a list of tags not found in our DB and build the array of
    //    sliders:
    //
    let sliders = []
    let notFound = ""
    let ingredientControlModels = this.state.ingredientControlModels
    for (let tag in this.state.matches) {
      if (! (tag in ingredientControlModels)) {
        notFound = notFound + tag + " "
        continue
      }

      sliders.push(this.getIngredientController(tag))
    }

    if (notFound != "") {
      notFound = "(No data for: " + notFound + ")"
    }
    //
    // 2. Serialize the nutrition model and composite ingreident model:
    //
    const full = this.state.nutritionModel.serialize()
    const composite = this.state.nutritionModel.getScaledCompositeIngredientModel().serialize()

    // TODO: PBJ, what does the next line do? Is it needed here?
    let hideUrlModal = () => this.setState({ showUrlModal: false })
    const eventKey = this.props.nutrition.anonymous === false ? "2" : "1"

    return (
      <Grid>
        <Row>
          <Col xs={8} md={8}>
            <text style={{fontWeight: 'bold'}}>Serving Size</text>
            <div style={{borderWidth: 1,
                         borderColor: 'black',
                         borderStyle: 'solid',
                         borderRadius: 5,
                         padding: 10,
                         margin: 10}}>
              <Slider
                value={this.state.servingValue}
                onChange={this.handleServingValuesChange.bind(this)}
                min={0}
                max={400}
                step={10}
                editable pinned snaps/>
            </div>
          </Col>
          <Col xs={4} md={4}>
            <text style={{fontWeight: 'bold'}}>Discarded Tags:</text>
            {/* The section elements here separate the updated tags from the
                eliminated ones */}
            <div style={{borderWidth: 1,
                         borderColor: 'black',
                         borderStyle: 'solid',
                         borderRadius: 5,
                         padding: 10,
                         margin: 10}}>
              {this.getChipsFromArray(this.state.deletedTags)}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} md={8}>
            {sliders}
          </Col>
          <Col xs={4} md={4}>
            {/* To align with sliders need margin of 37 and then text placeholder */}
            <div style={{marginTop: 37}}>
              <text>&nbsp;</text>
              <Label nutritionModel={this.state.nutritionModel}/>
            </div>
            <div>
              <Button className="btn-primary-spacing" bsStyle="info" onClick={() => this.props.goToGallery()}>Gallery</Button>
              <DropdownButton bsStyle="success" title="Share Label" key={1} id={`split-button-basic`}>
                <MenuItem eventKey={eventKey} onClick={this.transitionToLabelPage.bind(this, false, composite, full)}>Share URL</MenuItem>
              </DropdownButton>
            </div>
          </Col>
        </Row>
      </Grid>
    )
  }
}
