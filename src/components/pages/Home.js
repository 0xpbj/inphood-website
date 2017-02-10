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
import UploadModal from '../layout/UploadModal'
import ImageGallery from 'react-image-gallery'
import "react-image-gallery/styles/css/image-gallery.css"
const Config = require('Config')

import MarginLayout from '../../helpers/MarginLayout'
import TopBar from '../layout/TopBar'

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      showUploadModal: false
    }
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
    })
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
    })
    this.props.router.push('image')
  }
  onDrop(acceptedFiles, rejectedFiles) {
    ReactGA.event({
      category: 'User',
      action: 'Image upload flow initiated',
      label: 'Local Image Flow',
      nonInteraction: false
    })
    if (acceptedFiles.length > 0) {
      this.props.anSelectedPhoto(acceptedFiles[0].preview)
      this.props.router.push('image')
    }
  }
  render() {
    if (!this.props.user.login) {
      let hideUploadModal = () => this.setState({ showUploadModal: false })
      return (
        <div>
          <Grid>
            <Jumbotron>
              <h1 className="text-center">What's really in your food?</h1>
              <h3 className="text-center">Make nutrition labels in three easy steps!</h3>
              <p className="text-right"><Button bsStyle="primary">Learn more</Button></p>
            </Jumbotron>
            <Row>
              <div className="text-center">
                {/*<Button onClick={this.handleClick.bind(this)}>Sign in with Instagram</Button>*/}
                  <Button bsStyle="default" onClick={()=>this.setState({ showUploadModal: true })}>
                    Upload Photo&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-open"></Glyphicon>
                  </Button>
                  <UploadModal
                    onDrop={(acceptedFiles, rejectedFiles) => this.onDrop.bind(this)}
                    show={this.state.showUploadModal}
                    onHide={hideUploadModal}
                  />
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
      })
      var images = []
      for (let img of this.props.user.photos.data) {
        let image = {
          original: img.picture,
          thumbnail: img.thumbnail,
        }
        images.push(image)
      }
      const ml = new MarginLayout()
      const selectImgButton = (
        <Button className="btn-primary-spacing"
                bsStyle="success"
                onClick={this.selectPhoto.bind(this)}>
          Select Image
        </Button>
      )
      return (
        <div>
          <TopBar step="1"
                  stepText="Select a food image ..."
                  aButton={selectImgButton}/>
          <Row>
            {ml.marginCol}
            <Col xs={ml.xsCol}
                 sm={ml.smCol}
                 md={ml.mdCol}
                 lg={ml.lgCol}>
              {/*<Row>
                <Col xs={2} sm={2} md={2} lg={2}/>
                <Col xs={8} sm={8} md={8} lg={8}>*/}
                  <ImageGallery
                    className="center-block"
                    ref={i => this._imageGallery = i}
                    items={images}
                    slideInterval={2000}
                    showFullscreenButton={false}
                    showNav={true}
                    showPlayButton={false}/>
                {/*</Col>
                <Col xs={2} sm={2} md={2} lg={2}/>
              </Row>*/}
            </Col>
            {ml.marginCol}
          </Row>
        </div>
      )
    }
  }
}
