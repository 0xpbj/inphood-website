var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
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
    const photo =  this.props.data[index]
    this.props.igSelectedPhoto(index, photo)
    ReactGA.event({
      category: 'User',
      action: 'Image selected for nutrition information',
      nonInteraction: false,
      label: 'Social Flow'
    });
    this.props.goToImage()
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    var images = []
    for (let img of this.props.data) {
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
              <Image src={this.props.profile.thumbnail} rounded />
            </Col>
            <Col xs={6} md={4}>
              <DropdownButton bsStyle="info" title="Options" id={`dropdown-basic`}>
                <MenuItem key="1" onClick={() => this.props.refresh()}>Refresh</MenuItem>
                <MenuItem key="2" onClick={() => this.props.logout()}>Logout</MenuItem>
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