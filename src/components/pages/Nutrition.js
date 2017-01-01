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


    // const tags = photoCaption.split(" ")
    // const numTags = tags.length
    //
    // var processedTags = []
    // for (var i = 0; i < numTags; i++) {
    //   const tag = tags[i]
    //
    //   // Remove leading hashtag and make first alpha char uppercase for best
    //   // compatibility with FDA DB:
    //   if (tag.charAt(0) == "#") {
    //     var searchTerm = tag.slice(1).charAt(0).toUpperCase() + tag.slice(2)
    //   } else {
    //     var searchTerm = tag.charAt(0).toUpperCase() + tag.slice(1)
    //   }
    //
    //   console.log("searchTerm = " + searchTerm)
    //   processedTags.push
    //
    // }


    return (
      <div>
        <text>Nutrition label, mixer, etc... for ingredients: {this.props.nutrition.photo.caption.text}</text>
      </div>
    )
  }
}
