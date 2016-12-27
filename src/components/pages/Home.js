import React from "react"

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import Image from 'react-bootstrap/lib/Image';
import Button from 'react-bootstrap/lib/Button';
import Jumbotron from 'react-bootstrap/lib/Jumbotron';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Hello from 'hellojs';

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      url: '',
    }
  }
  componentDidMount(){
    Hello.init({
        instagram : '7ca65e72ec6f4763aae5ad5e3779a1f8'
    },{
        scope : 'basic+public_content',
        redirect_uri:'http://127.0.0.1:8000/nutritionLabel/'
    });
  }
  handleClick(){
    var instagram = Hello('instagram')
    instagram.login();
  }
  setUrl(event) {
    this.setState({url: event.target.value})
  }
  getValidationState() {
    const {url} = this.state
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    const test = pattern.test(url)
    if (test) 
      return 'success'
    else 
      return 'error'
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
              <Col md={6}>
                <form>
                  <FormGroup validationState={this.getValidationState()}>
                    <ControlLabel>Image Url</ControlLabel>
                    <FormControl type="url" placeholder="www.google.com" onChange={this.setUrl.bind(this)} />
                  </FormGroup>
                </form>
              </Col>
              <div className="row" style={containerStyle}>
                <Col md={6} className="text-center">
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