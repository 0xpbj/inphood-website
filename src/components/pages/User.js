import React from "react"
import Gallery from 'react-grid-gallery'
import Alert from 'react-bootstrap/lib/Alert'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

export default class User extends React.Component {
  constructor() {
    super()
    this.state = {
      grid: false,
      index: 0
    }
  }
  toggleGrid(index) {
    this.setState({grid: !this.state.grid, index})
  }
  render() {
    if (this.props.data.photos.length === 0) {
      return (
        <Alert bsStyle="info">
          <strong>Photos Loading</strong>
        </Alert>
      )
    }
    else if (this.props.data.profile === null) {
      return (
        <Alert bsStyle="warning">
          <strong>User profile not authorized</strong>
        </Alert>
      )
    }
    else {
      const {data} = this.props.data.photos
      if (!this.state.grid) {
        var images = []
        for (let img of data) {
          let image = {
            src: img.picture,
            thumbnail: img.thumbnail,
            caption: img.caption.text,
            // tags: img.tags,
            thumbnailWidth: 150,
            thumbnailHeight: 150
          }
          images.push(image)
        }
        return (
          <Gallery images={images} onClickThumbnail={this.toggleGrid.bind(this)}/>
        )
      }
      else {
        return (
          <Grid>
            <Row className="show-grid">
              <Col xs={12} md={8}><Image src={data[this.state.index].picture} rounded /></Col>
              <Col xs={6} md={4}>
                <ControlLabel>Ingredients</ControlLabel>
                <textarea rows="4" cols="50">
                  {data[this.state.index].caption.text}
                </textarea>
                <Button bsStyle="success" onClick={this.toggleGrid.bind(this)}>Done</Button>
              </Col>
            </Row>
          </Grid>
        )
      }
    }
  }
}