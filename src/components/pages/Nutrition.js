import React from "react"

export default class Nutrition extends React.Component {
  render() {
    console.log(this.props)
    return (
      <div>
        <text>Nutrition label, mixer, etc... for ingredients: {this.props.nutrition.photo.caption.text}</text>
      </div>
    )
  }
}