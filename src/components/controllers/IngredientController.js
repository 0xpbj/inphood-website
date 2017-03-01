var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'
import Chip from 'react-toolbox/lib/chip'
import Slider from 'react-toolbox/lib/slider'
import {rationalToFloat} from '../../helpers/ConversionUtils'

export default class IngredientController extends React.Component {
  constructor() {
    super()
    this.state = {
      editBoxValue: ""
    }
  }
  componentWillReceiveProps() {
    this.setState({editBoxValue: this.props.ingredientControlModel.getSliderValue().toString()})
  }
  componentWillMount() {
    this.setState({editBoxValue: this.props.ingredientControlModel.getSliderValue().toString()})
  }
  handleSliderValuesChangeInternal(value) {
    let tag = this.props.tag
    this.props.handleSliderValuesChange(tag, value)
    this.setState({editBoxValue: value.toString()})
  }
  getValidationState() {
    let returnValue = 'success'
    try {
      const value = rationalToFloat(this.state.editBoxValue)
    } catch(err) {
      returnValue = 'error'
    }
    return returnValue
  }
  submitNewSliderValue(event) {
    if (this.getValidationState() === 'success') {
      const tag = this.props.tag
      const value = rationalToFloat(this.state.editBoxValue)
      const units = this.props.ingredientControlModel.getDropdownUnitValue()
      this.props.handleSliderValuesChangeEditBox(tag, value, units)
    }

    // This prevents the default behavior of a form submit which causes a full
    // re-render / re-state!
    event.preventDefault()
  }
  updateEditBoxValueFromForm(formObj) {
    console.log('updateEditBoxValueFromForm = ' + formObj.target.value);
    this.setState({editBoxValue: formObj.target.value})
  }
  render() {
    const {tag, recipeLine, ingredientControlModel} = this.props
    const formControlId = tag + "FormControlId"

    let sliderValue = ingredientControlModel.getSliderValue()

    return (
      <div>
        {/* row 1 from above: */}
        <Row
          style={{marginTop: 20}}>
          <Col xs={12} md={12}>
            <Chip
              onDeleteClick={this.props.handleChipDelete}
              deletable>
              {recipeLine}
            </Chip>
          </Col>
        </Row>
        <div style={{borderWidth: 1,
                     borderColor: 'black',
                     borderStyle: 'solid',
                     borderRadius: 5,
                     padding: 10,
                     marginRight: 10,
                     marginLeft: 10}}>
          {/* row 2 from above: */}
          <Row>
            <Col xs={8} md={8} style={{paddingLeft: 5, paddingRight: 5}}>
              <Slider
                value={sliderValue}
                onChange={this.handleSliderValuesChangeInternal.bind(this)}
                min={ingredientControlModel.getSliderMin()}
                max={ingredientControlModel.getSliderMax()}
                step={ingredientControlModel.getSliderStep()}
                snaps/>
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
                    value={this.state.editBoxValue}
                    onChange={this.updateEditBoxValueFromForm.bind(this)}/>
                </FormGroup>
              </form>
            </Col>
            <Col xs={2} md={2} style={{paddingLeft: 0}}>
              <Dropdownlist
                data={ingredientControlModel.getDropdownUnits()}
                value={ingredientControlModel.getDropdownUnitValue()}
                onChange={this.props.handleUnitDropdownChange}/>
            </Col>
          </Row>
          {/* row 3 from above: */}
          <Row
            style={{marginTop: 10}}>
            <Col xs={12} md={12}>
            <Dropdownlist
              data={ingredientControlModel.getDropdownMatches()}
              value={ingredientControlModel.getDropdownMatchValue()}
              onChange={this.props.handleMatchDropdownChange}/>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
