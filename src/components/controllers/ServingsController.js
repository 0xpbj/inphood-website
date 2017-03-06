var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Slider from 'react-toolbox/lib/slider'
import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'

export default class ServingsController extends React.Component {
  constructor(props) {
    super(props)
  }

  handleServingValuesChange(servingValue) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Servings value changed',
      nonInteraction: false,
    });
    let {servingsControls} = this.props.servings

    servingsControls['value'] = servingValue
    this.props.nutritionModelSetServings(servingValue, servingsControls['unit'])

    this.props.setServingsControllerValues(servingsControls)
  }

  handleServingDropDownChange(servingUnit) {
    let {servingsControls} = this.props.servings
    if (servingUnit === 'people') {
      servingsControls['min'] = 1
      servingsControls['max'] = 24
      servingsControls['step'] = 1
      servingsControls['value'] = 2
    } else {
      servingsControls['min'] = 0
      servingsControls['max'] = 600
      servingsControls['step'] = 25
      servingsControls['value'] = 100
    }
    servingsControls['unit'] = servingUnit
    this.props.nutritionModelSetServings(servingsControls['value'], servingUnit)
    this.props.setServingsControllerValues(servingsControls)
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Servings value dropdown triggered',
      nonInteraction: false,
    });
  }

  render() {
    const {servingsControls} = this.props.servings
    return (
      <div>
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>Servings</text>
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
            <Col xs={9} md={9} style={{paddingLeft: 5, paddingRight: 5}}>
              <Slider
                value={servingsControls.value}
                min={servingsControls.min}
                max={servingsControls.max}
                step={servingsControls.step}
                onChange={this.handleServingValuesChange.bind(this)}
                editable pinned snaps/>
            </Col>
            <Col xs={3} md={3} style={{paddingLeft: 0}}>
                {/* TODO */}
                <Dropdownlist
                  data={['people', 'g']}
                  value={servingsControls.unit}
                  onChange={this.handleServingDropDownChange.bind(this)}/>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
