const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import Input from 'react-toolbox/lib/input'
import Tooltip from 'react-toolbox/lib/tooltip'
const TooltipInput = Tooltip(Input)

export default class ServingsController extends React.Component {
  constructor(props) {
    super(props)
  }
  //
  componentWillMount() {
    this.handleServingsValueChange(undefined)
  }
  //
  handleServingsValueChange(analyticsAction) {
    if (analyticsAction !== undefined) {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: analyticsAction,
        nonInteraction: false
      });
    }
    const {servingsControlModel} = this.props.servings
    const servingsValue = Number(servingsControlModel.getValueEditBox())
    if (!isNaN(servingsValue) && servingsValue > 0 && servingsValue < 1001) {
      servingsControlModel.setValue(servingsValue)
      servingsControlModel.setValueEditBox(servingsValue.toString())

      const servingsRatio = servingsControlModel.getDisplayRatioEditBox()
      servingsControlModel.setDisplayRatio(servingsRatio)

      this.props.setServingsControllerModel(servingsControlModel)
      this.props.nutritionModelSetServings(servingsControlModel)
      this.props.initSerializedData()
    }
  }
  //
  //
  // Methods for servings amount form (edit box):
  //
  submitValues(event) {
    this.handleServingsAmountEditBoxBlurred()
    this.handleServingsRatioEditBoxBlurred()
    event.preventDefault()
  }
  //
  getServingsAmountValidationState() {
    const {servingsControlModel} = this.props.servings
    const valueEditBox = servingsControlModel.getValueEditBox()
    const number = Number(valueEditBox)
    if (!isNaN(number) && number > 0 && number < 1001) {
      return 'success'
    }
    else {
      return 'error'
    }
  }
  //
  handleServingsAmountEditBoxBlurred() {
    if (this.getServingsAmountValidationState() !== 'success') {
      return
    }
    else {
      this.handleServingsValueChange('Servings value edit box changed')
    }
  }
  //
  handleServingsAmountEditBoxChange(value) {
    const amount = value
    if (!isNaN(amount) && amount > 0 && amount < 1001) {
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setValueEditBox(amount)
      this.props.setServingsControllerModel(servingsControlModel)
      this.props.initSerializedData()
    }
  }
  //
  getServingsRatioValidationState() {
    const {servingsControlModel} = this.props.servings
    const ratioEditBox = servingsControlModel.getDisplayRatioEditBox()
    if (((typeof ratioEditBox) === 'string') && (ratioEditBox.trim().length > 0)) {
      return 'success'
    }
    else {
      return 'error'
    }
  }
  //
  handleServingsRatioEditBoxBlurred() {
    if (this.getServingsRatioValidationState() !== 'success') {
      return
    }
    else {
      this.handleServingsValueChange('Servings ratio edit box changed')
    }
  }
  //
  handleServingsRatioEditBoxChange(value) {
    const ratio = value
    const {servingsControlModel} = this.props.servings
    servingsControlModel.setDisplayRatioEditBox(ratio)
    this.props.setServingsControllerModel(servingsControlModel)
    this.props.initSerializedData()
  }
  //
  //
  // Methods for servings unit form (edit box):
  //
  submitNewDisplayUnit(event) {
    this.handleDisplayUnitEditBoxBlurred()
    event.preventDefault()
  }
  //
  getDisplayUnitValidationState() {
    const {servingsControlModel} = this.props.servings
    const displayUnitEditBox = servingsControlModel.getDisplayUnitEditBox()
    if (((typeof displayUnitEditBox) === 'string') && (displayUnitEditBox.trim().length > 0)) {
      return 'success'
    }
    return 'error'
  }
  //
  handleDisplayUnitEditBoxBlurred() {
    if (this.getDisplayUnitValidationState() === 'success') {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings unit edit box changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      const displayUnitEditBox = servingsControlModel.getDisplayUnitEditBox()
      servingsControlModel.setDisplayUnit(displayUnitEditBox)
      this.props.setServingsControllerModel(servingsControlModel)
      this.props.nutritionModelSetServings(servingsControlModel)
      this.props.initSerializedData()
    }
  }
  //
  handleDisplayUnitEditBoxChange(value) {
    const unit = value
    if (((typeof unit) === 'string') && (unit.trim().length > 0)) {
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setDisplayUnitEditBox(unit)
      this.props.setServingsControllerModel(servingsControlModel)
    }
  }
  submitNewServingUnit(event) {
    this.handleServingsSizeEditBoxBlurred()
    event.preventDefault()
  }
  //
  handleServingsSizeEditBoxBlurred() {
    if (this.getServingsSizeValidationState() !== 'success') {
      return
    }
    else {
      this.handleServingsSizeValueChange('Servings value edit box changed')
    }
  }
  //
  getServingsSizeValidationState() {
    const {servingsControlModel} = this.props.servings
    const valueEditBox = servingsControlModel.getDisplayUnitCount()
    const number = Number(valueEditBox)
    if (!isNaN(number) && number > 0 && number < 1001) {
      return 'success'
    }
    else {
      return 'error'
    }
  }
  //
  //
  // Methods for number of display unit (servings) slider:
  //
  handleServingsSizeValueChange(value) {
    if (!isNaN(value) && value > 0 && value < 1001) {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings size edit box changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setDisplayUnitCount(value)
      this.props.setServingsControllerModel(servingsControlModel)
      this.props.nutritionModelSetServings(servingsControlModel)
      this.props.initSerializedData()
    }
  }
  //
  render() {
    const {servingsControlModel} = this.props.servings
    return (
      <div>
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>Serving Settings</text>
          </Col>
        </Row>
        <div style={{borderWidth: 1,
                     borderColor: 'black',
                     borderStyle: 'solid',
                     borderRadius: 5,
                     padding: 10,
                     marginRight: 0,
                     marginLeft: 0}}>
          <Row>
           <Col xs={5} md={5} style={{paddingRigh: 10}}>
            <form
              onSubmit={(event) => this.submitNewServingUnit(event)}
              autoComplete="off">
              <FormGroup style={{marginBottom: 0}}
                controlId='servingsControlUnitEditBox'
                validationState={this.getServingsSizeValidationState()}>
                <TooltipInput 
                  tooltip='Type your servings size here' 
                  tooltipPosition='bottom'
                  type='text' 
                  label='Serving Size' 
                  maxLength={50} 
                  value={servingsControlModel.getDisplayUnitCount()}
                  onBlur={this.handleServingsSizeEditBoxBlurred.bind(this)}
                  onChange={this.handleServingsSizeValueChange.bind(this)}
                />
              </FormGroup>
            </form>
           </Col>
           <Col xs={1} md={1} />
           <Col xs={5} md={5}>
            <form
              onSubmit={(event) => this.submitNewDisplayUnit(event)}
              autoComplete="off">
              <FormGroup style={{marginBottom: 0}}
                controlId='servingsControlUnitEditBox'
                validationState={this.getDisplayUnitValidationState()}>
                <TooltipInput 
                  tooltip='Type your servings units here' 
                  tooltipPosition='bottom'
                  type='text' 
                  label='Serving Units' 
                  maxLength={50} 
                  value={servingsControlModel.getDisplayUnitEditBox()}
                  onBlur={this.handleDisplayUnitEditBoxBlurred.bind(this)}
                  onChange={this.handleDisplayUnitEditBoxChange.bind(this)}
                />
              </FormGroup>
            </form>
           </Col>
          </Row>
          <Row>
            <Col xs={5} md={5} style={{paddingRight: 10}}>
              <form
                onSubmit={(event) => this.submitValues(event)}
                autoComplete="off">
                <FormGroup
                  controlId='servingsControlRatioEditBox'
                  validationState={this.getServingsRatioValidationState()}>
                  <TooltipInput 
                    tooltip='Type your servings ratio here' 
                    tooltipPosition='bottom'
                    type='text' 
                    label='Serving Per Recipe' 
                    maxLength={50} 
                    value={servingsControlModel.getDisplayRatioEditBox()}
                    onBlur={this.handleServingsRatioEditBoxBlurred.bind(this)}
                    onChange={this.handleServingsRatioEditBoxChange.bind(this)}
                  />
                </FormGroup>
              </form>
            </Col>
            <Col xs={1} md={1} />
            <Col xs={5} md={5}>
              <form
                onSubmit={(event) => this.submitValues(event)}
                autoComplete="off">
                <FormGroup
                  controlId='servingsControlAmountEditBox'
                  validationState={this.getServingsAmountValidationState()}>
                  <TooltipInput 
                    tooltip='Type your servings amount here' 
                    tooltipPosition='bottom'
                    type='text' 
                    label='Serving Amount' 
                    maxLength={50} 
                    value={servingsControlModel.getValueEditBox()}
                    onBlur={this.handleServingsAmountEditBoxBlurred.bind(this)}
                    onChange={this.handleServingsAmountEditBoxChange.bind(this)}
                  />
                </FormGroup>
              </form>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
