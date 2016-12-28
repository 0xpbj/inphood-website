import React from "react"
import Gallery from 'react-grid-gallery'

export default class User extends React.Component {
  constructor() {
    super()
  }
  render() {
    console.log(this.props)
    var images = [{
      src: this.props.data.photos.data[0].picture,
      thumbnail: this.props.data.photos.data[0].thumbnail,
      thumbnailWidth: 150,
      thumbnailHeight: 150,
      caption: this.props.data.photos.data[0].caption.text,
      tags: this.props.data.photos.data[0].tags,
    }]

    return (
      <Gallery images={images}/>
    )
  }
}