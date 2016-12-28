import React from "react"

import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Jumbotron from 'react-bootstrap/lib/Jumbotron'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Hello from 'hellojs'

export default class Home extends React.Component {
  handleClick() {
    this.props.igLoginRequest()
  }
  render() {
    const containerStyle = {
      marginTop: "30px"
    }
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