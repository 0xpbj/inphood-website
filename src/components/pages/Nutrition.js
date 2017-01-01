import React from "react"
import NutritionAlg from '../../algorithms/NutritionAlg'

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
        <text>Nutrition label, mixer, etc... for ingredients: {this.props.nutrition.photo.caption.text}</text>
      </div>
    )
  }
}
