var React = require('react')
import Label from './NutritionEstimateJSX'
import NutritionAlg from '../../algorithms/NutritionAlg'
import {IngredientModel} from '../models/IngredientModel'
import {NutritionModel} from '../models/NutritionModel'
import {IngredientControlModel} from '../models/IngredientControlModel'
import {Redirect} from 'react-router'
import {getValueInUnits, getIngredientValueInUnits, mapToSupportedUnits} from '../../helpers/ConversionUtils'

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
      servingControls: {
        value: 2,
        unit: 'people',
        min: 1,
        max: 12,
        step: 1
      }
    }
  }
  componentWillMount() {
    // Process the caption for matches in the FDA database:
    //
    const tagString = this.generateSelectedTags().trim()
    // const tagString = "#tomato #cucumber #onion #lettuce #olive #feta"
    // TODO: AC! **************** regexp errors here for / characters
    this.state.nutAlg.processTags(tagString)

    let nutritionModel = this.state.nutritionModel
    let ingredientControlModels = this.state.ingredientControlModels

    for (let tag in this.state.nutAlg.getMatches()) {
      const tagMatches = this.state.nutAlg.getMatchList(tag)
      if (tagMatches.length === 0) {
        console.log('No matches found in database for tag: ' + tag)
        continue
      }
      const key = this.state.nutAlg.getBestMatchForTag(tag)
      const dataForKey = this.state.nutAlg.getDataForKey(key)

      let ingredientModel = new IngredientModel()
      ingredientModel.initializeSingle(key, tag, dataForKey)

      // Get the Unit data
      let measureQuantity = ingredientModel.getMeasureQuantity()
      let measureUnit = ingredientModel.getMeasureUnit()

      nutritionModel.addIngredient(
        key, ingredientModel, measureQuantity, measureUnit)

      let ingredientControlModel =
        new IngredientControlModel(
              measureQuantity,
              this.getPossibleUnits(measureUnit),
              measureUnit,
              tagMatches,
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
    this.props.router.push('/result/'+this.props.nutrition.username + '/' + this.props.nutrition.key)
  }
  //
  handleServingValuesChange(servingValue) {
    let servingControls = this.state.servingControls
    let nutritionModel = this.state.nutritionModel

    servingControls['value'] = servingValue
    nutritionModel.setSuggestedServingAmount(servingValue, servingControls['unit'])

    this.setState({
      nutritionModel: nutritionModel,
      servingControls: servingControls
    })
  }
  //
  handleServingDropDownChange(servingUnit) {
    let servingControls = this.state.servingControls
    let nutritionModel = this.state.nutritionModel

    if (servingUnit === 'people') {
      servingControls['min'] = 1
      servingControls['max'] = 12
      servingControls['step'] = 1
      servingControls['value'] = 2
    } else {
      servingControls['min'] = 0
      servingControls['max'] = 100
      servingControls['step'] = 10
      servingControls['value'] = 50
    }
    servingControls['unit'] = servingUnit

    nutritionModel.setSuggestedServingAmount(servingControls['value'], servingUnit)

    this.setState({
      nutritionModel: nutritionModel,
      servingControls: servingControls
    })
  }
  //
  handleSliderValuesChange(tag, value) {
    let ingredientControlModels= this.state.ingredientControlModels
    ingredientControlModels[tag].setSliderValue(value)

    let nutritionModel = this.state.nutritionModel
    nutritionModel.scaleIngredientToUnit(tag, value, ingredientControlModels[tag].getDropdownUnitValue())

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
    let nutritionModel = this.state.nutritionModel

    // 1. Save the current ingredient key for deletion at the end of this
    //    process:
    let ingredientKeyToDelete = ingredientControlModels[tag].getDropdownMatchValue()
    let ingredientModelToDelete = nutritionModel.getIngredientModel(tag)
    //
    // 2. Create a new IngredientModel:
    //
    const dataForKey = this.state.nutAlg.getDataForKey(value)
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(value, tag, dataForKey)
    //
    // 3. Update the match value state for the dropdown:
    //
    ingredientControlModels[tag].setDropdownMatchValue(value)
    //
    // 4. Update the dropdown units and unit value:
    //
    //    a. Get the list of new measurement units that are possible:
    //
    let newMeasureUnit = mapToSupportedUnits(ingredientModel.getMeasureUnit())
    let newUnits = this.getPossibleUnits(newMeasureUnit)
    ingredientControlModels[tag].setDropdownUnits(newUnits)
    //
    //    b. See if the current unit is within the new possibilies, if not
    //       then set to the FDA measure defaults
    //
    const currentValue = ingredientControlModels[tag].getSliderValue()
    const currentUnit = ingredientControlModels[tag].getDropdownUnitValue()

    let newValue = undefined
    let newUnit = undefined
    if (newUnits.includes(currentUnit)) {
      newValue = currentValue
      newUnit = currentUnit
    } else {
      console.log('Ingredient change conversion--using grams to convert:')
      console.log('   ' + currentValue + currentUnit + ' to ' + newMeasureUnit)

      // Convert current unit to grams, then convert grams to new measure unit
      // for new ingredient
      let valueInGrams = getValueInUnits(
        currentValue, currentUnit, 'g', ingredientModelToDelete)
      newValue = getValueInUnits(
        valueInGrams, 'g', newMeasureUnit, ingredientModel)
      newUnit = newMeasureUnit

      ingredientControlModels[tag].setSliderValue(newValue)
      ingredientControlModels[tag].setDropdownUnitValue(newUnit)
      // TODO: possibly an alert to tell the user we've converted their number
      //       to a new amount due to unit change and the old units are not
      //       available.
    }
    //
    // 5. Remove the current IngredientModel from the NutritionModel:
    //
    nutritionModel.removeIngredient(ingredientKeyToDelete)
    //
    // 6. Add the new IngredientModel to the NutritionModel:
    nutritionModel.addIngredient(value,
                                 ingredientModel,
                                 newValue,
                                 newUnit)
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

    // TODO: catch the exception from here and mention that their current value
    // will be lost if we change to those units.
    let newValue = getIngredientValueInUnits(
      newUnit, ingredientModel, ingredientControlModel)

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
    //    this.state..

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
  //
  handleChipAdd(tag) {
    console.log('handleChipAdd    ------------------------------------------------')
    console.log('tag = ' + tag)
    console.log('selectedTags = ')
    console.log(this.state.selectedTags)
    console.log('deletedTags = ')
    console.log(this.state.deletedTags)

    let matches = this.state.matches
    let nutAlg = this.state.nutAlg
    let nutritionModel = this.state.nutritionModel
    let ingredientControlModels = this.state.ingredientControlModels

    let selectedTags = this.state.selectedTags
    let deletedTags = this.state.deletedTags

    if (tag in matches) {
      console.log('   Unable to add ' + tag + ' back; already found in matches.')
      return
    }

    // TODO: A lot of this is common to componentWillMount. Refactor

    // 1. Add this tag to:
    //    - this.state.matches
    //    - this.state.nutAlg.matches
    //    - this.state.nutritionModel
    //    - ingredientControlModels
    //
    let localNutAlg = new NutritionAlg()
    localNutAlg.processTags(tag)
    matches[tag] = localNutAlg.getMatches()[tag]

    nutAlg.addMatches(tag, matches[tag])

    const key = nutAlg.getBestMatchForTag(tag)
    const dataForKey = nutAlg.getDataForKey(key)
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(key, tag, dataForKey)

    const measureQuantity = ingredientModel.getMeasureQuantity()
    const measureUnit = ingredientModel.getMeasureUnit()
    nutritionModel.addIngredient(
      key, ingredientModel, measureQuantity, measureUnit)

    let ingredientControlModel =
      new IngredientControlModel(
            measureQuantity,
            this.getPossibleUnits(measureUnit),
            measureUnit,
            nutAlg.getMatchList(tag),
            key)
    ingredientControlModels[tag] = ingredientControlModel

    // 2. Add the tag to selectedTags and remove it from deleted tags ...
    //
    for (let i = 0; i < deletedTags.length; i++) {
      if (tag === deletedTags[i]) {
        deletedTags = deletedTags.splice(i, 1)
        break
      }
    }
    selectedTags.push(tag)

    this.setState({
      matches: matches,
      nutAlg: nutAlg,
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
      // caption = "seasoning breakfast eggs spinach butter"
      // updatedCaption = "eggs spinach butter"
      caption = "Wild Salmon baked with lemongrass and chili flakes over a bed of ginger veggies, including bok choy, broccolini, mushrooms, peppers, and onions"
      updatedCaption = "Wild Salmon lemongrass chili flakes ginger veggies bok choy broccolini mushrooms peppers onions"
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
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      console.log("Unsupported measureUnit = " + sanitizedMeasureUnit)
      unitData = massUnits.concat([sanitizedMeasureUnit])
      unitData = unitData.filter(x => excludedUnits.indexOf(x) < 0)
    }
    return unitData
  }
  //////////////////////////////////////////////////////////////////////////////
  // UI Element Generation:
  //////////////////////////////////////////////////////////////////////////////
  getChipsFromArray(anArray) {
    let htmlResult = []
    for (let i = 0; i < anArray.length; i++) {
      let tag = anArray[i]
      htmlResult.push(
        <Chip
          onDeleteClick={this.handleChipAdd.bind(this, tag)}
          deletable>
          <span style={{textDecoration: 'line-through'}}>
            {tag}
          </span>
        </Chip>)
    }
    return (
      <div>{htmlResult}</div>
    )
  }
  //
  getServingsController() {
    return (
      <div>
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>Servings</text>
          </Col>
        </Row>
        <div style={{borderWidth: 1,
                     borderColor: 'black',
                     borderStyle: 'solid',
                     borderRadius: 5,
                     padding: 10,
                     marginRight: 10,
                     marginLeft: 10}}>
          <Row>
            <Col xs={10} md={10}>
              <Slider
                value={this.state.servingControls['value']}
                onChange={this.handleServingValuesChange.bind(this)}
                min={this.state.servingControls['min']}
                max={this.state.servingControls['max']}
                step={this.state.servingControls['step']}
                editable pinned snaps/>
            </Col>
            <Col xs={2} md={2}>
                {/* TODO */}
                <Dropdownlist
                  data={['people', 'g']}
                  value={this.state.servingControls['unit']}
                  onChange={this.handleServingDropDownChange.bind(this)}/>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
  //
  getDiscardedTagPanel() {
    return (
      <div>
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>Discarded Tags:</text>
          </Col>
        </Row>
        <div style={{borderWidth: 1,
                     borderColor: 'black',
                     borderStyle: 'solid',
                     borderRadius: 5,
                     padding: 10,
                     marginRight: 10,
                     marginLeft: 10}}>
          <Row>
            <Col xs={12} md={12}>
              {/* The section elements here separate the updated tags from the
                  eliminated ones */}
              {this.getChipsFromArray(this.state.deletedTags)}
            </Col>
          </Row>
        </div>
      </div>
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
  render() {
    console.log('\n\n\n\nParsed data incoming: ', this.props.nutrition.parsedData)
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
    const compositeModel = this.state.nutritionModel.getScaledCompositeIngredientModel()
    const composite = compositeModel.serialize()

    // TODO: PBJ, what does the next line do? Is it needed here?
    let hideUrlModal = () => this.setState({ showUrlModal: false })
    const eventKey = this.props.nutrition.anonymous === false ? "2" : "1"

    return (
      <Grid>
        <Row>
          <Col xs={12} md={12}>
            <div>
              <Button className="btn-primary-spacing" bsStyle="info" onClick={() => this.props.goToImage()}>Image</Button>
              <DropdownButton bsStyle="success" title="Share Label" key={1} id={`split-button-basic`}>
                <MenuItem eventKey={eventKey} onClick={this.transitionToLabelPage.bind(this, false, composite, full)}>Share URL</MenuItem>
              </DropdownButton>
            </div>
          </Col>
        </Row>
        {/*Serving size below: TODO refactor*/}
        <Row style={{marginTop: 20}}>
          <Col xs={8} md={8}>
            {this.getServingsController()}
          </Col>
          {/* The padding L/R = 5 is to get the nutrition label to align
              with the discarded tags widget in most situations. */}
          <Col xs={4} md={4} style={{paddingRight: 5, paddingLeft: 5}}>
              {this.getDiscardedTagPanel()}
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
              <Label ingredientComposite={compositeModel}/>
            </div>
          </Col>
        </Row>
      </Grid>
    )
  }
}
