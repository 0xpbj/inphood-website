import React from "react"
import Gallery from 'react-grid-gallery'
import Alert from 'react-bootstrap/lib/Alert'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'

export default class GalleryGrid extends React.Component {
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
    console.log(this.props)
    if (this.props.data.photos.length === 0) {
      return (
        <Alert bsStyle="info">
          <strong>Photos Loading...</strong>
        </Alert>
      )
    }
    else if (this.props.data.error !== '') {
      return (
        <Alert bsStyle="danger">
          <strong>Error: {this.props.data.error}</strong>
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
          <Grid>
            <Row className="show-grid">
              <Col md={10}>
              <Gallery images={images} onClickThumbnail={this.toggleGrid.bind(this)}/>
              </Col>
              <Col md={2}>
                <DropdownButton bsStyle="info" title="Options">
                  <MenuItem key="1" onClick={() => this.props.refresh()}>Refresh</MenuItem>
                  <MenuItem key="2" onClick={() => this.props.logout()}>Logout</MenuItem>
                </DropdownButton>
              </Col>
            </Row>
          </Grid>
        )
      }
      else {
        return (
          <Grid>
            <Row className="show-grid">
              <Col xs={12} md={8}>
                <Image src={data[this.state.index].picture} rounded />
              </Col>
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