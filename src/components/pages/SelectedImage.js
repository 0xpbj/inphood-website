var React = require('react')
import ReactGA from 'react-ga'
import Alert from 'react-bootstrap/lib/Alert'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import ImageGallery from 'react-image-gallery'
import Chip from 'react-toolbox/lib/chip'
import Parser from './Parser'

import "react-image-gallery/styles/css/image-gallery.css"

export default class SelectedImage extends React.Component {
  constructor() {
    super()
    this.state = {
      chips: [],
      chipData: [],
      recipe: '',
      parse: false
    }
  }
  componentWillMount() {
    this.generateChips()
  }
  getRecipe(e) {
    let recipe = e.target.value
    this.setState({recipe})
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
    var file = require("raw-loader!../../data/complete.unique-words.txt")
    let fileWords = new Set(file.match(regex))
    let fileIntersection = new Set([...words].filter(x => fileWords.has(x)))
    // var food = require("raw-loader!../../data/ingredients.txt")
    // let foodWords = new Set(food.match(regex))
    // let foodIntersection = new Set([...fileIntersection].filter(x => foodWords.has(x)))
    return fileIntersection
  }
  generateChips() {
    let chipData = this.parseCaption(this.props.data[this.props.index].caption.text)
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
    this.props.goToGallery()
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    return (
      <Grid>
        <Row className="show-grid">
          <Col xs={12} md={8}>
            <ControlLabel>Food Image</ControlLabel>
            <Image src={this.props.data[this.props.index].picture} responsive rounded/>
          </Col>
          <Col xs={6} md={4}>
            <ControlLabel>Parsed Ingredients</ControlLabel>
            <div style={{marginBottom: "30px"}}>
            <section>
              {this.state.chips}
            </section>
            </div>
            <div>
            <section>
              <Parser
                parse={this.state.parse}
                storeParsedData={this.props.storeParsedData}
                goToNutrition={this.props.goToNutrition}
              />
            </section>
            </div>
            <Button className="btn-primary-spacing" bsStyle="info" onClick={this.backToGrid.bind(this)}>Gallery</Button>
            <Button className="btn-primary-spacing" bsStyle="success" onClick={() => this.setState({parse: true})}>Get Nutrition</Button>
          </Col>
        </Row>
      </Grid>
    )
  }
}
