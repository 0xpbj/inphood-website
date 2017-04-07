const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import Input from 'react-toolbox/lib/input'
import Tooltip from 'react-toolbox/lib/tooltip'
const TooltipInput = Tooltip(Input)
import {isNumeric, isValidString, rationalToFloat} from '../../helpers/ConversionUtils'


export default class ServingsController extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      servingSize: 1,
      servingUnit: 'plate',
      servingAmount: '1',
      servingRatio: 'Recipe, About',
      servingSizeError: '',
      servingUnitError: '',
      servingAmountError: '',
      servingRatioError: ''
    }
  }
  componentWillMount() {
    const {servingsControlModel} = this.props.servings
    servingsControlModel.setServingSize(this.state.servingSize)
    servingsControlModel.setServingUnit(this.state.servingUnit)
    servingsControlModel.setServingRatio(this.state.servingRatio)
    servingsControlModel.setServingAmount(this.state.servingAmount)
    this.updateReduxStore(servingsControlModel)
  }
  updateReduxStore(servingsControlModel) {
    this.props.setServingsControllerModel(servingsControlModel)
    this.props.nutritionModelSetServings(servingsControlModel)
    this.props.serializeToFirebase()
  }
  //
  //
  // Methods for servings size:
  //
  submitServingSize(event) {
    this.handleServingsSizeChange()
    event.preventDefault()
  }
  getServingsSizeValidationState() {
    return isNumeric(this.state.servingSize)
  }
  handleServingsSizeBlurred() {
    this.handleServingsSizeChange()
  }
  handleServingsSizeChange() {
    if (this.getServingsSizeValidationState() !== 'success') {
      this.setState({servingSizeError: 'Invalid Input'})
      return
    }
    else {
      this.setState({servingSizeError: ''})
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings size changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setServingSize(this.state.servingSize)
      this.updateReduxStore(servingsControlModel)
    }
  }
  //
  //
  // Methods for servings unit:
  //
  submitServingUnit(event) {
    this.handleServingUnitChange()
    event.preventDefault()
  }
  getServingUnitValidationState() {
    const {servingUnit} = this.state
    return isValidString(servingUnit)
  }
  handleServingUnitBlurred() {
    this.handleServingUnitChange()
  }
  handleServingUnitChange() {
    if (this.getServingUnitValidationState() !== 'success') {
      this.setState({servingUnitError: 'Invalid Input'})
      return
    }
    else {
      this.setState({servingUnitError: ''})
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings unit changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setServingUnit(this.state.servingUnit)
      this.updateReduxStore(servingsControlModel)
    }
  }
  //
  //
  // Methods for servings ratio:
  //
  submitServingRatio(event) {
    this.handleServingsRatioChange()
    event.preventDefault()
  }
  getServingsRatioValidationState() {
    const {servingRatio} = this.state
    return isValidString(servingRatio)
  }
  handleServingsRatioBlurred() {
    this.handleServingsRatioChange()
  }
  handleServingsRatioChange() {
    if (this.getServingsRatioValidationState() !== 'success') {
      this.setState({servingRatioError: 'Invalid Input'})
      return
    }
    else {
      this.setState({servingRatioError: ''})
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings ratio changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setServingRatio(this.state.servingRatio)
      this.updateReduxStore(servingsControlModel)
    }
  }
  //
  //
  // Methods for servings amount:
  //
  submitServingsAmount(event) {
    this.handleServingsAmountChange()
    event.preventDefault()
  }
  getServingsAmountValidationState() {
    const {servingAmount} = this.state
    return isNumeric(servingAmount)
  }
  handleServingsAmountBlurred() {
    this.handleServingsAmountChange()
  }
  handleServingsAmountChange() {
    if (this.getServingsAmountValidationState() !== 'success') {
      this.setState({servingAmountError: 'Invalid Input'})
      return
    }
    else {
      this.setState({servingAmountError: ''})
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings amount changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      const value = rationalToFloat(this.state.servingAmount)
      servingsControlModel.setServingAmount(value)
      this.updateReduxStore(servingsControlModel)
    }
  }
  render() {
    const {servingsControlModel} = this.props.servings
    const {servingSizeError, servingUnitError, servingRatioError, servingAmountError} = this.state
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
                     marginLeft: 0,
                     backgroundColor: 'white'}}>
          <Row>
           <Col xs={5} md={5} style={{paddingRigh: 10}}>
            <form
              onSubmit={(event) => this.submitServingSize(event)}
              autoComplete="off">
              <FormGroup style={{marginBottom: 0}}
                controlId='servingsControlUnit'
                validationState={this.getServingsSizeValidationState()}>
                <TooltipInput
                  tooltip='Type your servings size here'
                  tooltipPosition='bottom'
                  type='text'
                  label='Serving Size'
                  maxLength={50}
                  error={servingSizeError}
                  value={this.state.servingSize}
                  onBlur={this.handleServingsSizeBlurred.bind(this)}
                  onChange={(value) => this.setState({servingSize: value})}
                />
              </FormGroup>
            </form>
           </Col>
           <Col xs={1} md={1} />
           <Col xs={5} md={5}>
            <form
              onSubmit={(event) => this.submitServingUnit(event)}
              autoComplete="off">
              <FormGroup style={{marginBottom: 0}}
                controlId='servingsControlUnit'
                validationState={this.getServingUnitValidationState()}>
                <TooltipInput
                  tooltip='Type your servings units here'
                  tooltipPosition='bottom'
                  type='text'
                  label='Serving Units'
                  maxLength={50}
                  error={servingUnitError}
                  value={this.state.servingUnit}
                  onBlur={this.handleServingUnitBlurred.bind(this)}
                  onChange={(value) => this.setState({servingUnit: value})}
                />
              </FormGroup>
            </form>
           </Col>
          </Row>
          <Row>
            <Col xs={5} md={5} style={{paddingRight: 10}}>
              <form
                onSubmit={(event) => this.submitServingRatio(event)}
                autoComplete="off">
                <FormGroup
                  controlId='servingsControlRatio'
                  validationState={this.getServingsRatioValidationState()}>
                  <TooltipInput
                    tooltip='Type your servings ratio here'
                    tooltipPosition='bottom'
                    type='text'
                    label='Servings Per'
                    maxLength={50}
                    error={servingRatioError}
                    value={this.state.servingRatio}
                    onBlur={this.handleServingsRatioBlurred.bind(this)}
                    onChange={(value) => this.setState({servingRatio: value})}
                  />
                </FormGroup>
              </form>
            </Col>
            <Col xs={1} md={1} />
            <Col xs={5} md={5}>
              <form
                onSubmit={(event) => this.submitServingsAmount(event)}
                autoComplete="off">
                <FormGroup
                  controlId='servingsControlAmount'
                  validationState={this.getServingsAmountValidationState()}>
                  <TooltipInput
                    tooltip='Type your servings amount here'
                    tooltipPosition='bottom'
                    type='text'
                    label='Serving Amount'
                    maxLength={50}
                    error={servingAmountError}
                    value={this.state.servingAmount}
                    onBlur={this.handleServingsAmountBlurred.bind(this)}
                    onChange={(value) => this.setState({servingAmount: value})}
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
