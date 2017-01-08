var React = require('react')
import NutritionAlg from '../../algorithms/NutritionAlg'
import Label from './NutritionEstimateJSX'

import {Ingredient, NutritionModel} from '../models/NutritionModel'

import Button from 'react-bootstrap/lib/Button'
import Slider from 'react-toolbox/lib/slider'
// import { VictoryPie } from 'victory'

export default class Nutrition extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sliderValueDict: {},
      ingredientComposite: new NutritionModel(),
      matches: [],
      nutAlg: new NutritionAlg()
    };
  }

  handleSliderValuesChange(sliderId, value) {
    console.log("handleSliderValuesChange -----------------------------")
    console.log("value = " + value + ", sliderId = " + sliderId)

    var sliderValueDict = this.state.sliderValueDict
    sliderValueDict[sliderId] = value

    const key = sliderId
    var ingredientComposite = this.state.ingredientComposite
    ingredientComposite.scaleIngredient(key, value)

    this.setState({
      sliderValueDict: sliderValueDict,
      ingredientComposite: ingredientComposite
    })
  }

  componentWillMount() {
    console.log("componentWillMount -----------------------------")
    // Process the caption for matches in the FDA database:
    //
    // const tagString = this.props.nutrition.caption
    const tagString = "#tomato #cucumber #onion #lettuce #olive #feta"
    // TODO: AC! **************** regexp errors here for / characters
    this.state.nutAlg.processTags(tagString)

    // Create the slider values dictionary state and initialize each one to 100:
    //
    var sliderValueDict = {}
    for (var tag in this.state.nutAlg.getMatches()) {
      sliderValueDict[tag] = 100

      const key = this.state.nutAlg.getBestMatchForTag(tag)
      const dataForKey = this.state.nutAlg.getDataForKey(key)

      var ingredient = new Ingredient()
      ingredient.initializeSingle(key, tag, dataForKey)

      var ingredientComposite = this.state.ingredientComposite
      ingredientComposite.addIngredient(key, ingredient)
    }

    this.setState({
      matches: this.state.nutAlg.getMatches(),
      sliderValueDict: sliderValueDict,
      ingredientComposite: ingredientComposite
    })
  }

  render() {
    console.log("Nutrition render() ----------------------------------")

    // 1. Separate out the content of the photo caption into the following
    //    structure for each ingredient:
    //        ingredient quantity unit nutrition_info
    //        ...
    //        ingredient quantity unit nutrition_info

    // TODO: move the ingredients array/construction to somewhere else for higher perf/lower mem

    // TODO: move this var to state

    // var ingredientComposite = new NutritionModel()

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
      fat += parseFloat(dataForKey['Fat'] * this.state.sliderValueDict[tag] / 100)
      carbs += parseFloat(dataForKey['Carbohydrate'] * this.state.sliderValueDict[tag] / 100)
      protein += parseFloat(dataForKey['Protein'] * this.state.sliderValueDict[tag] / 100)

      console.log("Value for tag '" + tag + "' = " + this.state.sliderValueDict[tag])

      // var ingredient = new Ingredient()
      // ingredient.initializeSingle(key, tag, dataForKey)
      // ingredientComposite.addIngredient(key, ingredient)

      sliders.push(
        <div key={tag}>
          <text>{key} (grams)</text>
          <Slider
            value={this.state.sliderValueDict[tag]}
            onChange={this.handleSliderValuesChange.bind(this, tag)}
            min={0}
            max={100}
            editable/>
          <br/><br/>
        </div>)
    }

    if (notFound != "") {
      notFound = "(No data for: " + notFound + ")"
    }

    // Numbers based on 2000 calorie diet (https://www.dsld.nlm.nih.gov/dsld/dailyvalue.jsp)
    const fatRDA = 100.0 * fat / 65.0
    const carbRDA = 100.0 * carbs / 300.0
    const proteinRDA = 100.0 * protein / 50.0

    const totalFatStr = fat.toFixed(2) + "g"
    const fatRDAStr = fatRDA.toFixed(2) + "%"

    const totalCarbsStr = carbs.toFixed(2) + "g"
    const carbRDAStr = carbRDA.toFixed(2) + "%"

    const totalProteinStr = protein.toFixed(2) + "g"

    const tagString = this.props.nutrition.caption

    const pieChartData = [
        {category: "Fat", amount: fat},
        {category: "Carbs", amount: carbs},
        {category: "Protein", amount: protein}
      ]

    return (
      <div>
        <div>
          <Button className="btn-primary-spacing" bsStyle="success" onClick={() => this.props.goToGallery()}>Gallery</Button>
        </div>
        <div>
          <text>Nutrition info for "{tagString}":</text><br/>
          <text>{notFound}</text><br/><br/>
          {sliders}
        </div>
        <div>
          <Label
            nutritionModel={this.state.ingredientComposite.getScaledCompositeIngredient()}
            servingAmount="100" servingUnit="g"
            totalCal="200" totalFatCal="130"
            totalFat={totalFatStr} totalFatDayPerc={fatRDAStr}
            saturatedFat="9g" saturatedFatDayPerc="22%"
            transFat="0g"
            cholesterol="55mg" cholesterolDayPerc="80%"
            sodium="40mg" sodiumDayPerc="2%"
            totalCarb={totalCarbsStr} totalCarbDayPerc={carbRDAStr}
            fiber="1g" fiberDayPerc="4%"
            sugars="14g"
            protein={totalProteinStr}/>
        </div>
        {/*<VictoryPie
          data={pieChartData}
            x="category"
            y="amount"
          />*/}
      </div>
    )
  }
}
