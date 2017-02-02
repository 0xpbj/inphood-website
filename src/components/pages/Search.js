var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'

import {IngredientModel} from '../models/IngredientModel'
import {NutritionModel} from '../models/NutritionModel'
import {IngredientControlModel} from '../models/IngredientControlModel'
import {Link} from 'react-router'
import {getValueInUnits,
        getIngredientValueInUnits,
        mapToSupportedUnits,
        mapToSupportedUnitsStrict,
        rationalToFloat} from '../../helpers/ConversionUtils'
const Config = require('Config')
const Convert = require('convert-units')
import * as tuple from '../../helpers/TupleHelpers'

export default class Search extends React.Component {
  constructor() {
    super()
    this.state = {
      searchIngredient: '',
      searchPopoverFlag: false,
      results: []
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log('Got some search results here: ', nextProps)
    const {searchResults} = nextProps.search
    let results = []
    for (let i of searchResults) {
      let data = {id: i.info._id, name: i.info._source.Description}
      results.push(data)
    }
    this.setState({results})
    // let ingredientModel = new IngredientModel()
    // ingredientModel.initializeSingle(description, tag, dataForKey)
    // let measureQuantity = ingredientModel.getMeasureQuantity()
    // let measureUnit = ingredientModel.getMeasureUnit()

    // let tryQuantity = measureQuantity
    // let tryUnit = measureUnit
    // let ingredientControlModel = new IngredientControlModel(
    //     tryQuantity,
    //     this.getPossibleUnits(tryUnit),
    //     tryUnit,
    //     tuple.getListOfTupleOffset(tagMatches, descriptionOffset),
    //     description)
  }
  searchFlow() {
    if (this.getValidationState() === 'error') {
      this.setState({results: []})
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'User searching for missing ingredients',
        nonInteraction: false
      });
      this.props.searchIngredientData(this.state.searchIngredient)
    }
  }
  getData(e) {
    let searchIngredient = e.target.value.toLowerCase()
    this.setState({searchIngredient})
  }
  handleChange(tag) {
    console.log('Ingredient Changed: ', tag)
  }
  getValidationState() {
    const length = this.state.searchIngredient.length
    if (length > 0)
      return 'success'
    else if (length === 0)
      return 'error'
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    const searchPopover = this.state.searchPopoverFlag ? (
      <Popover
        id="popover-basic"
        title="Search Flow">
        Enter ingredient to search for
      </Popover>
    ) : null
    const ingredientsDropdown = this.state.results.length ? (
      <Dropdownlist
        valueField='id'
        textField='name'
        defaultValue={this.state.results[0]}
        data={this.state.results}
        onChange={this.handleChange.bind(this)}
      />
    ) : null
    return (
      <div>
        <section>
          <ControlLabel>Search for a ingredient</ControlLabel>
          <Glyphicon
            onClick={()=>this.setState({searchPopoverFlag: !this.state.searchPopoverFlag})}
            style={{marginLeft: 10}}
            glyph="glyphicon glyphicon-info-sign">
            {searchPopover}
          </Glyphicon>
        </section>
        <section>
          <Row>
            <Col xs={7} md={7}>
              <form onSubmit={this.searchFlow.bind(this)}>
                <FormGroup
                  controlId="formBasicText"
                  validationState={this.getValidationState()}
                >
                  <FormControl
                    type="text"
                    label="Text"
                    onChange={this.getData.bind(this)}
                    placeholder="Example: green onions"
                  />
                </FormGroup>
              </form>
            </Col>
            <Col xs={1} md={1}>
              <Button className="btn-primary-spacing" onClick={this.searchFlow.bind(this)}><Glyphicon glyph="glyphicon glyphicon-search"></Glyphicon></Button>
            </Col>
          </Row>
        </section>
        <div style={{marginBottom: 10}} />
        {ingredientsDropdown}
      </div>
    )
  }
}
