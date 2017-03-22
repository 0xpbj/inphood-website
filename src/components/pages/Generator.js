const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Modal from 'react-bootstrap/lib/Modal'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'
import Chip from 'react-toolbox/lib/chip'
import UploadModal from '../layout/UploadModal'
import TagController from '../controllers/TagController'
import ProgressBar from 'react-toolbox/lib/progress_bar'

import MarginLayout from '../../helpers/MarginLayout'
import TopBar from '../layout/TopBar'

import Recipe from '../../containers/RecipeContainer'
import Nutrition from '../../containers/NutritionContainer'
import Label from './NutritionEstimateJSX'
import {getPossibleUnits, rationalToFloat} from '../../helpers/ConversionUtils'
import {IngredientModel} from '../models/IngredientModel'
import {IngredientControlModel} from '../models/IngredientControlModel'
const Config = require('Config')

export default class Generator extends React.Component {
  constructor() {
    super()
    this.state = {
      labelErrorFlag: false
    }
  }
  transitionToLabelPage(composite, full) {
    ReactGA.event({
      category: 'User',
      action: 'User sharing results',
      nonInteraction: false
    });
    if (this.props.nutrition.key) {
      this.props.sendSerializedData(composite, full)
      const user = Config.DEBUG ? 'test' : 'anonymous'
      this.props.router.push('/?user=' + user + '&label=' + this.props.nutrition.key)
    }
    else {
      this.setState({labelErrorFlag: true})
    }
  }
  //////////////////////////////////////////////////////////////////////////////
  // Action Handlers:
  //////////////////////////////////////////////////////////////////////////////
  handleChipAdd(tag) {
    let {selectedTags, deletedTags} = this.props.tagModel
    const searchTerm = tag
    const {matchResultsModel} = this.props.tagModel
    const searchResult = matchResultsModel.getSearchResultByIndex(searchTerm)
    const description = searchResult.getDescription()
    // TODO: need to disambiguate from Branded results object here
    const stdRefObj = searchResult.getStandardRefDataObj()
    if (stdRefObj === undefined) {
      throw 'Unable to get std ref obj in handle chip add'
    }

    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(description, searchTerm, stdRefObj)
    const measureQuantity = ingredientModel.getMeasureQuantity()
    const measureUnit = ingredientModel.getMeasureUnit()
    this.props.nutritionModelAddIng(
      searchTerm, ingredientModel, measureQuantity, measureUnit)
    let ingredientControlModel =
      new IngredientControlModel(
            measureQuantity,
            getPossibleUnits(measureUnit),
            measureUnit,
            matchResultsModel.getSearchResultDescriptions(searchTerm),
            description)
    this.props.ingredientAddModel(searchTerm, ingredientControlModel)

    // 2. Add the tag to selectedTags and remove it from deleted tags ...
    //
    for (let i = 0; i < deletedTags.length; i++) {
      if (searchTerm === deletedTags[i]) {
        deletedTags.splice(i, 1)
        break
      }
    }
    selectedTags.push(searchTerm)
    this.props.selectedTags(selectedTags)
    this.props.deletedTags(deletedTags)
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User added ingredient',
      nonInteraction: false,
      label: searchTerm
    });
  }
  selectedListItem(aSearchResult, ingredient, index) {
    this.props.nutritionModelRemIng(ingredient)
    this.props.ingredientModelRemTag(ingredient)
    let {replacedTags} = this.props.tagModel
    replacedTags.push(ingredient)
    this.props.replacedTags(replacedTags)
    this.props.addSearchSelection(aSearchResult, index)
  }
  getSearchList() {
    const {tag, matchResultsModel} = this.props.tagModel
    let items = []
    if (matchResultsModel.getNumberOfSearches() > 0) {
      let index = 0
      for (let searchResult of matchResultsModel.getSearchResults(tag)) {
        items.push(<ListGroupItem
                      onClick={this.selectedListItem.bind(this, searchResult, tag, index)}>
                    {searchResult.getDescription()}
                    </ListGroupItem>)
        ++index
      }
    }
    if (items.length) {
      return <ListGroup>{items}</ListGroup>
    }
    else {
      return <ListGroup>No matches found for {tag}!</ListGroup>
    }
  }
  closeModal() {
    this.props.closeSearchModal()
  }
  render() {
    const {nutritionModel} = this.props.nutritionModelRed
    const full = nutritionModel.serialize()
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
    const composite = compositeModel.serialize()
    const {unusedTags, deletedTags, replacedTags, selectedTags} = this.props.tagModel
    const ml = new MarginLayout()
    const shareResultsButton = (
      <Button bsStyle="success"
              onClick={() => this.transitionToLabelPage(composite, full)}>
        Share Results
      </Button>
    )
    const embedButton = (
      <Button bsStyle="success"
              onClick={() => this.setState({flag: 1})}>
        Embed Label
      </Button>
    )
    let close = () => this.closeModal()
    const {firebaseSearch, fdaSearch, showModal, timeout} = this.props.search
    let modalBody = (
        <Modal.Body className="text-center">
          <ProgressBar type='circular' mode='indeterminate' multicolor={true} />
        </Modal.Body>
    )
    if (timeout) {
      modalBody = (
        <Modal.Body className="text-left">
          <Alert bsStyle="warning">
            <h4>Search timed out</h4>
          </Alert>
        </Modal.Body>
      )
    }
    else if (firebaseSearch && fdaSearch) {
      modalBody = (
        <Modal.Body className="text-left">
          {this.getSearchList()}
        </Modal.Body>
      )
    }
    const labelError = (this.state.labelErrorFlag && selectedTags.length === 0) ? (
      <Alert bsStyle="warning">
        <h4>Please add ingredients to your label!</h4>
      </Alert>
    ) : null
    const modal = (
      <div className="modal-container">
        <Modal
          show={showModal}
          onHide={close}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton onClick={close}>
            <Modal.Title id="contained-modal-title">Ingredient Super Search</Modal.Title>
          </Modal.Header>
          {modalBody}
          <Modal.Footer>
            <Button onClick={close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
    const customizeLabel = (
      <DropdownButton bsStyle='success' title='Customize Label' id='dropdwon'>
        <MenuItem eventKey='1' onClick={() => this.props.setLabelType('standard')}>Standard Label</MenuItem>
        <MenuItem eventKey='2' onClick={() => this.props.setLabelType('complete')}>Complete Label</MenuItem>
        <MenuItem eventKey='3' onClick={() => this.props.setLabelType('micronut')}>Micro Nutrition Label</MenuItem>
      </DropdownButton>
    )
    return (
      <div>
        <TopBar step=""
                stepText=""
                aButton={shareResultsButton}
                router={this.props.router}/>
        <Row>
          {ml.marginCol}
          <Col xs={ml.xsCol}
               sm={ml.smCol}
               md={ml.mdCol}
               lg={ml.lgCol}>
            <Row>
              <Col xs={7} sm={7} md={7}>
                <div>
                  {labelError}
                  <Recipe router={this.props.router} route={this.props.route}/>
                  {modal}
                  <Nutrition />
                </div>
              </Col>
              <Col xs={5} sm={5} md={5}>
                <Row>
                  <div>
                    <text>&nbsp;</text>
                    <Label id='nutritionLabel' ingredientComposite={compositeModel} labelType={this.props.label.labelType}/>
                  </div>
                </Row>
                <Row>
                  <div className="text-right">
                    {customizeLabel}
                  </div>
                </Row>
                {/*<Row>
                  <div>
                    <pre>{this.props.nutrition.rawData}</pre>
                  </div>
                </Row>*/}
                {/* temporary hack to align top to adjacent slider */}
                <Row style={{marginTop: 9}}>
                  <TagController
                    tags={deletedTags}
                    tagName={'Discarded Tags:'}
                    deletable={false}
                  />
                </Row>
                <Row>
                  <TagController
                    tags={replacedTags}
                    tagName={'Replaced Tags:'}
                    deletable={false}
                  />
                </Row>
                <Row>
                  <TagController
                    tags={unusedTags}
                    tagName={'Missing Tags:'}
                    deletable={false}
                  />
                </Row>
              </Col>
            </Row>
          </Col>
          {ml.marginCol}
        </Row>
        <Row>
          {ml.marginCol}
          <Col xs={ml.xsCol}
               sm={ml.smCol}
               md={ml.mdCol}
               lg={ml.lgCol}>
          </Col>
          {ml.marginCol}
        </Row>
      </div>
    )
  }
}
