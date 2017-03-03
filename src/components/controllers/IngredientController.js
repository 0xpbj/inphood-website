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
  handleSliderValuesChangeInternal(value) {
    let tag = this.props.tag
    this.props.handleSliderValuesChange(tag, value)
  }
  
  getValidationState() {
    const {ingredientControlModel} = this.props
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

  updateReduxStoreIfValid() {
    if (this.getValidationState() === 'success') {
      const tag = this.props.tag
      const {ingredientControlModel} = this.props
      const value = rationalToFloat(ingredientControlModel.getEditBoxValue())
      const units = this.props.ingredientControlModel.getDropdownUnitValue()
      this.props.handleSliderValuesChangeEditBox(tag, value, units)
    }
  }
  submitNewSliderValue(event) {
    this. updateReduxStoreIfValid()
    // This prevents the default behavior of a form submit which causes a full
    // re-render / re-state!
    event.preventDefault()
  }
  onEditBoxBlurred() {
    this.updateReduxStoreIfValid()
  }
  updateEditBoxValueFromForm(formObj) {
    console.log('updateEditBoxValueFromForm = ' + formObj.target.value);
    this.props.handleEditBoxValueChange(this.props.tag, formObj.target.value)
  }
  render() {
    const {tag, recipeLine, ingredientControlModel} = this.props
    const formControlId = tag + "FormControlId"

    let sliderValue = ingredientControlModel.getSliderValue()
    let editBoxValue = ingredientControlModel.getEditBoxValue()

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
                    value={editBoxValue}
                    onBlur={this.onEditBoxBlurred.bind(this)}
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
