const React = require('react')
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
  dataFlow(event) {
    this.setState({data: event.target.value})
    this.props.data(this.state.data)
    event.preventDefault()
  }
  render() {
    return (
      <form>
        <FormGroup controlId="formControlsTextarea">
          <FormControl 
            rows={4} 
            componentClass="textarea" 
            placeholder="Your message..." 
            value={this.state.data}
            onChange={(event) => this.dataFlow(event)}
          />
        </FormGroup>
      </form>
    )
  }
}