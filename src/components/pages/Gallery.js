var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import ImageGallery from 'react-image-gallery'

import "react-image-gallery/styles/css/image-gallery.css"

export default class GalleryGrid extends React.Component {
  constructor() {
    super()
  }
  selectPhoto() {
    const index = this._imageGallery.getCurrentIndex()
    const photo =  this.props.user.photos.data[index]
    this.props.igSelectedPhoto(index, photo)
    ReactGA.event({
      category: 'User',
      action: 'Image selected for nutrition information',
      nonInteraction: false,
      label: 'Social Flow'
    });
    this.props.router.push('image')
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    if (this.props.user.error !== '') {
      return (
        <Alert bsStyle="danger">
          <strong>Error: {this.props.user.error}</strong>
        </Alert>
      )
    }
    else if (this.props.user.photos.length === 0 || this.props.user.photos.data.length === 0) {
      return (
        <Alert bsStyle="info">
          <strong>Photos loading...</strong>
        </Alert>
      )
    }
    else {
      ReactGA.set({ userId: this.props.user.profile.name })
      ReactGA.event({
        category: 'User',
        action: 'Go to gallery page',
        nonInteraction: false
      });
      var images = []
      for (let img of this.props.user.photos.data) {
        let image = {
          original: img.picture,
          thumbnail: img.thumbnail,
        }
        images.push(image)
      }
      return (
        <Grid>
          <Row className="show-grid">
            <Col md={12}>
              <Col xs={4} md={4} xsOffset={4}>
                <Image src={this.props.user.profile.thumbnail} rounded />
              </Col>
              <Col xs={6} md={4}>
                <DropdownButton bsStyle="info" title="Options" id={`dropdown-basic`}>
                  <MenuItem key="1" onClick={() => this.props.igRefreshRequest()}>Refresh</MenuItem>
                  <MenuItem key="2" onClick={() => this.props.igLogoutRequest()}>Logout</MenuItem>
                </DropdownButton>
              </Col>
            </Col>
          </Row>
          <Row className="show-grid">
            <div className="text-center" style={containerStyle}/>
            <Col md={2} />
            <Col md={8}>
              <Button className="btn-primary-spacing" bsStyle="success" onClick={this.selectPhoto.bind(this)}>Select Image</Button>
              <ImageGallery
                ref={i => this._imageGallery = i}
                items={images}
                slideInterval={2000}
                showFullscreenButton={false}
                showNav={true}
                showPlayButton={false}
              />
            </Col>
            <Col md={2} />
          </Row>
        </Grid>
      )
    }
  }
}