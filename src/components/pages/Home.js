var React = require('react')
import ReactGA from 'react-ga'

import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Jumbotron from 'react-bootstrap/lib/Jumbotron'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Hello from 'hellojs'
import Gallery from './Gallery'
import SelectedImage from './SelectedImage'
import Parser from './Parser'
import Anon from './Anon'
import Nutrition from "../../containers/NutritionContainer"
import UploadModal from '../layout/UploadModal'

const Config = require('Config')

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      // TODO: AC for dev set this to true to go direct to Nutrition.js scene
      galleryView: !Config.fastDevelopNutritionPage,
      selectedImageView: false,
      nutritionView: Config.fastDevelopNutritionPage,
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
  }
  goToGallery() {
    this.setState({galleryView: true, selectedImageView: false, nutritionView: false})
    ReactGA.event({
      category: 'User',
      action: 'Go to gallery page',
      nonInteraction: false
    });
  }
  goToImage() {
    this.setState({galleryView: false, selectedImageView: true, nutritionView: false})
    ReactGA.event({
      category: 'User',
      action: 'Go to image page',
      nonInteraction: false
    });
  }
  goToNutrition() {
    this.setState({galleryView: false, selectedImageView: false, nutritionView: true})
    ReactGA.event({
      category: 'User',
      action: 'Get nutrition information for image',
      nonInteraction: false
    });
    this.props.igUploadPhoto()
    ReactGA.event({
      category: 'User',
      action: 'Uploading image to AWS',
      nonInteraction: true
    });
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
  render() {
    const containerStyle = {
      marginTop: "30px"
    }
    if (this.state.galleryView) {
      if (this.props.user.profile !== null) {
        if (this.props.user.photos.length === 0 || this.props.user.photos.data.length === 0) {
          return (
            <Alert bsStyle="info">
              <strong>Photos loading...</strong>
            </Alert>
          )
        }
        else {
          ReactGA.set({ userId: this.props.user.profile.name })
          return (
            <Gallery
              data={this.props.user.photos.data}
              profile={this.props.user.profile}
              refresh={this.props.igRefreshRequest}
              logout={this.props.igLogoutRequest}
              igSelectedPhoto={(index, photo) => this.props.igSelectedPhoto(index, photo)}
              goToImage={() => this.goToImage()}
            />
          )
        }
      }
      else if (this.props.user.error !== '') {
        return (
          <Alert bsStyle="danger">
            <strong>Error: {this.props.user.error}</strong>
          </Alert>
        )
      }
      else if (this.props.nutrition.anonymous) {
        return (
          <div style={containerStyle}>
            <Col md={12} className="text-center">
              <Anon
                nutrition={this.props.nutrition}
                goToNutrition={(flag) => this.goToNutrition(flag)}
                addCaption={(data) => this.props.addCaption(data)}
                anSelectedPhoto={(data) => this.props.anSelectedPhoto(data)}
                anClearData={() => this.props.anClearData()}
              />
            </Col>
          </div>
        )
      }
      else {
        let hideUploadModal = () => this.setState({ showUploadModal: false });
        return (
          <div>
          <Jumbotron>
            <h1 className="text-center">Welcome to inPhood!</h1>
          </Jumbotron>
            <div>
              <Grid>
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
    }
    else if (this.state.selectedImageView) {
      return (
        <SelectedImage
          data={this.props.user.photos.data}
          index={this.props.nutrition.index}
          goToGallery={this.goToGallery.bind(this)}
          goToNutrition={this.goToNutrition.bind(this)}
          storeParsedData={(parsedData) => this.props.storeParsedData(parsedData)}
          igUpdatedCaption={(caption) => this.props.igUpdatedCaption(caption)}
          anClearData={() => this.props.anClearData()}
        />
      )
    }
    else if (this.state.nutritionView) {
      return (
        <Nutrition
          router={this.props.router}
          goToImage={this.goToImage.bind(this)}
          resultUrl={this.props.nutrition.resultUrl}
        />
      )
    }
    else {
      return null
    }
  }
}
