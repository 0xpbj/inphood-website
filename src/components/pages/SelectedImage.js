var React = require('react')
import ReactGA from 'react-ga'
import Alert from 'react-bootstrap/lib/Alert'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import Chip from 'react-toolbox/lib/chip'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'

export default class SelectedImage extends React.Component {
  constructor() {
    super()
    this.state = {
      chips: [],
      chipData: [],
      recipe: '',
      parse: false,
      ingredients: '',
      recipeError: false
    }
  }
  componentWillMount() {
    if (!this.props.user.login) {
      this.props.router.push('/')
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'Go to image page',
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
  captionFlow() {
    const raw = this.props.user.photos.data[this.props.nutrition.index].caption.text
    let data = parseCaption(raw)
    this.props.storeParsedData(data, raw, false)
    this.props.router.push('nutrition')
  }
  getData(e) {
    let ingredients = e.target.value
    this.setState({ingredients, recipeError: false})
  }
  render() {
    if (!this.props.user.profile) {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Oh snap! Login Error!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    }
    const containerStyle = {
      marginTop: "60px"
    }
    const recipeAlert = (this.state.recipeError) ? (
      <Alert bsStyle="danger">
        <h4>Oh snap! You forgot to enter a recipe!</h4>
      </Alert>
    ) : null
    return (
      <Grid>
        <Row className="show-grid">
          <Col xs={12} md={8}>
            <ControlLabel>Food Image</ControlLabel>
            <Image src={this.props.user.photos.data[this.props.nutrition.index].picture} responsive rounded/>
          </Col>
          <Col xs={6} md={4}>
            <div style={{marginBottom: "30px"}}>
              <section>
                <FormGroup controlId="formControlsTextarea">
                  <ControlLabel>Meal Recipe</ControlLabel>
                  {recipeAlert}
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
            <ControlLabel>Instagram Caption</ControlLabel>
            <div style={{marginBottom: "30px"}}>
              <section>
                <Well>{this.props.user.photos.data[this.props.nutrition.index].caption.text}</Well>
              </section>
              <Button className="btn-primary-spacing" onClick={() => this.captionFlow()}>Use Caption</Button>
            </div>
          </Col>
        </Row>
      </Grid>
    )
  }
}
