var React = require('react')
import ReactGA from 'react-ga'
import Alert from 'react-bootstrap/lib/Alert'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import ImageGallery from 'react-image-gallery'
import Chip from 'react-toolbox/lib/chip'

import "react-image-gallery/styles/css/image-gallery.css"

export default class GalleryGrid extends React.Component {
  constructor() {
    super()
    this.state = {
      grid: false,
      index: 0,
      chips: [],
      chipData: []
    }
  }
  selectPhoto() {
    this.setState({grid: !this.state.grid, index: this._imageGallery.getCurrentIndex()})
    this.props.igSelectedPhoto(this.props.data[this._imageGallery.getCurrentIndex()])
    ReactGA.event({
      category: 'User',
      action: 'Image selected for nutrition information',
      nonInteraction: false,
      label: 'Social Flow'
    });
    this.generateChips(this._imageGallery.getCurrentIndex())
  }
  handleDeleteClick(word) {
    let {chipData} = this.state
    chipData.delete(word)
    let caption = ''
    let chips = []
    for (let word of chipData) {
      chips.push(
        <Chip onDeleteClick={this.handleDeleteClick.bind(this, word)} deletable>{word}</Chip>
      )
      caption += word + ' '
    }
    this.props.igUpdatedCaption(caption)
    this.setState({chips, chipData})
    ReactGA.event({
      category: 'User',
      action: 'User removed parsed tags',
      nonInteraction: false,
      label: 'Social Flow'
    });
  }
  parseCaption(caption) {
    let regex = /\w+/g
    let words = caption.match(regex)
    var file = require("raw-loader!../../data/complete-001.unique-words.txt")
    let fileWords = new Set(file.match(regex))
    let fileIntersection = new Set([...words].filter(x => fileWords.has(x)))
    // var food = require("raw-loader!../../data/ingredients.txt")
    // let foodWords = new Set(food.match(regex))
    // let foodIntersection = new Set([...fileIntersection].filter(x => foodWords.has(x)))
    return fileIntersection
  }
  generateChips(index) {
    let chipData = this.parseCaption(this.props.data[index].caption.text)
    let chips = []
    for (let word of chipData) {
      chips.push(
        <Chip onDeleteClick={this.handleDeleteClick.bind(this, word)} deletable>{word}</Chip>
      )
    }
    this.setState({chips, chipData})
  }
  backToGrid() {
    this.props.anClearData()
    this.setState({grid: !this.state.grid})
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    if (!this.state.grid) {
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
                <DropdownButton bsStyle="info" title="Options">
                  <MenuItem key="1" onClick={() => this.props.refresh()}>Refresh</MenuItem>
                  <MenuItem key="2" onClick={() => this.props.logout()}>Logout</MenuItem>
                </DropdownButton>
              </Col>
            </Col>
          </Row>
          <Row className="show-grid">
            <div className="text-center" style={containerStyle}/>
            <Col md={12}>
              <ImageGallery
                ref={i => this._imageGallery = i}
                items={images}
                slideInterval={2000}
                showFullscreenButton={false}
                showNav={false}
                showPlayButton={false}
                onClick={this.selectPhoto.bind(this)}
              />
              <Button className="btn-primary-spacing" bsStyle="success" onClick={this.selectPhoto.bind(this)}>Select Image</Button>
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
              <ControlLabel>Food Image</ControlLabel>
              <Image src={this.props.data[this.state.index].picture} responsive rounded/>
            </Col>
            <Col xs={6} md={4}>
              <ControlLabel>Ingredients</ControlLabel>
              <div>
              <section>
                {this.state.chips}
              </section>
              </div>
              <Button className="btn-primary-spacing" bsStyle="success" onClick={this.backToGrid.bind(this)}>Done</Button>
              <Button className="btn-primary-spacing" bsStyle="info" onClick={() => this.props.goToNutrition()}>Get Nutrition</Button>
            </Col>
          </Row>
        </Grid>
      )
    }
  }
}