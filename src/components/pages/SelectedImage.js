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
import Chip from 'react-toolbox/lib/chip'
import Parser from './Parser'

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
    if (!this.props.user.login) {
      this.props.router.push('/')
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'Go to image page',
        nonInteraction: false
      });
      this.generateChips()
    }
  }
  goToNutrition() {
    this.props.router.push('nutrition')
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
    let chipData = this.parseCaption(this.props.user.photos.data[this.props.nutrition.index].caption.text)
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
    if (!this.props.user.profile) {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Oh snap! Login Error!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    }
    const containerStyle = {
      marginTop: "60px"
    }
    return (
      <Grid>
        <Row className="show-grid">
          <Col xs={12} md={8}>
            <ControlLabel>Food Image</ControlLabel>
            <Image src={this.props.user.photos.data[this.props.nutrition.index].picture} responsive rounded/>
          </Col>
          <Col xs={6} md={4}>
            <ControlLabel>Parsed Ingredients</ControlLabel>
            <div style={{marginBottom: "30px"}}>
            <section>
              {this.state.chips}
            </section>
            </div>
            <div>
            {/*<section>
              <Parser
                parse={this.state.parse}
                storeParsedData={(parsedData) => this.props.storeParsedData(parsedData)}
                goToNutrition={this.goToNutrition.bind(this)}
              />
            </section>*/}
            </div>
            <Button className="btn-primary-spacing" bsStyle="success" onClick={() => this.goToNutrition()}>Get Nutrition</Button>
          </Col>
        </Row>
      </Grid>
    )
  }
}
