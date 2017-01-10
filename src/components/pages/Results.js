var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Label from './NutritionEstimateJSX'
import {Ingredient} from '../models/NutritionModel'

export default class Results extends React.Component {
  constructor() {
    super()
    this.state = {
      labelId: ''
    }
  }
  componentWillMount() {
    this.props.getLabelId(this.props.params.labelId)
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
    if (!this.props.results.data || this.props.results.data.oUrl === '') {
      this.props.router.push('/')
    }
    // If we've received the data for the Nutrition label, deserialize it for
    // rendering, otherwise display a loading message.
    //   - TODO: make the loading message suck less
    let nutritionLabel = <text> Loading ...</text>
    if (this.hasProp(this.props.results.data, 'composite')) {
      let ingredientData = JSON.parse(this.props.results.data.composite)
      let ingredient = new Ingredient()
      ingredient.initializeFromSerialization(ingredientData)
      nutritionLabel = <Label ingredientComposite={ingredient}/>
    }
    return (
      <Grid>
        <div className="text-center">
        <Row className="show-grid">
          <Col xs={6} md={4}>
            <Row className="show-grid">
              <ControlLabel>Food Image</ControlLabel>
              <a href={'http://www.instagram.com/' + this.props.results.data.user}>
                <Tooltip placement="top" className="in" id="tooltip-top">
                  @{this.props.results.data.user}
                </Tooltip>
                <Image src={this.props.results.data.oUrl} responsive rounded/>
              </a>
            </Row>
          </Col>
          <Col xs={6} md={4}>
            <ControlLabel>Nutrition Label</ControlLabel>
            {nutritionLabel}
          </Col>
        </Row>
        </div>
      </Grid>
    )
  }
}
