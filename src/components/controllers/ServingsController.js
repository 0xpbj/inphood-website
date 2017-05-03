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
    const servingAmount = '1'
    const servingMass = ' (0.00g)'

    const servingSizeLines = this.getServingSizeLines(
      1, 'plate', 'Recipe, About', servingAmount, servingMass)

    this.state = {
      servingAmount: servingAmount,
      servingAmountError: '',
      currentMass: servingMass,
      servingSizeLines: servingSizeLines,
      userServingSizeLines: false
    }
  }

  getServingSizeLines(
    servingSize, servingUnit, servingRatio, servingAmount, servingMass = '') {
    let servingSzLine1 = 'Serving Size ' + servingSize + ' ' + servingUnit
    servingSzLine1 += (servingMass !== '') ? servingMass : ''
    const servingSzLine2 = 'Servings Per ' + servingRatio + ' ' + servingAmount

    return servingSzLine1 + '\n' + servingSzLine2
  }
  //
  getServingSizeLinesFromState() {
    const {nutritionModel} = this.props.nutritionModelRed
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
    const servingMass = (compositeModel !== undefined) ?
                        ' (' + compositeModel.getServingAmount()
                             + compositeModel.getServingUnit() + ')' :
                        ''

    return this.getServingSizeLines(
      1, 'plate', 'Recipe, About', this.state.servingAmount, servingMass)
  }

  submitServingSizeLines(event) {
    this.updateServingSizeLines()
    event.preventDefault()
  }
  handleServingSizeLinesBlurred() {
    this.updateServingSizeLines()
  }
  updateServingSizeLines() {
    if (this.state.userServingSizeLines) {
     this.props.nutritionModelSetServingsLines(this.state.servingSizeLines)
    }
  }
  handleServingSizeLinesOnChange(value) {
    this.setState({
      userServingSizeLines: true,
      servingSizeLines: value
    })
  }

  handleReset() {
    const generatedServingLines = this.getServingSizeLinesFromState()
    this.setState(
      {userServingSizeLines: false, servingSizeLines: generatedServingLines})
    this.props.nutritionModelSetServingsLines(undefined)
  }

  componentWillReceiveProps() {
    const {nutritionModel} = this.props.nutritionModelRed
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
    const currentMass = (compositeModel !== undefined) ?
      compositeModel.getServingAmount() + compositeModel.getServingUnit() :
      ' (0.00g)'

    if (this.state.userServingSizeLines) {
      this.setState({currentMass})
    } else {
      const servingSizeLines = this.getServingSizeLinesFromState()
      this.setState({currentMass, servingSizeLines})
    }
  }

  updateReduxStore(servingsControlModel) {
    this.props.setServingsControllerModel(servingsControlModel)
    this.props.nutritionModelSetServings(servingsControlModel)
    this.props.serializeToFirebase()
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
    } else {
      this.setState({servingAmountError: ''})

      const {servingsControlModel} = this.props.servings
      const value = rationalToFloat(this.state.servingAmount)
      servingsControlModel.setServingAmount(value)

      this.updateReduxStore(servingsControlModel)
    }
  }
  render() {
    const {servingsControlModel} = this.props.servings
    const {servingAmountError} = this.state

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
                onSubmit={(event) => this.submitServingsAmount(event)}
                autoComplete="off">
                <FormGroup
                  style={{marginBottom: 5}}
                  controlId='servingsControlAmount'
                  validationState={this.getServingsAmountValidationState()}>
                  <Input
                    disabled={this.state.userServingSizeLines}
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
            <Col xs={12} className="small" style={{color:'silver'}}>
              Based on the number of servings this recipe creates, we've determined that each serving weighs: {compositeModel.getServingAmount()}{compositeModel.getServingUnit()}
            </Col>
          </Row>

          {/* Reflect the two lines shown in the nutrition label--allow them
              to be edited--full-override--by the user: */}
          <Row style={{marginTop: 40}}>
            <Col xs={11} style={{paddingRight: 0}}>
              <form
                onSubmit={(event) => this.submitServingSizeLines(event)}
                autoComplete="off">
                <FormGroup
                  style={{marginBottom: 0, marginTop: 20}}
                  controlId='servingsControlRatio'>
                  <Input
                    type='text'
                    label='Further customize serving size statements of your label here:'
                    multiline
                    rows={2}
                    maxLength={200}
                    value={this.state.servingSizeLines}
                    onBlur={this.handleServingSizeLinesBlurred.bind(this)}
                    onChange={this.handleServingSizeLinesOnChange.bind(this)}/>
                </FormGroup>
              </form>
            </Col>
            <Col>
              <TooltipButton
                tooltip='Revert to the generated serving size statements.'
                tooltipPosition='left'
                tooltipDelay={500}
                icon='repeat'
                style={{color: 'green', paddingTop: 50}}
                onClick={this.handleReset.bind(this)}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12} className="small" style={{color:'silver'}}>
              FDA guidance for portion sizes can be found here: <a href='https://www.gpo.gov/fdsys/pkg/CFR-2012-title21-vol2/xml/CFR-2012-title21-vol2-sec101-12.xml'>
                CFR-2012 Sec. 101.12</a>. A newer document for the new 2018 label standard is also available: <a href='https://www.ecfr.gov/cgi-bin/text-idx?SID=62495b8594bd56b22aa3e34ae8cbbf67&mc=true&node=se21.2.101_112&rgn=div8'>
                e-CFR-2017 Sec. 101.12</a>.
            </Col>
          </Row>

        </div>
      </div>
    )
  }
}
