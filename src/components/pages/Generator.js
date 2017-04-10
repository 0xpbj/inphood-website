const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Modal from 'react-bootstrap/lib/Modal'
import Image from 'react-bootstrap/lib/Image'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'
import Chip from 'react-toolbox/lib/chip'
import UploadModal from '../layout/UploadModal'
import TagController from '../controllers/TagController'
import * as constants from '../../constants/Constants'
import CopyToClipboard from 'react-copy-to-clipboard'
import browser from 'detect-browser'
import {Link} from 'react-router'

import MarginLayout from '../../helpers/MarginLayout'
import {getTextLabel} from '../../helpers/TextLabel'
import Footer from '../../containers/FooterContainer'
import TopBar from '../../containers/TopBarContainer'
import Results from '../../containers/ResultsContainer'

import Recipe from '../../containers/RecipeContainer'
import Nutrition from '../../containers/NutritionContainer'
import Label from './NutritionEstimateJSX'
import {getPossibleUnits, rationalToFloat} from '../../helpers/ConversionUtils'
import {IngredientModel} from '../models/IngredientModel'
import {IngredientControlModel} from '../models/IngredientControlModel'

const Config = require('Config')
// import ClientJS from 'clientjs'
import 'clientjs'

// import {Button} from 'react-toolbox/lib/button'
// import Tooltip from 'react-toolbox/lib/tooltip'
// const TooltipButton = Tooltip(Button)


export default class Generator extends React.Component {
  constructor() {
    super()
    this.state = {
      showBrowserWarning: true,
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
    const Client = new ClientJS()
    const fingerprint = Client.getFingerprint()
    const {label, developer} = this.props.location.query
    if (label && label !== '') {
      this.props.getLabelId(label)
    }
    if (!developer) {
      ReactGA.initialize('UA-88850545-2', {
        debug: Config.DEBUG,
        titleCase: false,
        gaOptions: {
          userId: fingerprint
        }
      })
    }
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
  shareLabelButton(fullPage) {
    if (fullPage) {
      return (
        <Dropdown id='shareDropdown'>
          <Dropdown.Toggle bsStyle='success'>
            <Glyphicon glyph="share-alt" />&nbsp;&nbsp;Share Label
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
    else
      return null
  }
  customLabelFlow(textLabel, labelType) {
    this.setState({textLabel})
    this.props.setLabelType(labelType)
    this.props.serializeToFirebase()
  }
  customLabelButton(fullPage) {
    if (fullPage) {
      return (
        <Dropdown id='customLabelDropdown'>
          <Dropdown.Toggle bsStyle='warning'>
            <Glyphicon glyph="wrench" />&nbsp;&nbsp;Custom Label
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <MenuItem
              eventKey='1'
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.standard)}>
              Standard Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-grain"></Glyphicon>
            </MenuItem>
            <MenuItem
              eventKey='2'
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.complete)}>
              Complete Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-tree-deciduous"></Glyphicon>
            </MenuItem>
            <MenuItem
              eventKey='3'
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.micronut)}>
              Micronutrient Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-stats"></Glyphicon>
            </MenuItem>
            {/*<MenuItem
              eventKey='4'
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.sugarmic)}>
              Sugar + Micro Label
            </MenuItem>*/}
            <MenuItem
              eventKey='5'
              onClick={() => this.customLabelFlow(true, IngredientModel.labelTypes.text)}>
              Text Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-text-color"></Glyphicon>
            </MenuItem>
            {/*<MenuItem
              eventKey='6'
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.personal)}>
              Personal Label
            </MenuItem>*/}
          </Dropdown.Menu>
        </Dropdown>
      )
    }
    else
      return null
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
      <Row>
        <pre id='nutrition-label' style={{background: 'white'}}>{getTextLabel(compositeModel)}</pre>
        <a href="http://www.inphood.com"
           className="text-center"
           style={{backgroundColor: 'white'}}>
          <h6 style={{marginBottom: 0}}>Estimated at {this.getInPhoodLogo()}</h6>
        </a>
      </Row>
    )
  }
  render() {
    const {label} = this.props.location.query
    if (label && label !== '') {
      return <Results label={label} router={this.props.router}/>
    } else {
      const {showHelp, showBrowserWarning} = this.state
      let browserWarning = null
      if (showBrowserWarning) {
        if (browser.name === "chrome")
          browserWarning = null
        else
          browserWarning = (
            <Alert bsStyle="warning" onDismiss={() => this.setState({showBrowserWarning: false})}>
              <h4 className="text-center">inPhood works best with Chrome</h4>
            </Alert>
          )
      }
      const {nutritionModel} = this.props.nutritionModelRed
      const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
      const {unusedTags, matchResultsModel}
        = this.props.tagModel
      const ml = new MarginLayout()
      const labelError = (this.state.labelErrorFlag) ? (
        <Alert bsStyle="warning">
          <h4>Please add ingredients to your label!</h4>
        </Alert>
      ) : null
      const {shareUrl, embedUrl} = this.props.results
      const {embed, showShareUrl, copiedUrl, textLabel} = this.state
      const url = (embed) ? embedUrl : shareUrl
      const shareUrlBox = (url && showShareUrl) ? (
        <Row style={{marginBottom:0, marginTop:constants.VERT_SPACE}}>
          <Col xs={11}>
            <pre>{url}</pre>
          </Col>
          <Col xs={1}>
            <CopyToClipboard text={url}
              onCopy={() => this.setState({copiedUrl: true})}>
              <Button><Glyphicon glyph="glyphicon glyphicon-copy"></Glyphicon></Button>
            </CopyToClipboard>
            {copiedUrl ? <div><span style={{color: 'red'}}>&nbsp;Copied.</span></div> : null}
          </Col>
        </Row>
      ) : null
      const label = (textLabel) ? this.generateTextLabel(compositeModel)
      : (
          <Label id='nutrition-label' ingredientComposite={compositeModel}/>
      )
      // TODO: if screen size <= xs, make the backgroundSize = cover (mobile first)
      const numSearches = matchResultsModel.getNumberOfSearches()
      const heightInVH = (numSearches < 4) ?
        150 :
        150 + 20 * (numSearches-3)
      const height = heightInVH.toString() + 'vh'
      const home = require('../../images/homeHD.jpg')
      const sectionStyle = {
        backgroundImage:`url(${home})`,
        backgroundRepeat:'no-repeat',
        backgroundSize:'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        width:'100vw',
        height:{height}
      }

      const fullPage = numSearches > 0
      const backgroundStyle = (fullPage) ?
        {backgroundColor:'rgba(255,255,255,0.85)',width:'100vw',height:{height}} :
        {backgroundColor:'rgba(255,255,255,0)',width:'100vw',height:{height}}

      const nutrition = (fullPage) ? <Nutrition /> : null
      return (
        <div style={sectionStyle}>
          <div style={backgroundStyle}>
            <TopBar router={this.props.router} transparent={fullPage} />
            <Row>
              <Row style={{height:'40vh'}}>
                {ml.marginCol}
                <Col xs={ml.xsCol}
                     sm={ml.smCol}
                     md={ml.mdCol}
                     lg={ml.lgCol}>
                  <Row>
                    {browserWarning}
                    <Col xs={12} sm={6} md={7} lg={7}>
                      <div>
                        {labelError}
                        <Recipe router={this.props.router} route={this.props.route} nutritionModelRed={this.props.nutritionModelRed}/>
                        {nutrition}
                      </div>
                    </Col>
                    <Col xs={12} sm={6} md={5} lg={5}>
                      <Row style={{marginTop:25}}>
                        <div style={{width:constants.LABEL_WIDTH, margin:'auto'}}>
                          <Col xs={6} className='text-left' style={{paddingLeft: 2}}>
                            {this.customLabelButton(fullPage)}
                          </Col>
                          <Col xs={6} className='text-right' style={{paddingRight: 2}}>
                            {this.shareLabelButton(fullPage)}
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
                      <Row style={{marginTop:(constants.VERT_SPACE-2)}}>
                        <div style={{width:constants.LABEL_WIDTH, margin:'auto'}}>
                          <Well style={{background: 'white'}}>
                            Values above are rounded according to FDA
                            guidelines, which differ significantly from mathematical
                            rounding. Read more here:
                            <Link to="https://www.fda.gov/Food/GuidanceRegulation/GuidanceDocumentsRegulatoryInformation/LabelingNutrition/ucm064932.htm" target="_blank"> Labeling Nutrition</Link>
                          </Well>
                        </div>
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
              <Row style={{height:'32vh'}}/>
              <Footer fullPage={fullPage} router={this.props.router}/>
              <Row style={{height:'50vh'}}/>
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
        </div>
      )
    }
  }
}
