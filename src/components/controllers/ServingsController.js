const React = require('react')
// import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import FormGroup from 'react-bootstrap/lib/FormGroup'

import Input from 'react-toolbox/lib/input'
import Tooltip from 'react-toolbox/lib/tooltip'
const TooltipInput = Tooltip(Input)
import {IconButton} from 'react-toolbox/lib/button'
const TooltipButton = Tooltip(IconButton)

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
      servingRatioError: '',
      servingSizeLines: '',
      userServingSizeLines: false
    }
  }
  getGeneratedServingSizeLines() {
    // Ugly, but necessary for the time being--pull in the nutrition model from
    // the nutrition model reducer to produce the mass calculated in the
    // composite ingredient model:
    //
    //   TODO: look at better ways to share this data or calculate it once on
    //         change
    const {nutritionModel} = this.props.nutritionModelRed
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()

    let servingSzLine1 = 'Serving Size ' +
      this.state.servingSize + ' ' + this.state.servingUnit +
      ' (' + compositeModel.getServingAmount() + compositeModel.getServingUnit() + ')'

    let servingSzLine2 = 'Servings Per ' +
      this.state.servingRatio + ', ' + this.state.servingAmount

    return servingSzLine1 + '\n' + servingSzLine2
  }
  updateServingSizeLines(reset = false) {
    if (this.state.userServingSizeLines && !reset) {
      return
    }

    const servingSizeLines = this.getGeneratedServingSizeLines()
    if (reset === true) {
      this.setState({servingSizeLines, userServingSizeLines: false})
    } else {
      this.setState({servingSizeLines})
    }
  }
  handleServingSizeLinesChange(editBoxValue) {
    this.setState({servingSizeLines: editBoxValue.value, userServingSizeLines: true})
  }
  handleReset() {
    this.updateServingSizeLines(true)
  }
  //
  componentWillReceiveProps() {
    // TODO: probably look at using redux store based update model for servingSizeLines
    //       (this works b/c the nutrition model changes and results in this getting called)
    this.updateServingSizeLines()
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

    this.updateServingSizeLines()
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
      // ReactGA.event({
      //   category: 'Nutrition Mixer',
      //   action: 'Servings size changed',
      //   nonInteraction: false,
      // });
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
      // ReactGA.event({
      //   category: 'Nutrition Mixer',
      //   action: 'Servings unit changed',
      //   nonInteraction: false,
      // });
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
      // ReactGA.event({
      //   category: 'Nutrition Mixer',
      //   action: 'Servings ratio changed',
      //   nonInteraction: false,
      // });
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
      // ReactGA.event({
      //   category: 'Nutrition Mixer',
      //   action: 'Servings amount changed',
      //   nonInteraction: false,
      // });
      const {servingsControlModel} = this.props.servings
      const value = rationalToFloat(this.state.servingAmount)
      servingsControlModel.setServingAmount(value)
      this.updateReduxStore(servingsControlModel)
    }
  }
  render() {
    const {servingsControlModel} = this.props.servings
    const {servingSizeError, servingUnitError, servingRatioError, servingAmountError} = this.state

    // Ugly, but necessary for the time being--pull in the nutrition model from
    // the nutrition model reducer to produce the mass calculated in the
    // composite ingredient model:
    //
    //   TODO: look at better ways to share this data or calculate it once on
    //         change
    const {nutritionModel} = this.props.nutritionModelRed
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()

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
           <Col xs={12}>
            <form
              onSubmit={(event) => this.submitServingUnit(event)}
              autoComplete="off">
              <FormGroup
                style={{marginBottom: 0}}
                controlId='servingsControlUnit'
                validationState={this.getServingUnitValidationState()}>
                <Input
                  type='text'
                  label='What is a portion of this food called (i.e. cookie, taco ...)?'
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
            <Col xs={12}>
              <form
                onSubmit={(event) => this.submitServingSize(event)}
                autoComplete="off">
                <FormGroup
                  style={{marginBottom: 5}}
                  controlId='servingsControlUnit'
                  validationState={this.getServingsSizeValidationState()}>
                  <Input
                    type='text'
                    label='How many portions are in a serving of this food?'
                    maxLength={50}
                    error={servingSizeError}
                    value={this.state.servingSize}
                    onBlur={this.handleServingsSizeBlurred.bind(this)}
                    onChange={(value) => this.setState({servingSize: value})}
                  />
                </FormGroup>
              </form>
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <Well className="small" style={{background: 'white', padding:5, color:'silver'}}>
                FDA guidance for portion sizes can be found here: <a href='https://www.gpo.gov/fdsys/pkg/CFR-2012-title21-vol2/xml/CFR-2012-title21-vol2-sec101-12.xml'>
                  CFR-2012 Sec. 101.12</a>. A newer document for the new 2018 label standard is also available: <a href='https://www.ecfr.gov/cgi-bin/text-idx?SID=62495b8594bd56b22aa3e34ae8cbbf67&mc=true&node=se21.2.101_112&rgn=div8'>
                  e-CFR-2017 Sec. 101.12</a>.
              </Well>
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <form
                onSubmit={(event) => this.submitServingRatio(event)}
                autoComplete="off">
                <FormGroup
                  style={{marginBottom: 0, marginTop: 20}}
                  controlId='servingsControlRatio'
                  validationState={this.getServingsRatioValidationState()}>
                  <Input
                    type='text'
                    label='How is this food distributed (bottle, container, package, recipe ...)?'
                    maxLength={50}
                    error={servingRatioError}
                    value={this.state.servingRatio}
                    onBlur={this.handleServingsRatioBlurred.bind(this)}
                    onChange={(value) => this.setState({servingRatio: value})}
                  />
                </FormGroup>
              </form>
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <form
                onSubmit={(event) => this.submitServingsAmount(event)}
                autoComplete="off">
                <FormGroup
                  style={{marginBottom: 5}}
                  controlId='servingsControlAmount'
                  validationState={this.getServingsAmountValidationState()}>
                  <Input
                    type='text'
                    label='How many servings does this recipe create?'
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

          <Row>
            <Col xs={12}>
              <Well className="small" style={{background: 'white', padding:5, color:'silver'}}>
                Based on the number of servings this recipe creates, we've determined that each serving weighs: {compositeModel.getServingAmount()}{compositeModel.getServingUnit()}
              </Well>
            </Col>
          </Row>

          {/* Reflect the two lines shown in the nutrition label--allow them
              to be edited--full-override--by the user: */}
          <Row>
            <Col xs={11} style={{paddingRight: 0}}>
              <form
                autoComplete="off">
                <FormGroup
                  style={{marginBottom: 0, marginTop: 20}}
                  controlId='servingsControlRatio'>
                  <Input
                    type='text'
                    label='These serving size statements appear on your label (but can be further customized here):'
                    style={{paddingTop: 20}}
                    multiline
                    rows={2}
                    maxLength={200}
                    value={this.state.servingSizeLines}
                    onChange={(value) => this.handleServingSizeLinesChange({value})}/>
                </FormGroup>
              </form>
            </Col>
            <Col>
              <TooltipButton
                tooltip='Reset the serving size statements to generated values.'
                tooltipPosition='right'
                tooltipDelay={500}
                icon='repeat'
                style={{color: 'green', paddingTop: 60}}
                onClick={this.handleReset.bind(this)}
              />
            </Col>
          </Row>

        </div>
      </div>
    )
  }
}
