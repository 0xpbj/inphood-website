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
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Hello from 'hellojs'
import Gallery from './Gallery'
import Anon from './Anon'
import Nutrition from "../../containers/NutritionContainer"
import Dropzone from 'react-dropzone'

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      // TODO: AC for dev set this to true to go direct to Nutrition.js scene
      nutritionView: true
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
  goToNutrition() {
    this.setState({nutritionView: true})
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
  goToGallery() {
    this.setState({nutritionView: false})
    ReactGA.event({
      category: 'User',
      action: 'Go back to gallery page',
      nonInteraction: false
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
    // console.log('Accepted files: ', acceptedFiles)
    // console.log('Rejected files: ', rejectedFiles)
  }
  render() {
    const containerStyle = {
      marginTop: "30px"
    }
    if (!this.state.nutritionView) {
      if (this.props.user.profile !== null) {
        if (this.props.user.photos.length === 0 || this.props.user.photos.data.length === 0) {
          return (
            <Alert bsStyle="info">
              <strong>Photos loading...</strong>
            </Alert>
          )
        }
        else {
          return (
            <Gallery
              data={this.props.user.photos.data}
              profile={this.props.user.profile}
              refresh={this.props.igRefreshRequest}
              logout={this.props.igLogoutRequest}
              igSelectedPhoto={(data) => this.props.igSelectedPhoto(data)}
              goToNutrition={(flag) => this.goToNutrition(flag)}
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
                anAddCaption={(data) => this.props.anAddCaption(data)}
                anSelectedPhoto={(data) => this.props.anSelectedPhoto(data)}
                anClearData={() => this.props.anClearData()}
              />
            </Col>
          </div>
        )
      }
      else {
        return (
          <div>
          <Jumbotron>
            <h1 className="text-center">Welcome to inPhood!</h1>
          </Jumbotron>
            <div>
              <Grid>
                <Row>
                  <div className="text-center" style={containerStyle}>
                    <Col md={12} className="text-center">
                      <button onClick={this.handleClick.bind(this)}>Sign in with Instagram</button>
                    </Col>
                  </div>
                  <div className="text-center" style={containerStyle}>
                    <Col xs={12} md={8}>
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
                    <Col xs={6} md={4}>
                      <Dropzone onDrop={this.onDrop.bind(this)}>
                        <Image src={'https://image.freepik.com/free-icon/upload-button_318-76475.jpg'} rounded />
                      </Dropzone>
                    </Col>
                  </div>
                </Row>
              </Grid>
            </div>
          </div>
        )
      }
    }
    else {
      return <Nutrition goToGallery={this.goToGallery.bind(this)} resultUrl={this.props.nutrition.resultUrl}/>
    }
  }
}
