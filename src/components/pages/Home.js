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
      return (
        <Grid>
          <Row className="show-grid">
            <Col xs={2} md={2} />
            <Col xs={8} md={8}>
              <Row style={{marginLeft: 0,
                           marginRight: 0,
                           marginBottom: 10,
                           padding: 5,
                           backgroundColor: 'blanchedalmond',
                           borderStyle: 'solid',
                           borderWidth: 1,
                           borderColor: 'bisque',
                           borderRadius: 5}}>
                <Col xs={12} md={7}>
                  <text><b>Step 1:</b> Select a food image to create a label...</text>
                </Col>
                <Col xs={12} md={3}>
                  <Button className="btn-primary-spacing"
                          bsStyle="success"
                          onClick={this.selectPhoto.bind(this)}>
                    Select Image
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col xs={2} md={2} />
          </Row>
          <Row>
            <Col xs={2} md={2} />
            <Col xs={8} md={8}>
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
            <Col xs={2} md={2} />
          </Row>
        </Grid>
      )
    }
  }
}
