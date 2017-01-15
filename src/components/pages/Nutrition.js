var React = require('react')
import Label from './NutritionEstimateJSX'
import NutritionAlg from '../../algorithms/NutritionAlg'
import {IngredientModel} from '../models/IngredientModel'
import {NutritionModel} from '../models/NutritionModel'

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

export default class Nutrition extends React.Component {
  //////////////////////////////////////////////////////////////////////////////
  // React / Component API:
  //////////////////////////////////////////////////////////////////////////////
  constructor(props) {
    super(props)
    this.state = {
      sliderValueDict: {},
      matchDropdownValueDict: {},
      unitDropdownValueDict: {},
      nutritionModel: new NutritionModel(),
      matches: {},
      nutAlg: new NutritionAlg(),
      showUrlModal: false,
      selectedTags: [],
      deletedTags: [],
      servingValue: 100
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
    const sliderInitValue = 100.0
    let sliderValueDict = {}
    let matchDropdownValueDict = {}
    let unitDropdownValueDict = {}
    let nutritionModel = this.state.nutritionModel
    for (let tag in this.state.nutAlg.getMatches()) {
      const key = this.state.nutAlg.getBestMatchForTag(tag)
      const dataForKey = this.state.nutAlg.getDataForKey(key)

      sliderValueDict[tag] = sliderInitValue
      matchDropdownValueDict[tag] = key
      unitDropdownValueDict[tag] = 'grams'

      let ingredient = new IngredientModel()
      ingredient.initializeSingle(key, tag, dataForKey)
      nutritionModel.addIngredient(key, ingredient, sliderInitValue)
    }
    this.setState({
      matches: this.state.nutAlg.getMatches(),
      sliderValueDict: sliderValueDict,
      matchDropdownValueDict: matchDropdownValueDict,
      unitDropdownValueDict: unitDropdownValueDict,
      nutritionModel: nutritionModel
    })
  }
  //////////////////////////////////////////////////////////////////////////////
  // Action Handlers:
  //////////////////////////////////////////////////////////////////////////////
  transitionToLabelPage(flag, composite, full) {
    if (flag)
      this.props.postLabelId(this.props.nutrition.key, this.props.resultUrl)
    this.props.sendSerializedData(composite, full)
    this.props.router.push('/'+this.props.nutrition.key)
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
    let sliderValueDict = this.state.sliderValueDict
    sliderValueDict[tag] = value

    let nutritionModel = this.state.nutritionModel
    nutritionModel.scaleIngredientToPercent(tag, value)
    this.setState({
      sliderValueDict: sliderValueDict,
      nutritionModel: nutritionModel
    })
  }
  //
  handleMatchDropdownChange(tag, value) {
    console.log('handleMatchDropdownChange ----------------------------------------')
    console.log('tag = ' + tag)
    console.log('value = ' + value)

    let matchDropdownValueDict = this.state.matchDropdownValueDict

    // Need to remove the current Ingredient from the NutritionModel and add the new one
    let nutritionModel = this.state.nutritionModel
    nutritionModel.removeIngredient(matchDropdownValueDict[tag])
    //
    const dataForKey = this.state.nutAlg.getDataForKey(value)
    let ingredient = new IngredientModel()
    ingredient.initializeSingle(value, tag, dataForKey)
    nutritionModel.addIngredient(value, ingredient, this.state.sliderValueDict[tag])

    // Update the state value for the dropdown
    matchDropdownValueDict[tag] = value

    this.setState({
      matchDropdownValueDict: matchDropdownValueDict,
      nutritionModel: nutritionModel
    })
  }
  //
  handleUnitDropdownChange(tag, value) {
    console.log('handleUnitDropdownChange ----------------------------------------')
    console.log('tag = ' + tag)
    console.log('value = ' + value)
  }
  handleChipDelete(tag) {
    console.log('handleChipDelete ------------------------------------------------')
    console.log('tag = ' + tag)
    console.log('selectedTags = ')
    console.log(this.state.selectedTags)
    console.log('deletedTags = ')
    console.log(this.state.deletedTags)

    // Delete this tag from:
    //    this.state.matches
    //    this.state.nutritionModel
    //    sliderValueDict
    //    matchDropDownValueDict
    //    unitDropdownValueDict
    //
    //
    let matches = this.state.matches
    let nutritionModel = this.state.nutritionModel
    let sliderValueDict = this.state.sliderValueDict
    let matchDropdownValueDict = this.state.matchDropdownValueDict
    let unitDropdownValueDict = this.state.unitDropdownValueDict
    let selectedTags = this.state.selectedTags
    let deletedTags = this.state.deletedTags
    //
    delete matches[tag]
    nutritionModel.removeIngredient(matchDropdownValueDict[tag])
    delete sliderValueDict[tag]
    delete matchDropdownValueDict[tag]
    delete unitDropdownValueDict[tag]
    //
    // Remove the tag from selectedTags (use splice--delete just makes the element undefined)
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
      sliderValueDict: sliderValueDict,
      matchDropdownValueDict: matchDropdownValueDict,
      unitDropdownValueDict: unitDropdownValueDict,
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
    // Proposed layout:
    //  Text: Tag,  Pulldown: Matches (could double as search bar if combobox)
    //  EditboxSlider: Quanity, Pulldown: Units, Text: meta for units
    //
    //  Example:
    //
    //      Egg:
    //      <--------*-------------------------> [   1]
    //      [Eggs, scrambled, frozen mixture]^v [egg]^v
    //
    // Changing the unit takes the quanity and converts it to g for use with our model.
    // We might store these in userQuantity, userUnit.
    //
    // Going forward we'll need code in here to preset the slider and unit from
    // the recipe

    const key = this.state.nutAlg.getBestMatchForTag(tag)
    const dataForKey = this.state.nutAlg.getDataForKey(key)
    const matchData = this.state.nutAlg.getMatchList(tag)
    const unitData = ['TODO', 'grams', 'cups', 'tablespoons', 'teaspoons']
    // This is additional unit information (probably make it a little info
    // button next to the units that pops up)
    const meta = ' (TODO - meta)'

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
                  value={this.state.sliderValueDict[tag]}
                  onChange={this.handleSliderValuesChange.bind(this, tag)}
                  min={0}
                  max={400}
                  step={10}
                  editable pinned snaps/>
              </Col>
              <Col xs={2} md={2} style={{paddingLeft: 0}}>
                <Dropdownlist
                  data={unitData}
                  value={this.state.unitDropdownValueDict[tag]}
                  onChange={this.handleUnitDropdownChange.bind(this, tag)}/>
              </Col>
            </Row>
            {/* row 3 from above: */}
            <Row
              style={{marginTop: 10}}>
              <Col xs={12} md={12}>
              <Dropdownlist
                data={matchData}
                value={this.state.matchDropdownValueDict[tag]}
                onChange={this.handleMatchDropdownChange.bind(this, tag)}/>
              </Col>
            </Row>
          </div>
      </div>
    )
  }
  render() {
    let sliders = []
    let notFound = ""
    for (let tag in this.state.matches) {
      const key = this.state.nutAlg.getBestMatchForTag(tag)
      if (key === "") {
        notFound = notFound + tag + " "
        continue
      }
      sliders.push(this.getIngredientController(tag))
    }
    if (notFound != "") {
      notFound = "(No data for: " + notFound + ")"
    }
    const full = this.state.nutritionModel.serialize()
    const composite = this.state.nutritionModel.getScaledCompositeIngredientModel().serialize()
    // TODO: PBJ, what does the next line do? Is it needed here?
    let hideUrlModal = () => this.setState({ showUrlModal: false })
    const eventKey = this.props.nutrition.anonymous === false ? "2" : "1"
    return (
      <Grid>

        <Row className='show-grid'>
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

        {/*TODO: what is 'show-grid' about?*/}
        <Row className="show-grid">
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
