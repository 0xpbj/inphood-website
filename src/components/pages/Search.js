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
  searchFlow() {
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
        {/*<section>
          <ControlLabel>Search for a ingredient</ControlLabel>
          <Glyphicon
            onClick={()=>this.setState({searchPopoverFlag: !this.state.searchPopoverFlag})}
            style={{marginLeft: 10}}
            glyph="glyphicon glyphicon-info-sign">
            {searchPopover}
          </Glyphicon>
        </section>
        <section>*/}
          <Row>
            <Col xs={11} md={11} style={{paddingRight: 0}}>
              {/*<form onSubmit={this.searchFlow.bind(this)}>*/}
                <FormGroup
                  style={{marginBottom:0}}
                  controlId="formBasicText"
                  validationState={this.getValidationState()}
                >
                  <FormControl
                    type="text"
                    label="Text"
                    value={this.state.searchIngredient}
                    onChange={this.getData.bind(this)}
                    placeholder="Search & add (e.g: onions)"
                  />
                </FormGroup>
              {/*</form>*/}
            </Col>
            <Col xs={1} md={1} style={{paddingLeft: 5}}>
              <Button className="btn-primary-spacing" onClick={this.searchFlow.bind(this)}><Glyphicon glyph="glyphicon glyphicon-search"></Glyphicon></Button>
            </Col>
          </Row>
        {/*</section>
        <div style={{marginBottom: 10}} />*/}
      </div>
    )
  }
}
