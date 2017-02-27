var React = require('react')
import Col from 'react-bootstrap/lib/Col'
import Row from 'react-bootstrap/lib/Row'
import Grid from 'react-bootstrap/lib/Grid'
import Button from 'react-bootstrap/lib/Button'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'

export default class EmailForm extends React.Component {
  constructor() {
    super()
    this.state = {
      data: ''
    }
  }
  emailFlow() {
    this.props.initEmailFlow()
    this.props.getEmailData(this.state.data)
    this.props.onSend
  }
  render() {
    return (
      <Grid>
        <Row>
          <Col xs={4} md={4} />
          <Col xs={4} md={4}>
            <form horizontal>
              <FormGroup controlId="formControlsTextarea">
                <FormControl 
                  rows={4} 
                  componentClass="textarea" 
                  placeholder="Your message..." 
                  value={this.state.data}
                  onChange={(e) => this.setState({data: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Button type="submit" bsStyle="info" onClick={() => this.emailFlow()}>
                  Submit
                </Button>
              </FormGroup>
            </form>
          </Col>
          <Col xs={4} md={4} />
        </Row>
      </Grid>
    )
  }
}