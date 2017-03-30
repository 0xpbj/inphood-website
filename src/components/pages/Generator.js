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
      labelErrorFlag: false,
      showShareUrl: false
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
  shareLabel(share) {
    // this.props.saveToCloud()
    const {unusedTags, matchResultsModel} = this.props.tagModel
    const usefulIngredients = matchResultsModel.getNumberOfSearches() - unusedTags.length
    if (this.props.nutrition.key && usefulIngredients) {
      const {nutritionModel} = this.props.nutritionModelRed
      const full = nutritionModel.serialize()
      const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
      const composite = compositeModel.serialize()
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
          onClick={() => this.props.setLabelType(IngredientModel.labelTypes.standard)}>
          Standard Label
        </MenuItem>
        <MenuItem
          eventKey='2'
          onClick={() => this.props.setLabelType(IngredientModel.labelTypes.complete)}>
          Complete Label
        </MenuItem>
        <MenuItem
          eventKey='3'
          onClick={() => this.props.setLabelType(IngredientModel.labelTypes.micronut)}>
          Micro Nutrient Label
        </MenuItem>
        <MenuItem
          eventKey='4'
          onClick={() => this.props.setLabelType(IngredientModel.labelTypes.sugarmicro)}>
          Sugar + Micro Label
        </MenuItem>
        <MenuItem
          eventKey='5'
          onClick={() => this.props.setLabelType(IngredientModel.labelTypes.text)}>
          Text Label
        </MenuItem>
        <MenuItem
          eventKey='6'
          onClick={() => this.props.setLabelType(IngredientModel.labelTypes.text)}>
          Personal Label
        </MenuItem>
      </DropdownButton>
    )
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
        <text>&nbsp;</text>
        <pre>{shareUrl}</pre>
      </div>
    ) : null
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
              <Col xs={12} sm={7} md={8} lg={8}>
                <div>
                  {labelError}
                  <Recipe router={this.props.router} route={this.props.route}/>
                  <Nutrition />
                </div>
              </Col>
              <Col xs={12} sm={5} md={4} lg={4}>
                <Row>
                  <Col xs={6} sm={2} md={2} lg={2}>
                    {this.customLabelButton()}
                  </Col>
                  <Col xs={0} sm={5} md={5} lg={6}/>
                  <Col xs={6} sm={2} md={2} lg={2}>
                   {this.shareLabelButton()}
                  </Col>
                </Row>
                <Row>
                  <Row>
                    <Col xs={0} sm={0} md={1} lg={1}/>
                    <Col xs={12} sm={12} md={10} lg={10}>
                      {shareUrlBox}
                    </Col>
                    <Col xs={0} sm={0} md={1} lg={1}/>
                  </Row>
                  <text>&nbsp;</text>
                  <Label id='nutritionLabel'
                         ingredientComposite={compositeModel}/>
                  <text>&nbsp;</text>
                </Row>
                {/* temporary hack to align top to adjacent slider */}
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
