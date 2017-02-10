var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'
import Chip from 'react-toolbox/lib/chip'

import MarginLayout from '../../helpers/MarginLayout'
import TopBar from '../layout/TopBar'

export default class SelectedImage extends React.Component {
  constructor() {
    super()
    this.state = {
      chips: [],
      chipData: [],
      recipe: '',
      parse: false,
      ingredients: '',
      recipeError: false,
      captionPopoverFlag: false,
      recipePopoverFlag: false
    }
  }
  componentWillMount() {
    if (!this.props.user.login && !this.props.user.anonymous) {
      this.props.router.push('/')
    }
    else {
      this.props.nutritionModelReset()
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
    const raw = (this.props.user.photos.data[this.props.nutrition.index].caption.text)
    const ingredients = parseCaption(raw)
    this.setState({ingredients})
  }
  getData(e) {
    let ingredients = e.target.value
    this.setState({ingredients, recipeError: false})
  }
  render() {
    if (!this.props.user.login && !this.props.user.anonymous) {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Oh snap! Login Error!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    }
    const caption = this.props.user.anonymous ? null : <pre>{this.props.user.photos.data[this.props.nutrition.index].caption.text}</pre>
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
    const captionPopover = this.state.captionPopoverFlag ? (
      <Popover
        id="popover-basic"
        title="Caption Flow"
      >
        Extract ingredients from social media caption
      </Popover>
    ) : null
    let instagramCaption = null
    let instagramButton = null
    let textRows = 10
    if (this.props.user.anonymous === false) {
      instagramCaption = (
        <div>
          <ControlLabel>Instagram Caption</ControlLabel>
          {/*<Glyphicon onClick={()=>this.setState({captionPopoverFlag: !this.state.captionPopoverFlag})} style={{marginLeft: 10}} glyph="glyphicon glyphicon-info-sign">
            {captionPopover}
          </Glyphicon>*/}
          <section>
            {caption}
          </section>
        </div>
      )
      instagramButton = (
        <Button className="btn-primary-spacing"
                onClick={() => this.captionFlow()}>
          Extract Recipe
        </Button>
      )
      textRows = this.props.user.photos.data[this.props.nutrition.index].caption.text.split(/\n/).length
      if (textRows < 5) {
        textRows = 10
      }
    }
    const image = this.props.user.anonymous ? (
      <Image className="center-block" src={this.props.nutrition.picture} responsive rounded/>
    ) : (
      <Image className="center-block" src={this.props.user.photos.data[this.props.nutrition.index].picture} responsive rounded/>
    )

    const ml = new MarginLayout()
    const useRecipeButton = (
      <Button className="btn-primary-spacing"
              bsStyle="success"
              onClick={() => this.recipeFlow()}>
        Use Recipe
      </Button>
    )
    return (
      <div>
        <TopBar step="2"
                stepText="Enter or paste a recipe ..."
                aButton={useRecipeButton}/>

        <Row>
          {ml.marginCol}
          <Col xs={ml.xsCol}
               sm={ml.smCol}
               md={ml.mdCol}
               lg={ml.lgCol}>
            <Row>
              <Col xs={12} md={6}>
                {instagramCaption}
              </Col>
              <Col xs={12} md={6}>
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
                    rows={textRows}
                    value={this.state.ingredients}
                    placeholder={"1.5 cup rainbow chard (sliced)\n2 stalks green onion (sliced)\n2 medium tomatoes (chopped)\n1 medium avocado (chopped)\n¼ tsp sea salt\n1 tbsp butter\n1 ½ tbsp flax seed oil\n½ tbsp white wine vinegar\n..."}
                    onChange={this.getData.bind(this)}
                  />
                </FormGroup>
              </Col>
            </Row>
          </Col>
          {ml.marginCol}
        </Row>


        <Row>
          {ml.marginCol}
          <Col xs={ml.xsCol}
               sm={ml.smCol}
               md={ml.mdCol}
               lg={ml.lgCol}>
            {image}
          </Col>
          {ml.marginCol}
        </Row>
      </div>
    )
  }
}
