var React = require('react')
import NutritionAlg from '../../algorithms/NutritionAlg'
import Label from './NutritionEstimateJSX'

import {Ingredient, NutritionModel} from '../models/NutritionModel'

import Button from 'react-bootstrap/lib/Button'
import Slider from 'react-toolbox/lib/slider'
import Well from 'react-bootstrap/lib/Well'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
// import { VictoryPie } from 'victory'

export default class Nutrition extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sliderValueDict: {},
      nutritionModel: new NutritionModel(),
      matches: [],
      nutAlg: new NutritionAlg()
    }
  }
  componentWillMount() {
    // Process the caption for matches in the FDA database:
    //
    // const tagString = this.props.nutrition.caption
    const tagString = "#tomato #cucumber #onion #lettuce #olive #feta"
    // TODO: AC! **************** regexp errors here for / characters
    this.state.nutAlg.processTags(tagString)
    // Create the slider values dictionary state and initialize each one to 100:
    //
    const sliderInitValue = 100.0
    var sliderValueDict = {}
    for (var tag in this.state.nutAlg.getMatches()) {
      const key = this.state.nutAlg.getBestMatchForTag(tag)
      const dataForKey = this.state.nutAlg.getDataForKey(key)

      sliderValueDict[key] = sliderInitValue
      var ingredient = new Ingredient()
      ingredient.initializeSingle(key, tag, dataForKey)

      var nutritionModel = this.state.nutritionModel
      nutritionModel.addIngredient(key, ingredient, sliderInitValue)
    }
    this.setState({
      matches: this.state.nutAlg.getMatches(),
      sliderValueDict: sliderValueDict,
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
  transitionToLabelPage(composite, full) {
    this.props.postLabelId(this.props.nutrition.key, this.props.resultUrl)
    this.props.sendSerializedData(composite, full)
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
      const dataForKey = this.state.nutAlg.getDataForKey(key)
      // TODO: need a big number (non float limited version to do real math here)
      // fat += parseFloat(dataForKey['Fat'] * this.state.sliderValueDict[tag] / 100)
      // carbs += parseFloat(dataForKey['Carbohydrate'] * this.state.sliderValueDict[tag] / 100)
      // protein += parseFloat(dataForKey['Protein'] * this.state.sliderValueDict[tag] / 100)
      sliders.push(
        <div key={key}>
          <text>{key} (grams)</text>
          <Slider
            value={this.state.sliderValueDict[key]}
            onChange={this.handleSliderValuesChange.bind(this, key)}
            min={0}
            max={100}
            editable/>
          <br/><br/>
        </div>)
    }
    if (notFound != "") {
      notFound = "(No data for: " + notFound + ")"
    }
    const tagString = this.props.nutrition.caption
    // console.log('----------------------------------- Nutrition Model ---------')
    // console.log('')
    // console.log('----------------------------------- Composite Ingredient ---------')
    // console.log('')
    const full = this.state.nutritionModel.serialize()
    const composite = this.state.nutritionModel.getScaledCompositeIngredient().serialize()
    return (
      <div>
        <div>
          <Button className="btn-primary-spacing" bsStyle="success" onClick={() => this.props.goToGallery()}>Gallery</Button>
        </div>
        <div>
          <Label
            nutritionModel={this.state.nutritionModel}/>
        </div>
        <div>
          <text>Nutrition info for "{tagString}":</text><br/>
          <text>{notFound}</text><br/><br/>
          {sliders}
        </div>
          <ControlLabel>Share URL</ControlLabel>
          <Well>
            <a href={this.props.resultUrl}>{this.props.resultUrl}</a>
          </Well>
          <Button bsStyle="default" onClick={this.transitionToLabelPage.bind(this, composite, full)}>
            Post to Instagram
          </Button>
      </div>
    )
  }
}
