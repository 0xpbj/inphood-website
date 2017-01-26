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
import Anon from './Anon'
import UploadModal from '../layout/UploadModal'

const Config = require('Config')

import "react-image-gallery/styles/css/image-gallery.css"

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      showUploadModal: false
    }
  }
  handleClick() {
    this.props.igLoginRequest()
    ReactGA.event({
      category: 'User',
      action: 'Instagram Login',
      label: 'Social Flow',
      nonInteraction: false
    });
    // this.props.router.push('gallery')
  }
  handleUrl(e) {
    this.props.anSelectedPhoto(e.target.value)
    ReactGA.event({
      category: 'User',
      action: 'Anonymous flow initiated',
      label: 'URL Flow',
      nonInteraction: false
    });
  }
  onDrop(acceptedFiles, rejectedFiles) {
    ReactGA.event({
      category: 'User',
      action: 'Image upload flow initiated',
      label: 'Local Image Flow',
      nonInteraction: false
    });
    if (acceptedFiles.length > 0) {
      this.props.anSelectedPhoto(acceptedFiles[0].preview)
    }
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
    // const caption =  this.props.user.photos.data[index].caption.text
    // const parsedData = parseRecipe(caption)
    // this.props.storeParsedData(parsedData)
    // this.props.router.push('nutrition')
    this.props.router.push('image')
  }
  render() {
    const containerStyle = {
      marginTop: "30px",
      width: "500px",
    }
    // if (this.props.nutrition.anonymous) {
    //   return (
    //     <div style={containerStyle}>
    //       <Col md={12} className="text-center">
    //         <Anon
    //           nutrition={this.props.nutrition}
    //           goToNutrition={(flag) => this.goToNutrition(flag)}
    //           addCaption={(data) => this.props.addCaption(data)}
    //           anSelectedPhoto={(data) => this.props.anSelectedPhoto(data)}
    //           anClearData={() => this.props.anClearData()}
    //         />
    //       </Col>
    //     </div>
    //   )
    // }
    // else {
      // let hideUploadModal = () => this.setState({ showUploadModal: false });
    if (!this.props.user.login) {
      const inPhoodLogo = require('../../images/Icon512.png')

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
                  {/*<Col xs={6} md={6}>
                    <form>
                      <FormGroup
                        controlId="formBasicText"
                      >
                        <FormControl
                          className="text-center"
                          type="text"
                          value={this.state.value}
                          placeholder="www.google.com/images"
                          onChange={this.handleUrl.bind(this)}
                        />
                        <FormControl.Feedback />
                      </FormGroup>
                    </form>
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
                  <Col xs={5} md={5}>
                    <Button onClick={this.handleClick.bind(this)}>Sign in with Instagram</Button>
                  </Col>*/}
                  <Button onClick={this.handleClick.bind(this)}>Sign in with Instagram</Button>
                </div>
              </Row>
            </Grid>
          </div>
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
          <Row className="show-grid" style={{marginBottom: 10}}>
            <div className="text-center" style={containerStyle}/>
            <Col xs={2} md={2} />
            <Col xs={2} md={2}>
              <DropdownButton bsStyle="info" title="Options" id={`dropdown-basic`}>
                <MenuItem key="1" onClick={() => this.props.igRefreshRequest()}>Refresh</MenuItem>
                <MenuItem key="2" onClick={() => this.props.igLogoutRequest()}>Logout</MenuItem>
              </DropdownButton>
            </Col>
            <Col xs={4} md={4} />
            <Col xs={2} md={2} className="text-right">
              <Button className="btn-primary-spacing" bsStyle="success" onClick={this.selectPhoto.bind(this)}>Select Image</Button>
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
