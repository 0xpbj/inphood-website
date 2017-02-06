var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'
import Chip from 'react-toolbox/lib/chip'
import Slider from 'react-toolbox/lib/slider'

export default class IngredientController extends React.Component {
  render() {
    const {tag, ingredientControlModel} = this.props
    return (
      <div>
        {/* row 1 from above: */}
        <Row
          style={{marginTop: 20}}>
          <Col xs={12} md={12}>
            <Chip
              onDeleteClick={this.props.handleChipDelete}
              deletable>
              {tag}
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
            <Col xs={10} md={10} style={{paddingLeft: 5, paddingRight: 5}}>
              <Slider
                value={ingredientControlModel.getSliderValue()}
                onChange={this.props.handleSliderValuesChange}
                min={ingredientControlModel.getSliderMin()}
                max={ingredientControlModel.getSliderMax()}
                step={ingredientControlModel.getSliderStep()}
                editable
                snaps/>
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