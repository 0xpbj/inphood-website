const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Jumbotron from 'react-bootstrap/lib/Jumbotron'
import UploadModal from '../layout/UploadModal'
import MarginLayout from '../../helpers/MarginLayout'
import Generator from '../../containers/GeneratorContainer'
import Results from '../../containers/ResultsContainer'
import Footer from '../../containers/FooterContainer'
import TopBar from '../../containers/TopBarContainer'
const Config = require('Config')
import browser from 'detect-browser'
import { InteractiveForceGraph, ForceGraphNode, ForceGraphLink } from 'react-vis-force'
import { interpolateRainbow } from 'd3-scale'
import exampleJSON from './example.json'
import Tooltip from 'react-toolbox/lib/tooltip'
import {Button} from 'react-toolbox/lib/button'
const TooltipButton = Tooltip(Button)

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      showHelp: false,
      showBrowserWarning: true
    }
  }
  componentWillMount() {
    const {label, user, developer} = this.props.location.query
    if (label && label !== '') {
      const hUser = user ? user : Config.DEBUG ? 'test' : 'anonymous'
      this.props.getLabelId(hUser, label)
    }
    if (!developer) {
      ReactGA.initialize('UA-88850545-2', {
        debug: Config.DEBUG,
        titleCase: false,
        gaOptions: {
          userId: 'websiteUser'
        }
      })
    }
  }
  transitionToGenerator() {
    this.props.router.push('nutrition')
  }
  showHelp() {
    ReactGA.event({
      category: 'User',
      action: 'User interacted with learn more dialogue',
      nonInteraction: false
    })
    this.setState({showHelp: true})
  }
  render() {
    const {label, user} = this.props.location.query
    if (label && label !== '') {
      return <Results label={label} user={user} router={this.props.router}/>
    }
    else {
      const {showHelp, showBrowserWarning} = this.state
      let browserWarning = null
      if (showBrowserWarning) {
        if (browser.name === "chrome" || browser.name === "firefox")
          browserWarning = null
        else
          browserWarning = (
            <Alert bsStyle="warning" onDismiss={() => this.setState({showBrowserWarning: false})}>
              <h4>inPhood works best with Chrome or Firebox</h4>
            </Alert>
          )
      }
      // TODO: if screen size <= xs, make the backgroundSize = cover (mobile first)
      const home = require('../../images/homeHD.jpg')
      const sectionStyle = {
        backgroundImage:`url(${home})`,
        backgroundRepeat:'no-repeat',
        backgroundSize:'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        width:'100vw',
        height:'100vh'
      };
      return (
        <Grid style={sectionStyle}>
          <Row>
            <Col>
                <TopBar router={this.props.router}/>
                <Row style={{height:'40vh'}}>
                  {browserWarning}
                </Row>
                <Row>
                  <Col xs={0} sm={3} md={4} lg={4.25}/>
                  <Col xs={12} sm={6} md={4} lg={3.5}
                       className="text-center"
                       style={{borderWidth:0,
                               borderColor:'gray',
                               borderStyle:'solid',
                               borderRadius:15,
                               backgroundColor:'rgba(0,0,0,0.25)',
                               padding: 30}}>
                    <TooltipButton
                      tooltip="It's Free!"
                      tooltipPosition='top'
                      tooltipDelay={500}
                      icon='input'
                      label='&nbsp;&nbsp;Create Nutrition Label&nbsp;'
                      raised
                      style={{color: 'white', backgroundColor: '#0088CC', fontSize: 18}}
                      onClick={() => this.transitionToGenerator()}
                    />
                  </Col>
                  <Col xs={0} sm={3} md={4} lg={4.25}/>
                </Row>
                <Row style={{height:'43vh'}}/>
                <Footer router={this.props.router}/>
            </Col>
          </Row>
        </Grid>
      )
    }
  }
}
