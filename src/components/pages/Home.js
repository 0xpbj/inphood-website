var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Jumbotron from 'react-bootstrap/lib/Jumbotron'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import ImageGallery from 'react-image-gallery'
import "react-image-gallery/styles/css/image-gallery.css"
const Config = require('Config')

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {}
  }
  componentWillMount() {
    if (this.props.user.anonymous)
      this.props.anClearData()
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.anonymous !== nextProps.user.anonymous)
      this.setState({anonymous: nextProps.user.anonymous})
  }
  handleClick() {
    this.props.igLoginRequest()
    ReactGA.event({
      category: 'User',
      action: 'Instagram Login',
      label: 'Social Flow',
      nonInteraction: false
    });
  }
  selectPhoto() {
    const index = this._imageGallery.getCurrentIndex()
    const photo =  this.props.user.photos.data[index]
    this.props.cleanReducers()
    this.props.igSelectedPhoto(index, photo)
    ReactGA.event({
      category: 'User',
      action: 'Image selected for nutrition information',
      nonInteraction: false,
      label: 'Social Flow'
    });
    this.props.router.push('image')
  }
  render() {
    if (!this.props.user.login) {
      const inPhoodLogo = require('../../images/logoLarge.jpg')
      var sectionStyle = {
        width: '100%',
        height: '400px',
        backgroundImage: `url(${inPhoodLogo})`
      }
      return (
        <div>
          <Grid>
            <Jumbotron>
              <h1 className="text-center">What's really in your food?</h1>
              <h3 className="text-center">Make nutrition labels in three easy steps!</h3>
              <p className="text-right"><Button bsStyle="primary">Learn more</Button></p>
            </Jumbotron>
            {/*<section style={ sectionStyle }></section>*/}
            <Row>
              <div className="text-center">
                <Button onClick={this.handleClick.bind(this)}>Sign in with Instagram</Button>
              </div>
            </Row>
          </Grid>
        </div>
      )
    }
    else if (this.props.user.error !== '') {
      return (
        <Alert bsStyle="danger">
          <strong>Error: {this.props.user.error}</strong>
        </Alert>
      )
    }
    else if (this.props.user.photos.length === 0 || this.props.user.photos.data.length === 0) {
      return (
        <Alert bsStyle="info">
          <strong>Photos loading...</strong>
        </Alert>
      )
    }
    else {
      ReactGA.set({ userId: this.props.user.profile.name })
      ReactGA.event({
        category: 'User',
        action: 'Go to gallery page',
        nonInteraction: false
      });
      var images = []
      for (let img of this.props.user.photos.data) {
        let image = {
          original: img.picture,
          thumbnail: img.thumbnail,
        }
        images.push(image)
      }

      // The array represents # of columns for xs sm md lg xl:
      const xsOffset = 0
      const smOffset = 1
      const mdOffset = 2
      const lgOffset = 3
      const margins = [1, 1, 2, 3]
      let centers = []
      for (let margin of margins) {
        let center = 12 - (2*margin)
        centers.push(center)
      }
      const marginCol = (<Col xs={margins[xsOffset]}
                              sm={margins[smOffset]}
                              md={margins[mdOffset]}
                              lg={margins[lgOffset]}/>)

      return (
        <div>
          {/* Top Bar: */}
          <Row style={{marginLeft: 0,
                       marginRight: 0,
                       marginBottom: 10,
                       padding: 5,
                       borderBottomStyle: 'solid',
                       borderWidth: 1,
                       borderColor: 'black'}}>
            {marginCol}
            <Col xs={centers[xsOffset]}
                 sm={centers[smOffset]}
                 md={centers[mdOffset]}
                 lg={centers[lgOffset]}>
              <Row>
                <Col xs={12} sm={2} style={{paddingLeft: 0, paddingRight: 0}}>
                  <img src={require('../../images/logoSmall.png')} width="147" height="35"/>
                </Col>
                {/* Hack: rather than use flex or other things that cause the display to
                  not respond well to massive size changes, we use this marginTop setting
                  to align the text to the bottom with the other elements */}
                <Col xs={12} sm={8} className="text-center" style={{marginTop: 35-20}}>
                  <text><h4 style={{margin: 0}}><b>Step 1:</b> Select a food image...</h4></text>
                </Col>
                <Col xs={12} sm={2} className="text-right" style={{paddingLeft: 0, paddingRight: 0, marginTop: 1}}>
                  <Button className="btn-primary-spacing"
                          bsStyle="success"
                          onClick={this.selectPhoto.bind(this)}>
                    Select Image
                  </Button>
                </Col>
              </Row>
            </Col>
            {marginCol}
          </Row>

          <Row>
            {marginCol}
            <Col xs={centers[xsOffset]}
                 sm={centers[smOffset]}
                 md={centers[mdOffset]}
                 lg={centers[lgOffset]}>
              <ImageGallery
                className="center-block"
                ref={i => this._imageGallery = i}
                items={images}
                slideInterval={2000}
                showFullscreenButton={false}
                showNav={true}
                showPlayButton={false}
              />
            </Col>
            {marginCol}
          </Row>
        </div>
      )
    }
  }
}
