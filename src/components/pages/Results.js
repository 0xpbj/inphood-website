var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Label from './NutritionEstimateJSX'
import {Link} from 'react-router'
import {IngredientModel} from '../models/IngredientModel'

export default class Results extends React.Component {
  constructor() {
    super()
  }
  componentWillMount() {
    this.props.getLabelId(this.props.params.userId, this.props.params.labelId)
  }
  // From https://toddmotto.com/methods-to-determine-if-an-object-has-a-given-property/
  //  - addresses limitations of IE and other issues related to checking if an object
  //    has a property.
  //
  hasProp(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property)
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    if (this.props.results.data === null) {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Oh snap! Label not found!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    }
    else {
      const socialContainerStyle = {
        marginTop: "20px",
        border: "2px solid black",
        padding: "5px",
        margin: "10px",
      }
      const labelContainerStyle = {
        margin: "30px",
      }
      const image = this.props.params.userId === 'anonymous'
      ? <Image src={this.props.results.data.oUrl} responsive rounded/>
      : (
          <Link to={'http://www.instagram.com/p/' + this.props.results.data.key} target="_blank">
            <Tooltip placement="top" className="in" id="tooltip-top">
              @{this.props.params.userId}
            </Tooltip>
            <Image src={this.props.results.data.oUrl} responsive rounded/>
          </Link>
      )
      const credit = this.props.params.userId === 'anaonymous' ? (
        <div style={socialContainerStyle}>
          inPhood Credit: Anonymous
        </div>
      ) : ( 
        <div style={socialContainerStyle}>
          inPhood Credit: <Link to={'http://www.instagram.com/' + this.props.params.userId} target="_blank">{this.props.params.userId}</Link>
        </div>
      )
      // If we've received the data for the Nutrition label, deserialize it for
      // rendering, otherwise display a loading message.
      //   - TODO: make the loading message suck less
      let nutritionLabel = <text> Loading ...</text>
      if (this.hasProp(this.props.results.data, 'composite')) {
        let ingredientData = JSON.parse(this.props.results.data.composite)
        let ingredient = new IngredientModel()
        ingredient.initializeFromSerialization(ingredientData)
        nutritionLabel = <Label ingredientComposite={ingredient}/>
      }
      const path = 'http://www.label.inphood.com/?user=' + this.props.params.userId + '&label=' + this.props.params.labelId
      const labelPath = ( 
        <div style={labelContainerStyle}>
          <Link to={path} target="_blank">Nutrition Label Link</Link>
        </div>
      )
      const label = (
        <Grid>
          <div className="text-center">
          <Row className="show-grid">
            <Col xs={6} md={4}>
              <Row className="show-grid">
                {image}
                {credit}
              </Row>
            </Col>
            <Col xs={6} md={4}>
              <Row className="show-grid">
                {nutritionLabel}
                {labelPath}
              </Row>
            </Col>
          </Row>
          </div>
        </Grid>
      )
      return label
    }
  }
}
