import React from "react"
import Alert from 'react-bootstrap/lib/Alert'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

export default class Anonymous extends React.Component {
  constructor() {
    super()
  }
  handleChange(e) {
    this.props.anSelectedPhoto(e.target.value)
  }
  captionChange(e) {
    this.props.anAddCaption(e.target.value)
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    return (
      <Grid>
        <Row className="show-grid">
          <Col xs={12} md={8}>
            <ControlLabel>Food Image</ControlLabel>
            <Image src={this.props.nutrition.picture} responsive rounded/>
          </Col>
          <Col xs={6} md={4}>
            <ControlLabel>Ingredients</ControlLabel>
            <textarea rows="8" cols="50" onChange={this.captionChange.bind(this)}>
              {this.props.nutrition.caption}
            </textarea>
            <Button className="btn-primary-spacing" bsStyle="success" onClick={() => this.props.anClearData()}>Done</Button>
            <Button className="btn-primary-spacing" bsStyle="info" onClick={() => this.props.goToNutrition()}>Get Nutrition</Button>
          </Col>
        </Row>
      </Grid>
    )
  }
}