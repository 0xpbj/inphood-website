import React from "react"
import NutritionAlg from '../../algorithms/NutritionAlg'
import Label from './LiteLabel'

export default class Nutrition extends React.Component {
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

    return (
      <div>
        <Label
          servingAmount="100" servingUnit="g"
          totalCal="200" totalFatCal="130"
          totalFat="14g" totalFatDayPerc="22%"
          saturatedFat="9g" saturatedFatDayPerc="22%"
          transFat="0g"
          cholesterol="55mg" cholesterolDayPerc="80%"
          sodium="40mg" sodiumDayPerc="2%"
          totalCarb="17g" totalCarbDayPerc="6%"
          fiber="1g" fiberDayPerc="4%"
          sugars="14g"
          protein="3g"/>
      </div>
    )
  }
}
