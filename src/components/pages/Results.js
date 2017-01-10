var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

export default class Results extends React.Component {
  constructor() {
    super()
  }
  componentWillMount() {
    this.props.getLabelId(this.props.params.labelId)
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    if (this.props.results.data === null) {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Oh snap! Label not found!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    }
    else {
      const image = this.props.results.data.user === 'anonymous'
      ? <Image src={this.props.results.data.oUrl} responsive rounded/>  
      : ( 
          <a href={'http://www.instagram.com/p/' + this.props.results.data.key}>
            <Tooltip placement="top" className="in" id="tooltip-top">
              @{this.props.results.data.user}
            </Tooltip>
            <Image src={this.props.results.data.oUrl} responsive rounded/>
          </a>
      )
      return (
        <Grid>
          <div className="text-center">
          <Row className="show-grid">
            <Col xs={6} md={4}>
              <Row className="show-grid">
                <ControlLabel>Food Image</ControlLabel>
                {image}
              </Row>
            </Col>
            <Col xs={6} md={4}>
              <ControlLabel>Nutrition Label</ControlLabel>
            </Col>
          </Row>
          </div>
        </Grid>
      )
    }
  }
}