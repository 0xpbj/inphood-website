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
  handleSliderValuesChange(sliderId, value) {
    let sliderValueDict = this.state.sliderValueDict
    sliderValueDict[sliderId] = value

    let nutritionModel = this.state.nutritionModel
    nutritionModel.scaleIngredientToPercent(sliderId, value)
    this.setState({
      sliderValueDict: sliderValueDict,
      nutritionModel: nutritionModel
    })
  }
  //
  handleMatchDropdownChange(dropdownId, value) {
    console.log('handleMatchDropdownChange ----------------------------------------')
    console.log('dropdownId = ' + dropdownId)
    console.log('value = ' + value)
    // Need to remove the current Ingredient from the NutritionModel and add the new one
    // let nutritionModel = this.state.nutritionModel
    // nutritionModel.addIngredient()
  }
  //
  handleUnitDropdownChange(dropdownId, value) {
    console.log('handleUnitDropdownChange ----------------------------------------')
    console.log('dropdownId = ' + dropdownId)
    console.log('value = ' + value)
  }
  //////////////////////////////////////////////////////////////////////////////
  // Miscellany:
  //////////////////////////////////////////////////////////////////////////////
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
  //////////////////////////////////////////////////////////////////////////////
  // UI Element Generation:
  //////////////////////////////////////////////////////////////////////////////
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

    const key = this.state.nutAlg.getBestMatchForTag(tag)
    const dataForKey = this.state.nutAlg.getDataForKey(key)
    const matchData = this.state.nutAlg.getMatchList(tag)
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
          value={this.state.sliderValueDict[tag]}
          onChange={this.handleSliderValuesChange.bind(this, tag)}
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
          <DropdownButton bsStyle="success" title="Share Label" key={1} id={`split-button-basic`}>
          <MenuItem eventKey={eventKey} onClick={this.transitionToLabelPage.bind(this, false, composite, full)}>Share URL</MenuItem>
          </DropdownButton>
        </div>
      </Grid>
    )
  }
}
