import React from "react"
import NutritionAlg from '../../algorithms/NutritionAlg'
import Label from './LiteLabel'
import '../../../node_modules/react-input-range/dist/react-input-range.css'
import InputRange from 'react-input-range'

export default class Nutrition extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: 100
    };
  }

  handleValuesChange(component, value) {
    this.setState({
      value: value,
    });
  }

  render() {
    console.log("Nutrition render() ----------------------------------")
    console.log(this.props)

    // 1. Separate out the content of the photo caption into the following
    //    structure for each ingredient:
    //        ingredient quantity unit nutrition_info
    //        ...
    //        ingredient quantity unit nutrition_info
    const tagString = this.props.nutrition.photo.caption.text
    let nutAlg = new NutritionAlg()
    nutAlg.processTags(tagString)
    const matches = nutAlg.getMatches()
    var sliders = []
    var notFound = ""
    var fat = 0.0
    var carbs = 0.0
    var protein = 0.0
    for (var tag in matches) {

      const bestMatch = nutAlg.getBestMatchForTag(tag)
      if (bestMatch == "") {
        notFound = notFound + tag + " "
        continue
      }

      const dataForKey = nutAlg.getDataForKey(bestMatch)
      // TODO: need a big number (non float limited version to do real math here)
      fat += parseFloat(dataForKey['Fat'])
      carbs += parseFloat(dataForKey['Carbohydrate'])
      protein += parseFloat(dataForKey['Protein'])
      console.log('Carbs = ' + carbs)

      sliders.push(
        <div>
          <text>{bestMatch} (grams)</text>
          <InputRange
            maxValue={100}
            minValue={0}
            value={this.state.value}
            onChange={this.handleValuesChange.bind(this)}/>
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

    return (
      <div>
        <text>Nutrition info for "{tagString}":</text><br/>
        <text>{notFound}</text><br/><br/>
        {sliders}
        <Label
          servingAmount="100" servingUnit="g"
          totalCal="200" totalFatCal="130"
          totalFat={fat} totalFatDayPerc={fatRDA}
          saturatedFat="9g" saturatedFatDayPerc="22%"
          transFat="0g"
          cholesterol="55mg" cholesterolDayPerc="80%"
          sodium="40mg" sodiumDayPerc="2%"
          totalCarb={carbs} totalCarbDayPerc={carbRDA}
          fiber="1g" fiberDayPerc="4%"
          sugars="14g"
          protein={protein}/>
      </div>
    )
  }
}
