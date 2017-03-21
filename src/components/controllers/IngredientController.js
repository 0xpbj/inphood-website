const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'
import {IngredientModel} from '../models/IngredientModel'
import {rationalToFloat} from '../../helpers/ConversionUtils'
import Slider from 'react-toolbox/lib/slider'

export default class IngredientController extends React.Component {
  constructor(props) {
    super(props)
  }
  handleSliderValuesChange(value) {
    const {tag} = this.props
    const ingredientControlModel = this.props.ingredientModel.ingredientControlModels[tag]
    const units = ingredientControlModel.getDropdownUnitValue()
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Slider value changed',
      nonInteraction: false,
    });
    this.updateReduxStore(tag, value, units)
  }
  handleEditBoxValueChange(formObject) {
    const {tag} = this.props
    const value = formObject.target.value
    let ingredientControlModel = this.props.ingredientModel.ingredientControlModels[tag]
    ingredientControlModel.setEditBoxValue(value)
    this.props.updateIngredientControlModel(tag, ingredientControlModel)
  }
  handleUnitDropdownChange(units) {
    const {tag} = this.props
    const ingredientControlModel = this.props.ingredientModel.ingredientControlModels[tag]
    const value = ingredientControlModel.getSliderValue()
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User changed units for ingredient',
      nonInteraction: false,
      label: tag
    });
    this.updateReduxStore(tag, value, units)
  }
  handleMatchDropdownChange(value) {
    const {tag} = this.props
    const {matchResultsModel} = this.props.tagModel
    const searchResult = matchResultsModel.getSearchResultByDesc(tag, value)

    if ((searchResult.getStandardRefDataObj() === undefined) &&
        (searchResult.getBrandedDataObj() === undefined)) {
      if (value === '.....') {
        // Ellipses search:
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'User triggered elipses search',
          nonInteraction: false,
          label: tag
        });
        this.props.getMoreData(tag)
      } else {
        // Firebase lazy fetch
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'User triggered dropdown lazy firebase fetch',
          nonInteraction: false,
          label: tag
        });
        let index = matchResultsModel.getIndexForDescription(tag, value)
        this.props.lazyFetchFirebase(value, tag, searchResult.getNdbNo(), index)
      }
    }
    //
    else {
      this.props.completeMatchDropdownChange(tag, value)
    }
  }
  getValidationState() {
    const {tag} = this.props
    const ingredientControlModel = this.props.ingredientModel.ingredientControlModels[tag]
    const editBoxValue = ingredientControlModel.getEditBoxValue()
    // Check to see if editBoxValue is a number--if so, return success because
    // rationalToFloat expects a string. This also helps to catch things like
    // "" and " " which evaluate to numbers (isNan===false) with the second
    // predicate checking for string type.
    if (! isNaN(editBoxValue)) {
      if ((typeof editBoxValue) !== "string") {
        return 'success'
      }
    }
    // Try and convert to a rational number from a variety of string
    // representations (i.e. "1/2" "024" etc.), failing that, return error.
    try {
      const value = rationalToFloat(editBoxValue)
    } catch(err) {
      return 'error'
    }
    return 'success'
  }
  updateReduxStore(tag, value, units) {
    let ingredientControlModel = this.props.ingredientModel.ingredientControlModels[tag]
    ingredientControlModel.setSliderValue(value)
    ingredientControlModel.setDropdownUnitValue(units)
    this.props.updateIngredientControlModel(tag, ingredientControlModel)
    this.props.nutritionModelScaleIng(tag, value, units)
  }
  updateReduxStoreIfValid() {
    if (this.getValidationState() === 'success') {
      const {tag} = this.props
      const ingredientControlModel = this.props.ingredientModel.ingredientControlModels[tag]

      const editBoxValue = ingredientControlModel.getEditBoxValue()
      let value = editBoxValue
      if ((typeof editBoxValue) !== 'number') {
        value = rationalToFloat(editBoxValue)
      }
      const units = ingredientControlModel.getDropdownUnitValue()

      this.updateReduxStore(tag, value, units)
    }
  }
  submitNewSliderValue(event) {
    this.updateReduxStoreIfValid()

    // This prevents the default behavior of a form submit which causes a full
    // re-render / re-state!
    event.preventDefault()
  }
  onEditBoxBlurred() {
    this.updateReduxStoreIfValid()
  }
  render() {
    const {tag} = this.props
    const ingredientControlModel = this.props.ingredientModel.ingredientControlModels[tag]
    const formControlId = tag + "FormControlId"
    const sliderValue = ingredientControlModel.getSliderValue()
    const editBoxValue = ingredientControlModel.getEditBoxValue()
    return (
      <div style={{borderWidth: 1,
                   borderColor: 'black',
                   borderStyle: 'solid',
                   borderRadius: 5,
                   padding: 10,
                   marginRight: 10,
                   marginLeft: 10}}>
        <Row>
          <Col xs={7} md={7} style={{paddingLeft: 5, paddingRight: 5}}>
            <Slider
              value={sliderValue}
              min={ingredientControlModel.getSliderMin()}
              max={ingredientControlModel.getSliderMax()}
              step={ingredientControlModel.getSliderStep()}
              snaps
              onChange={this.handleSliderValuesChange.bind(this)}
            />
          </Col>
          <Col xs={2} md={2} style={{paddingLeft: 0, paddingRight: 5}}>
            <form
              onSubmit={(event) => this.submitNewSliderValue(event)}
              autoComplete="off">
              <FormGroup
                controlId={formControlId}
                validationState={this.getValidationState()}>
                <FormControl
                  componentClass="input"
                  className="text-right"
                  type="text"
                  label="Text"
                  value={editBoxValue}
                  onBlur={this.onEditBoxBlurred.bind(this)}
                  onChange={this.handleEditBoxValueChange.bind(this)}/>
              </FormGroup>
            </form>
          </Col>
          <Col xs={3} md={3} style={{paddingLeft: 0}}>
            <Dropdownlist
              data={ingredientControlModel.getDropdownUnits()}
              value={ingredientControlModel.getDropdownUnitValue()}
              onChange={this.handleUnitDropdownChange.bind(this)}/>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={12}>
          <Dropdownlist
            data={ingredientControlModel.getDropdownMatches()}
            value={ingredientControlModel.getDropdownMatchValue()}
            onChange={this.handleMatchDropdownChange.bind(this)}/>
          </Col>
        </Row>
      </div>
    )
  }
}
