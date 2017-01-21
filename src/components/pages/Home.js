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
    this.props.router.push('gallery')
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
    // const containerStyle = {
    //   marginTop: "30px"
    // }
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
    // }
  }
}
