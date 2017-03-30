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
import domtoimage from 'dom-to-image'
import * as constants from '../../constants/Constants'

import MarginLayout from '../../helpers/MarginLayout'
import {getTextLabel} from '../../helpers/TextLabel'
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
      labelErrorFlag: false,
      showShareUrl: false,
      textLabel: false
    }
  }
  componentWillMount() {
    this.props.modelReset()
    this.props.clearData()
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.labelErrorFlag)
      this.setState({labelErrorFlag: false})
  }
  getRecipeText(aNutritionModel) {
    let recipeText = ''

    const nmTags = aNutritionModel.getTags()
    for (let index in nmTags) {
      const tag = nmTags[index]
      const scaledIngredient = aNutritionModel.getScaledIngredient(tag)
      recipeText = recipeText +
                   scaledIngredient.getQuantity().toFixed(2) + " " +
                   scaledIngredient.getUnit() + " " +
                   scaledIngredient.getIngredientModel().getKey() +
                   "\n"
    }
    return recipeText
  }
  shareLabel(share) {
    // this.props.saveToCloud()
    const {unusedTags, matchResultsModel} = this.props.tagModel
    const usefulIngredients = matchResultsModel.getNumberOfSearches() - unusedTags.length
    if (this.props.nutrition.key && usefulIngredients) {
      const {nutritionModel} = this.props.nutritionModelRed
      const full = nutritionModel.serialize()
      const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
      const composite = compositeModel.serialize()
      let recipeText = this.getRecipeText(nutritionModel)
      if (recipeText !== '') {
        const user = Config.DEBUG ? 'test' : 'anonymous'
        const label = this.props.nutrition.key
        this.props.sendUserGeneratedData(recipeText, label, user)
      }
      this.props.sendSerializedData(composite, full)
      if (share) {
        ReactGA.event({
          category: 'Share',
          action: 'User sharing results',
          nonInteraction: false
        });
        this.setState({showShareUrl: true})
      }
      else {
        ReactGA.event({
          category: 'Save',
          action: 'User saving label',
          nonInteraction: false
        });
        domtoimage.toPng(document.getElementById('nutrition-label'), { quality: 1.0 })
        .then(function (dataUrl) {
          var link = document.createElement('a');
          link.download = 'nutrition-label.png';
          link.href = dataUrl;
          link.click();
        });
        this.setState({showShareUrl: false})
      }
    }
    else {
      this.setState({labelErrorFlag: true})
    }
  }
  shareLabelButton() {
    return (
      <DropdownButton bsStyle='success' title='Share Label' id='dropdwon'>
        <MenuItem
          eventKey='1'
          onClick={() => this.shareLabel(false)}>
          Save Label
        </MenuItem>
        <MenuItem
          eventKey='2'
          onClick={() => this.shareLabel(true)}>
          Share URL
        </MenuItem>
      </DropdownButton>
    )
  }
  customLabelButton() {
    return (
      <DropdownButton bsStyle='warning' title='Customize Label' id='dropdwon'>
        <MenuItem
          eventKey='1'
          onClick={() => {
            this.setState({textLabel: false})
            this.props.setLabelType(IngredientModel.labelTypes.standard)}}>
          Standard Label
        </MenuItem>
        <MenuItem
          eventKey='2'
          onClick={() => {
            this.setState({textLabel: false})
            this.props.setLabelType(IngredientModel.labelTypes.complete)}}>
          Complete Label
        </MenuItem>
        <MenuItem
          eventKey='3'
          onClick={() => {
            this.setState({textLabel: false})
            this.props.setLabelType(IngredientModel.labelTypes.micronut)}}>
          Micro Nutrient Label
        </MenuItem>
        <MenuItem
          eventKey='4'
          onClick={() => {
            this.setState({textLabel: false})
            this.props.setLabelType(IngredientModel.labelTypes.sugarmic)}}>
          Sugar + Micro Label
        </MenuItem>
        <MenuItem
          eventKey='5'
          onClick={() => {
            this.setState({textLabel: true})
            this.props.setLabelType(IngredientModel.labelTypes.text)}}>
          Text Label
        </MenuItem>
        <MenuItem
          eventKey='6'
          onClick={() => {
            this.setState({textLabel: false})
            this.props.setLabelType(IngredientModel.labelTypes.personal)}}>
          Personal Label
        </MenuItem>
      </DropdownButton>
    )
  }
  generateTextLabel(compositeModel) {
    return <pre id='nutritionLabel'>{getTextLabel(compositeModel)}</pre>
  }
  render() {
    const {nutritionModel} = this.props.nutritionModelRed
    const full = nutritionModel.serialize()
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
    const composite = compositeModel.serialize()
    const {unusedTags, matchResultsModel}
      = this.props.tagModel
    const ml = new MarginLayout()
    const shareResultsButton = (
      <Button bsStyle="success"
              onClick={() => this.transitionToLabelPage(composite, full)}>
        Share Results&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-send"></Glyphicon>
      </Button>
    )
    const labelError = (this.state.labelErrorFlag) ? (
      <Alert bsStyle="warning">
        <h4>Please add ingredients to your label!</h4>
      </Alert>
    ) : null
    const user = Config.DEBUG ? 'test' : 'anonymous'
    const shareUrl = 'https://www.inphood.com/?user=' + user + '&label=' + this.props.nutrition.key
    const shareUrlBox = (this.state.showShareUrl) ? (
      <div>
        <pre style={{marginBottom:0, marginTop:constants.VERT_SPACE}}>{shareUrl}</pre>
      </div>
    ) : null
    const label = (this.state.textLabel) ? this.generateTextLabel(compositeModel)
    : (
      <Label id='nutritionLabel' ingredientComposite={compositeModel}/>
    )
    return (
      <div>
        <TopBar step=""
                stepText=""
                aButton={null}
                router={this.props.router}/>
        <Row>
          {ml.marginCol}
          <Col xs={ml.xsCol}
               sm={ml.smCol}
               md={ml.mdCol}
               lg={ml.lgCol}>
            <Row>
              <Col xs={12} sm={6} md={7} lg={7}>
                <div>
                  {labelError}
                  <Recipe router={this.props.router} route={this.props.route}/>
                  <Nutrition />
                </div>
              </Col>
              <Col xs={12} sm={6} md={5} lg={5}>
                <Row style={{marginTop:25}}>
                  <div style={{width:constants.LABEL_WIDTH, margin:'auto'}}>
                    <Col xs={6} className='text-left' style={{paddingLeft: 2}}>
                      {this.customLabelButton()}
                    </Col>
                    <Col xs={6} className='text-right' style={{paddingRight: 2}}>
                      {this.shareLabelButton()}
                    </Col>
                  </div>
                </Row>
                <Row>
                  <div style={{width:constants.LABEL_WIDTH, margin:'auto'}}>
                    <Col xs={12} style={{paddingLeft:2, paddingRight:2}}>
                      {shareUrlBox}
                    </Col>
                  </div>
                </Row>
                <Row style={{marginTop:(constants.VERT_SPACE-2)}}>
                  <Col xs={12}>
                    {label}
                  </Col>
                </Row>
                <Row style={{marginTop: 9}}>
                  <TagController
                    tags={unusedTags}
                    tagName={'Unfound Ingredients:'}
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
