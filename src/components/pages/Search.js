var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

export default class Search extends React.Component {
  constructor() {
    super()
    this.state = {
      searchIngredient: '',
      searchPopoverFlag: false,
      results: []
    }
  }
  searchFlow(event) {
    if (this.getValidationState() === 'error') {
      this.setState({results: []})
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'User searching for missing ingredients',
        nonInteraction: false
      });
      this.props.searchIngredientData(this.state.searchIngredient)
      this.setState({searchIngredient: ''})
    }
    event.preventDefault()
  }
  getData(e) {
    let searchIngredient = e.target.value.toLowerCase()
    this.setState({searchIngredient})
  }
  getValidationState() {
    const length = this.state.searchIngredient.length
    if (length > 0)
      return 'success'
    else if (length === 0)
      return 'error'
  }
  render() {
    const searchPopover = this.state.searchPopoverFlag ? (
      <Popover
        id="popover-basic"
        title="Search Flow">
        Enter ingredient to search for
      </Popover>
    ) : null
    return (
      <div>
        <form
          onSubmit={(event) => this.searchFlow(event)}
          autoComplete="off">
          <FormGroup
            style={{marginBottom:0}}
            controlId="formBasicText"
            validationState={this.getValidationState()}
          >
            <FormControl
              spellcheck={true}
              type="text"
              label="Text"
              value={this.state.searchIngredient}
              onChange={this.getData.bind(this)}
              placeholder="Search & add (e.g: carrots)"
            />
          </FormGroup>
        </form>
      </div>
    )
  }
}
