import React from "react"
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import Image from 'react-bootstrap/lib/Image';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

export default class Gallery extends React.Component {
  constructor() {
    super()
    this.state = {
      url: '',
    }
  }
  setIngredients(event) {
    // this.setState({ingredients: event.target.value})
  }
  render() {
    return (
      <div>
        <Grid>
          <Row>
            <Col md={6}>
              <ControlLabel>Image</ControlLabel>
              <Image src={this.state.url} responsive />
            </Col>
            <Col md={6}>
              <form>
                <FormGroup controlId="formControlsTextarea">
                  <ControlLabel>Ingredients</ControlLabel>
                  <FormControl componentClass="textarea" placeholder="apples, bananas, citrus, ..." onChange={this.setIngredients.bind(this)} />
                </FormGroup>
              </form>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}