import React from "react"

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

export default class Home extends React.Component {
  constructor() {
    super()
  }
  handleClick() {
    this.props.igLoginRequest()
  }
  goToNutrition() {
    this.props.router.push('/nutrition')
    this.props.uploadPhoto()
  }
  render() {
    const containerStyle = {
      marginTop: "30px"
    }
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
            selectedPhoto={(data) => this.props.selectedPhoto(data)}
            goToNutrition={this.goToNutrition.bind(this)}
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
              </Row>
            </Grid>
          </div>
        </div>
      )
    }
  }
}