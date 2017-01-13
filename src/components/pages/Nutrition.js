var React = require('react')
import Label from './NutritionEstimateJSX'
import NutritionAlg from '../../algorithms/NutritionAlg'
import {Ingredient, NutritionModel} from '../models/NutritionModel'

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

export default class Nutrition extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sliderValueDict: {},
      matchDropdownValueDict: {},
      unitDropdownValueDict: {},
      nutritionModel: new NutritionModel(),
      matches: [],
      nutAlg: new NutritionAlg(),
      showUrlModal: false,
      parChips: [],
      updChips: [],
      servingValue: 100
    }
  }
  componentWillMount() {
    // Process the caption for matches in the FDA database:
    //
    const tagString = this.generateChips().trim()
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
    for (var tag in this.state.nutAlg.getMatches()) {
      const key = this.state.nutAlg.getBestMatchForTag(tag)
      const dataForKey = this.state.nutAlg.getDataForKey(key)

      sliderValueDict[key] = sliderInitValue
      var ingredient = new Ingredient()
      ingredient.initializeSingle(key, tag, dataForKey)

      matchDropdownValueDict[tag] = key
      unitDropdownValueDict[tag] = 'grams'

      var nutritionModel = this.state.nutritionModel
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
  parseCaption(caption) {
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
  generateChips() {
    const {caption, updatedCaption} = this.props.nutrition
    let regex = /\w+/g
    let result = ''
    if (updatedCaption === '') {
      let originalWords = this.parseCaption(caption)
      let updChips = []
      for (let word of originalWords) {
        updChips.push(
          <Chip>{word}</Chip>
        )
        result += word + ' '
      }
      this.setState({parChips: [], updChips})
    }
    else {
      let originalCaption = this.parseCaption(caption)
      let updatedWords= new Set(updatedCaption.match(regex))
      let cancelledWords = new Set([...originalCaption].filter(x => !updatedWords.has(x)))
      let parChips = []
      let updChips = []
      for (let word of cancelledWords) {
        parChips.push(
          <Chip><span style={{textDecoration: 'line-through'}}>{word}</span></Chip>
        )
      }
      for (let word of updatedWords) {
        updChips.push(
          <Chip>{word}</Chip>
        )
        result += word + ' '
      }
      this.setState({parChips, updChips})
    }
    return result
  }
  handleServingValuesChange(servingValue) {
    var nutritionModel = this.state.nutritionModel
    nutritionModel.setSuggestedServingAmount(servingValue)
    this.setState({
      servingValue: servingValue,
      nutritionModel: nutritionModel
    })
  }
  handleSliderValuesChange(sliderId, value) {
    var sliderValueDict = this.state.sliderValueDict
    sliderValueDict[sliderId] = value
    const key = sliderId
    var nutritionModel = this.state.nutritionModel
    nutritionModel.scaleIngredientToPercent(key, value)
    this.setState({
      sliderValueDict: sliderValueDict,
      nutritionModel: nutritionModel
    })
  }
  transitionToLabelPage(flag, composite, full) {
    if (flag)
      this.props.postLabelId(this.props.nutrition.key, this.props.resultUrl)
    this.props.sendSerializedData(composite, full)
    this.props.router.push('/'+this.props.nutrition.key)
  }
  getMatchListFromMatches(tag,) {
    let matchList = []
    for (let i = 0; i <= this.state.matches[tag].length; i++) {
      matchList.push(this.state.matches[tag][i])
    }
    return matchList
  }
  handleMatchDropdownChange(dropdownId, value) {
    console.log('handleMatchDropdownChange ----------------------------------------')
    console.log('dropdownId = ' + dropdownId)
    console.log('value = ' + value)
  }
  handleUnitDropdownChange(dropdownId, value) {
    console.log('handleUnitDropdownChange ----------------------------------------')
    console.log('dropdownId = ' + dropdownId)
    console.log('value = ' + value)
  }
  getIngredientController(tag) {
    // Proposed layout:
    //  Text: Tag,  Pulldown: Matches (could double as search bar if combobox)
    //  EditboxSlider: Quanity, Pulldown: Units, Text: meta for units
    //
    //  Example:
    //
    //      Egg: [Eggs, scrambled, frozen mixture]^v
    //      <-----*---------------> [   1]  [egg]^v
    //
    // Changing the unit takes the quanity and converts it to g for use with our model.
    // We might store these in userQuantity, userUnit.
    //
    // Going forward we'll need code in here to preset the slider and unit from
    // the recipe

    // TODO: move getMatchListFromMatches to NutritionAlg
    const key = this.state.nutAlg.getBestMatchForTag(tag)
    const dataForKey = this.state.nutAlg.getDataForKey(key)
    const matchData = this.getMatchListFromMatches(tag)
    const unitData = ['TODO', 'grams', 'cups', 'tablespoons', 'teaspoons']
    const meta = 'TODO'

    return(
      <div key={tag}>
        {/* row 1 from above: */}
        <text>{tag}</text>
        <Dropdownlist
          data={matchData}
          value={this.state.matchDropdownValueDict[tag]}
          onChange={this.handleMatchDropdownChange.bind(this, tag)}/>
        {/* row 2 from above: */}
        <Slider
          value={this.state.sliderValueDict[key]}
          onChange={this.handleSliderValuesChange.bind(this, key)}
          min={0}
          max={400}
          editable/>
        <Dropdownlist
          data={unitData}
          value={this.state.unitDropdownValueDict[tag]}
          onChange={this.handleUnitDropdownChange.bind(this, tag)}/>
        <text>{meta}</text>
      </div>
    )
  }
  render() {
    var sliders = []
    var notFound = ""
    var fat = 0.0
    var carbs = 0.0
    var protein = 0.0
    for (var tag in this.state.matches) {
      const key = this.state.nutAlg.getBestMatchForTag(tag)
      if (key == "") {
        notFound = notFound + tag + " "
        continue
      }
      sliders.push(this.getIngredientController(tag))
      // sliders.push(
      //   <div key={key}>
      //     <text>{key} (grams)</text>
      //     <Slider
      //       value={this.state.sliderValueDict[key]}
      //       onChange={this.handleSliderValuesChange.bind(this, key)}
      //       min={0}
      //       max={400}
      //       editable/>
      //     <br/>
      //   </div>)
    }
    if (notFound != "") {
      notFound = "(No data for: " + notFound + ")"
    }
    const full = this.state.nutritionModel.serialize()
    const composite = this.state.nutritionModel.getScaledCompositeIngredient().serialize()
    let hideUrlModal = () => this.setState({ showUrlModal: false })
    const menuItems = this.props.nutrition.anonymous === false
    ? (
        <DropdownButton bsStyle="success" title="Share Label" key={1} id={`split-button-basic`}>
        {/*<MenuItem eventKey="1" onClick={this.transitionToLabelPage.bind(this, true, composite, full)}>Post to Instagram</MenuItem>
        <MenuItem divider />*/}
        <MenuItem eventKey="2" onClick={this.transitionToLabelPage.bind(this, false, composite, full)}>Share URL</MenuItem>
        </DropdownButton>
    )
    : (
        <DropdownButton bsStyle="success" title="Share Label" key={1} id={`split-button-basic`}>
        <MenuItem eventKey="1" onClick={this.transitionToLabelPage.bind(this, false, composite, full)}>Share URL</MenuItem>
        </DropdownButton>
    )
    return (
      <Grid>
        <Row className="show-grid">
          <Col xs={8} md={8}>
            <br/>
            <text>Serving Size</text>
            <Slider
              value={this.state.servingValue}
              onChange={this.handleServingValuesChange.bind(this)}
              min={0}
              max={400}
              editable/><br/><br/>
            {sliders}
          </Col>
          <Col xs={4} md={4}>
            <Label nutritionModel={this.state.nutritionModel}/>
            <div>
              <section>
                {this.state.updChips}
              </section>
              <section>
                {this.state.parChips}
              </section>
            </div>
          </Col>
        </Row>
        <div>
          <Button className="btn-primary-spacing" bsStyle="info" onClick={() => this.props.goToGallery()}>Gallery</Button>
            {menuItems}
        </div>
      </Grid>
    )
  }
}
