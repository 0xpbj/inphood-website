var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Slider from 'react-toolbox/lib/slider'
import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'

export default class ServingsController extends React.Component {
  constructor(props) {
    super(props)
  }
  //
  handleServingsValueChange(servingsValue) {
    const {servingsControlModel} = this.props.servings

    servingsControlModel.setValue(servingsValue)
    servingsControlModel.setValueEditBox(servingsValue.toString())
    this.props.setServingsControllerModel(servingsControlModel)
    this.props.nutritionModelSetServings(servingsControlModel)
  }
  //
  handleServingsValueSliderChange(servingsValue) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Servings value slider changed',
      nonInteraction: false,
    });

    this.handleServingsValueChange(servingsValue)
  }
  //
  //
  // Methods for servings amount form (edit box):
  //
  submitNewServingsAmount(event) {
    this.handleServingsAmountEditBoxBlurred()

    // Prevent the default form submit behavior (causing full re-render)
    event.preventDefault()
  }
  //
  getServingsAmountValidationState() {
    const {servingsControlModel} = this.props.servings
    const valueEditBox = servingsControlModel.getValueEditBox()
    if (! isNaN(Number(valueEditBox))) {
      return 'success'
    }

    return 'error'
  }
  //
  handleServingsAmountEditBoxBlurred() {
    if (this.getServingsAmountValidationState() === 'success') {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings value edit box changed',
        nonInteraction: false,
      });

      const {servingsControlModel} = this.props.servings
      const valueEditBox = servingsControlModel.getValueEditBox()
      this.handleServingsValueChange(Number(valueEditBox))
    }
  }
  //
  handleServingsAmountEditBoxChange(formObject) {
    const amount = formObject.target.value
    const {servingsControlModel} = this.props.servings
    servingsControlModel.setValueEditBox(amount)

    this.props.setServingsControllerModel(servingsControlModel)
  }
  //
  //
  // Methods for number of display unit (servings) slider:
  //
  handleDisplayUnitCountSliderChange(servingUnitCount) {
    const {servingsControlModel} = this.props.servings
    servingsControlModel.setDisplayUnitCount(servingUnitCount)
    this.props.setServingsControllerModel(servingsControlModel)
    this.props.nutritionModelSetServings(servingsControlModel)
  }
  //
  //
  // Methods for servings unit form (edit box):
  //
  submitNewDisplayUnit(event) {
    this.handleDisplayUnitEditBoxBlurred()

    // Prevent the default form submit behavior (causing full re-render)
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
    }
  }
  //
  handleDisplayUnitEditBoxChange(formObject) {
    const unit = formObject.target.value

    const {servingsControlModel} = this.props.servings
    servingsControlModel.setDisplayUnitEditBox(unit)

    this.props.setServingsControllerModel(servingsControlModel)
  }


  // handleServingDropDownChange(servingUnit) {
  //   let {servingsControls} = this.props.servings
  //   if (servingUnit === 'people') {
  //     servingsControls['min'] = 1
  //     servingsControls['max'] = 24
  //     servingsControls['step'] = 1
  //     servingsControls['value'] = 2
  //   } else {
  //     servingsControls['min'] = 0
  //     servingsControls['max'] = 600
  //     servingsControls['step'] = 25
  //     servingsControls['value'] = 100
  //   }
  //   servingsControls['unit'] = servingUnit
  //   this.props.nutritionModelSetServings(servingsControls['value'], servingUnit)
  //   this.props.setServingsControllerModel(servingsControlModel)
  //   ReactGA.event({
  //     category: 'Nutrition Mixer',
  //     action: 'Servings value dropdown triggered',
  //     nonInteraction: false,
  //   });
  // }

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
                     marginRight: 10,
                     marginLeft: 10}}>
          <Row>
            <Col xs={4} md={4}>
              <text>Servings per recipe<br/>(i.e. serves 12 people)</text>
            </Col>

            <Col xs={6} md={6} style={{paddingLeft: 5, paddingRight: 5}}>
              <Slider
                value={servingsControlModel.getValue()}
                min={servingsControlModel.getMin()}
                max={servingsControlModel.getMax()}
                step={servingsControlModel.getStep()}
                pinned snaps
                onChange={this.handleServingsValueSliderChange.bind(this)}
              />
            </Col>

            <Col xs={2} md={2} style={{paddingLeft: 0}}>
              <form
                onSubmit={(event) => this.submitNewServingsAmount(event)}
                autoComplete="off">
                <FormGroup
                  controlId='servingsControlAmountEditBox'
                  validationState={this.getServingsAmountValidationState()}>
                  <FormControl
                    componentClass="input"
                    className="text-right"
                    type="text"
                    label="Text"
                    value={servingsControlModel.getValueEditBox()}
                    onBlur={this.handleServingsAmountEditBoxBlurred.bind(this)}
                    onChange={this.handleServingsAmountEditBoxChange.bind(this)}/>
                </FormGroup>
              </form>
            </Col>
          </Row>

          <Row>
            <Col xs={4} md={4}>
              <text>Serving details:<br/>(i.e. 2 tacos)</text>
            </Col>

            <Col xs={6} md={6} style={{paddingLeft: 5, paddingRight: 5}}>
              <Slider
                value={servingsControlModel.getDisplayUnitCount()}
                min={1}
                max={10}
                step={1}
                pinned snaps
                onChange={this.handleDisplayUnitCountSliderChange.bind(this)}
              />
            </Col>

            <Col xs={2} md={2} style={{paddingLeft: 0}}>
              <form
                onSubmit={(event) => this.submitNewDisplayUnit(event)}
                autoComplete="off">
                <FormGroup style={{marginBottom: 0}}
                  controlId='servingsControlUnitEditBox'
                  validationState={this.getDisplayUnitValidationState()}>
                  <FormControl
                    componentClass="input"
                    className="text-right"
                    type="text"
                    label="Text"
                    value={servingsControlModel.getDisplayUnitEditBox()}
                    onBlur={this.handleDisplayUnitEditBoxBlurred.bind(this)}
                    onChange={this.handleDisplayUnitEditBoxChange.bind(this)}/>
                </FormGroup>
              </form>
            </Col>

          </Row>
        </div>
      </div>
    )
  }
}
