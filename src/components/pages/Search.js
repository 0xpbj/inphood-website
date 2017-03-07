var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Modal from 'react-bootstrap/lib/Modal'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem'
import ProgressBar from 'react-toolbox/lib/progress_bar'

export default class Search extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false,
      searchIngredient: ''
    }
  }
  getData(e) {
    let searchIngredient = e.target.value.toLowerCase()
    this.setState({searchIngredient})
  }
  getValidationState() {
    const length = this.state.searchIngredient.length
    if (length === 0)
      return 'error'
    else if (length > 100)
      return 'error'
    else if (length > 0)
      return 'success'
  }
  searchFlow(event) {
    if (this.getValidationState() === 'error') {
      this.setState({searchIngredient: ''})
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'User searching for missing ingredients',
        nonInteraction: false,
        label: this.state.searchIngredient
      });
      this.props.searchIngredientData(this.state.searchIngredient)
      this.setState({searchIngredient: '', show: true})
    }
    event.preventDefault()
  }
  selectedListItem(match) {
    if (match[0] === '.....') {
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'User triggered elipses search',
          nonInteraction: false,
          label: ingredient
        });
      const {ingredient, matches} = this.props.search
      this.props.getMoreData(ingredient, matches.length)
    }
    else {
      this.props.addSearchSelection(match)
      this.setState({show: false})
    }
  }
  getSearchList() {
    const {ingredient, matches} = this.props.search
    let items = []
    for (let i of matches) {
      items.push(<ListGroupItem onClick={this.selectedListItem.bind(this, i)}>{i[0]}</ListGroupItem>)
    }
    if (items.length) {
      return <ListGroup>{items}</ListGroup>
    }
    else {
      return <ListGroup>No matches found for {ingredient}</ListGroup>
    }
  }
  render() {
    let close = () => this.setState({ show: false})
    let height = this.state.show ? 200 : 0
    const {searching} = this.props.search
    const modalBody = searching ? (
      <ProgressBar mode='indeterminate' multicolor />
    ) : this.getSearchList()
    return (
      <div className="modal-container" style={{height: height}}>
        <Modal
          show={this.state.show}
          onHide={close}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">Ingredient Super Search</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-left">
            {modalBody}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={close}>Close</Button>
          </Modal.Footer>
        </Modal>
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
