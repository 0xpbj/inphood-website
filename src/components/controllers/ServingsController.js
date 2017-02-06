var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Slider from 'react-toolbox/lib/slider'
import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'

export default class ServingsController extends React.Component {
  render() {
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
            <Col xs={10} md={10}>
              <Slider
                value={this.props.value}
                onChange={this.props.handleServingValuesChange}
                min={this.props.min}
                max={this.props.max}
                step={this.props.step}
                editable pinned snaps/>
            </Col>
            <Col xs={2} md={2}>
                {/* TODO */}
                <Dropdownlist
                  data={['people', 'g']}
                  value={this.props.unit}
                  onChange={this.props.handleServingDropDownChange}/>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}