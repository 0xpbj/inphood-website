var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Jumbotron from 'react-bootstrap/lib/Jumbotron'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import ImageGallery from 'react-image-gallery'
import {Redirect} from 'react-router'
import {parseRecipe} from '../../helpers/parseRecipe'
import Hello from 'hellojs'
import UploadModal from '../layout/UploadModal'

const Config = require('Config')

import "react-image-gallery/styles/css/image-gallery.css"

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      url: '',
      showUploadModal: false,
      anonymous: false
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
    });
  }
  handleUrl() {
    if (this.getValidationState() === 'success') {
      this.props.anSelectedPhoto(this.state.url)
      ReactGA.event({
        category: 'User',
        action: 'Anonymous flow initiated',
        label: 'URL Flow',
        nonInteraction: false
      });
      this.props.router.push('image')
    }
  }
  // onDrop(acceptedFiles, rejectedFiles) {
  //   ReactGA.event({
  //     category: 'User',
  //     action: 'Image upload flow initiated',
  //     label: 'Local Image Flow',
  //     nonInteraction: false
  //   });
  //   if (acceptedFiles.length > 0) {
  //     this.props.anSelectedPhoto(acceptedFiles[0].preview)
  //     this.props.router.push('image')
  //   }
  // }
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
  getValidationState() {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    const result = urlPattern.test(this.state.url)
    if (result)
      return 'success'
    else {
      if (this.state.url !== '')
        return 'error'
    }
  }
  render() {
    const containerStyle = {
      marginTop: "30px",
      width: "500px",
    }
    if (!this.props.user.login && !this.state.anonymous) {
      let hideUploadModal = () => this.setState({ showUploadModal: false });
      const inPhoodLogo = require('../../images/logoLarge.jpg')
      return (
        <div>
          <div>
            <Grid>
              <Row style={{margin: 50}}>
                <Col xs={12} md={12}>
                  <img src={inPhoodLogo} className="center-block" alt="Welcome to inPhood!"/>
                </Col>
              </Row>

              <Row>
                <div className="text-center">
                  <Col xs={3} md={3}>
                  </Col>
                  <Col xs={3} md={3}>
                    <form onSubmit={this.handleUrl.bind(this)}>
                      <FormGroup
                        controlId="formBasicText"
                        validationState={this.getValidationState()}
                      >
                        <FormControl
                          className="text-center"
                          type="text"
                          value={this.state.url}
                          placeholder="paste image url here"
                          onChange={(e) => this.setState({url: e.target.value.toLowerCase()})}
                        />
                      </FormGroup>
                    </form>
                  </Col>
                  <Col xs={1} md={1} style={{paddingTop: 6}}>
                    <text>or</text>
                  </Col>
                  <Col xs={2} md={2}>
                    <Button onClick={this.handleClick.bind(this)}>Sign in with Instagram</Button>
                  </Col>
                  <Col xs={3} md={3}>
                  </Col>

                </div>
              </Row>

              {/* TODO: PBJ, delete this unless you need something from it--I
                restyled it into the row seen above.*/}
              {/*<Row>
                <div className="text-center">
                  <Col xs={6} md={6}>
                    <Row>
                      <Col xs={12} md={12}>
                        <form onSubmit={this.handleUrl.bind(this)}>
                          <FormGroup
                            controlId="formBasicText"
                            validationState={this.getValidationState()}
                          >
                            <FormControl
                              className="text-center"
                              type="text"
                              value={this.state.url}
                              placeholder="add image url here"
                              onChange={(e) => this.setState({url: e.target.value.toLowerCase()})}
                            />
                          </FormGroup>
                        </form>
                      </Col>
                      <Col xs={1} md={1}>
                        <Button className="btn-primary-spacing" onClick={this.handleUrl.bind(this)}><Glyphicon glyph="glyphicon glyphicon-search"></Glyphicon></Button>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={1} md={1}>
                    <Button bsStyle="default" onClick={()=>this.setState({ showUploadModal: true })}>
                      <Glyphicon glyph="glyphicon glyphicon-open" />
                    </Button>
                    <UploadModal
                      onDrop={(acceptedFiles, rejectedFiles) => this.onDrop.bind(this)}
                      show={this.state.showUploadModal}
                      onHide={hideUploadModal}
                    />
                  </Col>
                  <Col xs={6} md={6}>
                    <Button onClick={this.handleClick.bind(this)}>Sign in with Instagram</Button>
                  </Col>
                  <Button onClick={this.handleClick.bind(this)}>Sign in with Instagram</Button>
                </div>
              </Row>
              */}
            </Grid>
          </div>
        </div>
      )
    }
    else if (this.props.user.error !== '' && !this.state.anonymous) {
      return (
        <Alert bsStyle="danger">
          <strong>Error: {this.props.user.error}</strong>
        </Alert>
      )
    }
    else if (!this.state.anonymous && (this.props.user.photos.length === 0 || this.props.user.photos.data.length === 0)) {
      return (
        <Alert bsStyle="info">
          <strong>Photos loading...</strong>
        </Alert>
      )
    }
    else if (!this.state.anonymous) {
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
                           padding: 5}}>
                <Col xs={2} md={2}>
                  <DropdownButton bsStyle="info" title="Options" id={`dropdown-basic`}>
                    <MenuItem key="1" onClick={() => this.props.igRefreshRequest()}>Refresh</MenuItem>
                    <MenuItem key="2" onClick={() => this.props.igLogoutRequest()}>Logout</MenuItem>
                  </DropdownButton>
                </Col>
                <Col xs={8} md={8} />
                <Col xs={2} md={2} className="text-right">
                  <Button className="btn-primary-spacing" bsStyle="success" onClick={this.selectPhoto.bind(this)}>Select Image</Button>
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
