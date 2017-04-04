const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Modal from 'react-bootstrap/lib/Modal'
import Image from 'react-bootstrap/lib/Image'
import Popover from 'react-bootstrap/lib/Popover'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'
import Chip from 'react-toolbox/lib/chip'
import UploadModal from '../layout/UploadModal'
import TagController from '../controllers/TagController'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import * as constants from '../../constants/Constants'
import CopyToClipboard from 'react-copy-to-clipboard'

import MarginLayout from '../../helpers/MarginLayout'
import {getTextLabel} from '../../helpers/TextLabel'
import Footer from '../../containers/FooterContainer'
import TopBar from '../../containers/TopBarContainer'

import Recipe from '../../containers/RecipeContainer'
import Nutrition from '../../containers/NutritionContainer'
import Label from './NutritionEstimateJSX'
import {getPossibleUnits, rationalToFloat} from '../../helpers/ConversionUtils'
import {IngredientModel} from '../models/IngredientModel'
import {IngredientControlModel} from '../models/IngredientControlModel'
const Config = require('Config')

import {Button} from 'react-toolbox/lib/button'
import Tooltip from 'react-toolbox/lib/tooltip'
const TooltipButton = Tooltip(Button)


export default class Generator extends React.Component {
  constructor() {
    super()
    this.state = {
      labelErrorFlag: false,
      showShareUrl: false,
      textLabel: false,
      copiedUrl: false,
      embed: false
    }
  }
  componentWillMount() {
    this.props.modelReset()
    this.props.clearData()
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.labelErrorFlag) {
      this.setState({labelErrorFlag: false})
    }
    if (this.props.nutritionModelRed !== nextProps.nutritionModelRed) {
      this.setState({copiedUrl: false, showShareUrl: false})
    }
  }
  shareLabel(flag) {
    const {unusedTags, matchResultsModel} = this.props.tagModel
    const usefulIngredients = matchResultsModel.getNumberOfSearches() - unusedTags.length
    if (this.props.nutrition.key && usefulIngredients) {
      this.props.saveLabelToAws()
      ReactGA.event({
        category: 'Results',
        action: 'User sharing results',
        nonInteraction: false
      });
      this.setState({embed: flag, showShareUrl: true})
    }
    else {
      this.setState({labelErrorFlag: true, showShareUrl: false, copiedUrl: false})
    }
  }
  shareLabelButton() {
    return (
      <Dropdown id='shareDropdown'>
        <Dropdown.Toggle bsStyle='success'>
          <Glyphicon glyph="share-alt" />&nbsp;&nbsp;SHARE LABEL
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <MenuItem
            eventKey='1'
            onClick={() => this.shareLabel(true)}>
            Embed Link&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-edit"></Glyphicon>
          </MenuItem>
          <MenuItem
            eventKey='2'
            onClick={() => this.shareLabel(false)}>
            Share Link&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-share"></Glyphicon>
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    )
  }
  // shareLabelButton() {
  //   return (
  //     <TooltipButton
  //       tooltip='Click to share your label'
  //       tooltipPosition='right'
  //       tooltipDelay={500}
  //       icon='share'
  //       label='Share Label'
  //       style={{color: 'white', backgroundColor: 'forestgreen'}}
  //       onClick={() => this.shareLabel()}
  //     />
  //   )
  // }
  customLabelButton() {
    return (
      <Dropdown id='customLabelDropdown'>
        <Dropdown.Toggle bsStyle='warning'>
          <Glyphicon glyph="wrench" />&nbsp;&nbsp;CUSTOM LABEL
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <MenuItem
            eventKey='1'
            onClick={() => {
              this.setState({textLabel: false})
              this.props.setLabelType(IngredientModel.labelTypes.standard)}}>
            Standard Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-grain"></Glyphicon>
          </MenuItem>
          <MenuItem
            eventKey='2'
            onClick={() => {
              this.setState({textLabel: false})
              this.props.setLabelType(IngredientModel.labelTypes.complete)}}>
            Complete Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-tree-deciduous"></Glyphicon>
          </MenuItem>
          <MenuItem
            eventKey='3'
            onClick={() => {
              this.setState({textLabel: false})
              this.props.setLabelType(IngredientModel.labelTypes.micronut)}}>
            Micronutrient Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-stats"></Glyphicon>
          </MenuItem>
          {/*<MenuItem
            eventKey='4'
            onClick={() => {
              this.setState({textLabel: false})
              this.props.setLabelType(IngredientModel.labelTypes.sugarmic)}}>
            Sugar + Micro Label
          </MenuItem>*/}
          <MenuItem
            eventKey='5'
            onClick={() => {
              this.setState({textLabel: true})
              this.props.setLabelType(IngredientModel.labelTypes.text)}}>
            Text Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-text-color"></Glyphicon>
          </MenuItem>
          {/*<MenuItem
            eventKey='6'
            onClick={() => {
              this.setState({textLabel: false})
              this.props.setLabelType(IngredientModel.labelTypes.personal)}}>
            Personal Label
          </MenuItem>*/}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
  getInPhoodLogo() {
    return(
      <span>
        <span style={{color:'black'}}>i</span>
        <span style={{color:'green'}}>n</span>
        <span style={{color:'blue'}}>P</span>
        <span style={{color:'red'}}>h</span>
        <span style={{color:'green'}}>o</span>
        <span style={{color:'blue'}}>o</span>
        <span style={{color:'red'}}>d</span>
        .com
      </span>
    )
  }
  generateTextLabel(compositeModel) {
    ReactGA.event({
      category: 'Label',
      action: 'User viewing text label',
      nonInteraction: false
    });
    return (
      <div>
        <pre id='nutrition-label'>{getTextLabel(compositeModel)}</pre>
        <a href="http://www.inphood.com"
           className="text-center"
           style={{backgroundColor: 'white'}}>
          <h6 style={{marginBottom: 0}}>Estimated at {this.getInPhoodLogo()}</h6>
        </a>
      </div>
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
    const labelError = (this.state.labelErrorFlag) ? (
      <Alert bsStyle="warning">
        <h4>Please add ingredients to your label!</h4>
      </Alert>
    ) : null
    const user = Config.DEBUG ? 'test' : 'anonymous'
    const {shareUrl, embedUrl} = this.props.results
    const {embed, showShareUrl, copiedUrl, textLabel} = this.state
    const url = (embed) ? embedUrl : shareUrl
    const shareUrlBox = (url && showShareUrl) ? (
      <div>
        <Col xs={11}>
          <pre style={{marginBottom:0, marginTop:constants.VERT_SPACE}}>{url}</pre>
        </Col>
        <Col xs={1} style={{padding: 0, marginRight: -12, marginLeft: -12}}>
          <CopyToClipboard text={url}
            onCopy={() => this.setState({copiedUrl: true})}>
            <Button className="btn-primary-spacing" bsStyle="success" style={{marginBottom:0, marginTop:constants.VERT_SPACE}}>
              <Glyphicon glyph="glyphicon glyphicon-copy"></Glyphicon>
            </Button>
          </CopyToClipboard>
          {copiedUrl ? <div><span style={{color: 'red'}}>&nbsp;Copied.</span></div> : null}
        </Col>
      </div>
    ) : null
    const popoverHoverFocus = (
      <Popover id="popover-trigger-hover-focus" title="Rounding Information">
        <strong>Nutrition values estimated based on USDA standards</strong>.
      </Popover>
    );
    const label = (textLabel) ? this.generateTextLabel(compositeModel)
    : (
        <Label id='nutrition-label' ingredientComposite={compositeModel}/>
    )
    return (
      <div>
        <TopBar router={this.props.router}/>
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
                  <Recipe router={this.props.router} route={this.props.route} nutritionModelRed={this.props.nutritionModelRed}/>
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
                  <OverlayTrigger placement="bottom" overlay={popoverHoverFocus} trigger={['hover', 'focus', 'click']}>
                    <Col xs={12}>
                      {label}
                    </Col>
                  </OverlayTrigger>
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
