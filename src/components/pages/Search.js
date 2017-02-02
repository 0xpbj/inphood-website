var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

export default class Search extends React.Component {
  constructor() {
    super()
    this.state = {
      searchIngredient: '',
      searchError: false,
      searchPopoverFlag: false
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log('Got some search results here: ', nextProps)
  }
  searchFlow() {
    if (this.state.searchIngredient === '') {
      this.setState({searchError: true})
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'User searching for missing ingredients',
        nonInteraction: false
      });
      this.props.searchIngredientData(this.state.searchIngredient)
    }
  }
  getData(e) {
    let searchIngredient = e.target.value.toLowerCase()
    this.setState({searchIngredient, searchError: false})
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    const searchAlert = (this.state.searchError) ? (
      <Alert bsStyle="danger">
        <h4>Oh snap! You forgot to enter a search ingredient!</h4>
      </Alert>
    ) : null
    const searchPopover = this.state.searchPopoverFlag ? (
      <Popover
        id="popover-basic"
        title="Search Flow">
        Enter ingredient to search for
      </Popover>
    ) : null
    return (
      <div>
        <section>
          <ControlLabel>Search for a ingredient</ControlLabel>
          {searchAlert}
          <Glyphicon
            onClick={()=>this.setState({searchPopoverFlag: !this.state.searchPopoverFlag})}
            style={{marginLeft: 10}}
            glyph="glyphicon glyphicon-info-sign">
            {searchPopover}
          </Glyphicon>
        </section>
        <section>
          <FormControl
            id="formControlsText"
            type="text"
            label="Text"
            onChange={this.getData.bind(this)}
            placeholder="Example: green onions"
          />
          <Button className="btn-primary-spacing" onClick={() => this.searchFlow()}><Glyphicon glyph="glyphicon glyphicon-search"></Glyphicon></Button>
        </section>
      </div>
    )
  }
}
