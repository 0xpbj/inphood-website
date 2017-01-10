var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

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
    if (!this.props.results.data || this.props.results.data.oUrl === '') {
      this.props.router.push('/')
    }
    return (
      <Grid>
        <div className="text-center">
        <Row className="show-grid">
          <Col xs={6} md={4}>
            <Row className="show-grid">
              <ControlLabel>Food Image</ControlLabel>
              <a href={'http://www.instagram.com/' + this.props.results.data.user}>
                <Tooltip placement="top" className="in" id="tooltip-top">
                  @{this.props.results.data.user}
                </Tooltip>
                <Image src={this.props.results.data.oUrl} responsive rounded/>
              </a>
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