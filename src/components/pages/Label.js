var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

export default class Label extends React.Component {
  constructor() {
    super()
    this.state = {
      imageUrl: ''
    }
  }
  componentDidMount() {
    this.setState({
      imageUrl: this.props.params.labelId
    })
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
            <Image src={'www.label.inphood.com/inphood/' + this.state.imageUrl + '.jpg'} responsive rounded/>
          </Col>
          <Col xs={6} md={4}>
            <ControlLabel>Nutrition Label</ControlLabel>
          </Col>
        </Row>
      </Grid>
    )
  }
}