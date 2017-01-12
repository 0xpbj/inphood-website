var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Button from 'react-bootstrap/lib/Button'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

export default class Parser extends React.Component {
  constructor() {
    super()
    this.state = {
      tags: '',
      parse: false,
      ingredients: ''
    }
  }
  parseData() {
    let regex = /[^\r\n]+/g
    let phrases = this.state.ingredients.match(regex)
    console.log(phrases)
    var ingp = require('../../algorithms/parser/ingredientparser')
    for (let i of phrases) {
      console.log(ingp.parse(i))
    }
    this.setState({tags: this.state.result})
  }
  getData(e) {
    let ingredients = e.target.value
    this.setState({ingredients})
  }
  render() {
    return (
      <Grid>
        <div className="text-center">
        <Row className="show-grid">
          <Col xs={6} md={6}>
            <FormGroup controlId="formControlsTextarea">
              <ControlLabel>Ingredients</ControlLabel>
              <FormControl componentClass="textarea" rows="10" placeholder="Write ingredients here..." onChange={this.getData.bind(this)}/>
            </FormGroup>
            <Button onClick={() => this.parseData()}>Parse Ingredients</Button>
          </Col>
          <Col xs={6} md={6}>
            <FormGroup controlId="formControlsTextarea">
              <ControlLabel>Parsed Contents</ControlLabel>
              <FormControl.Static>
                {this.state.tags}
              </FormControl.Static>
            </FormGroup>
          </Col>
        </Row>
        </div>
      </Grid>
    )
  }
}
