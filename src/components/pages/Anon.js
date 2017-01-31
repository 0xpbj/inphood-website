var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import {parseRecipe} from '../../helpers/parseRecipe'

export default class Anonymous extends React.Component {
  constructor() {
    super()
    this.state = {
      recipe: '',
      parse: false,
      ingredients: '',
      recipeError: false,
      captionPopoverFlag: false,
      recipePopoverFlag: false
    }
  }
  componentWillMount() {
    if (this.props.nutrition.picture === '') {
      this.props.router.push('/')
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'Anonymous image page',
        nonInteraction: false
      });
    }
  }
  recipeFlow() {
    if (this.state.ingredients === '') {
      this.setState({recipeError: true})
    }
    else {
      const raw = this.state.ingredients
      let data = parseRecipe(raw)
      this.props.storeParsedData(data, raw, true)
      this.props.router.push('nutrition')
    }
  }
  getData(e) {
    let ingredients = e.target.value
    this.setState({ingredients, recipeError: false})
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    const recipeAlert = (this.state.recipeError) ? (
      <Alert bsStyle="danger">
        <h4>Oh snap! You forgot to enter a recipe!</h4>.

      </Alert>
    ) : null
    const recipePopover = this.state.recipePopoverFlag ? (
      <Popover
        id="popover-basic"
        title="Recipe Flow">
        Use recipe flow to enter accurate quantity and amount metrics
      </Popover>
    ) : null
    return (
      <Grid>
        <Row className="show-grid">
          <Col xs={12} md={8}>
            <ControlLabel>Food Image</ControlLabel>
            <Image src={this.props.nutrition.picture} responsive rounded/>
          </Col>
          <Col xs={6} md={4}>
            <div style={{marginBottom: "30px"}}>
              <section>
                <FormGroup controlId="formControlsTextarea">
                  <ControlLabel>Meal Recipe</ControlLabel>
                  {recipeAlert}
                  <Glyphicon
                    onClick={()=>this.setState({recipePopoverFlag: !this.state.recipePopoverFlag})}
                    style={{marginLeft: 10}}
                    glyph="glyphicon glyphicon-info-sign">
                    {recipePopover}
                  </Glyphicon>
                  <FormControl
                    componentClass="textarea"
                    rows="10"
                    placeholder={"1.5 cup rainbow chard (sliced)\n2 stalks green onion (sliced)\n2 medium tomatoes (chopped)\n1 medium avocado (chopped)\n¼ tsp sea salt\n1 tbsp butter\n1 ½ tbsp flax seed oil\n½ tbsp white wine vinegar\n..."}
                    onChange={this.getData.bind(this)}
                  />
                </FormGroup>
              </section>
              <Button className="btn-primary-spacing" bsStyle="success" onClick={() => this.recipeFlow()}>Use Recipe</Button>
            </div>
          </Col>
        </Row>
      </Grid>
    )
  }
}