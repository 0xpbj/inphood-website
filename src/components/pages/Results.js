var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Label from './NutritionEstimateJSX'

export default class Results extends React.Component {
  constructor() {
    super()
    this.state = {
      labelId: ''
    }
  }
  componentDidMount() {
    this.setState({
      labelId: this.props.params.labelId
    })
    this.props.getLabelId(this.props.params.labelId)
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    return (
      <Grid>
        <Row className="show-grid">
          <Col xs={12} md={8}>
            <ControlLabel>Food Image</ControlLabel>
            <Image src={this.props.results.data.oUrl} responsive rounded/>
          </Col>
          <Col xs={6} md={4}>
            <ControlLabel>Nutrition Label</ControlLabel>
            <Label
              servingAmount="100" servingUnit="g"
              totalCal="200" totalFatCal="130"
              totalFat="100" totalFatDayPerc="100"
              saturatedFat="9g" saturatedFatDayPerc="22%"
              transFat="0g"
              cholesterol="55mg" cholesterolDayPerc="80%"
              sodium="40mg" sodiumDayPerc="2%"
              totalCarb="20g" totalCarbDayPerc="30%"
              fiber="1g" fiberDayPerc="4%"
              sugars="14g"
              protein="50g"/>
          </Col>
        </Row>
      </Grid>
    )
  }
}