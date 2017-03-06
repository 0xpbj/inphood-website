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
import UploadModal from '../layout/UploadModal'

import MarginLayout from '../../helpers/MarginLayout'
import TopBar from '../layout/TopBar'

const FieldGroup = ({ id, label, ...props }) => {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
    </FormGroup>
  )
}

export default class Recipe extends React.Component {
  constructor() {
    super()
    this.state = {
      chips: [],
      chipData: [],
      recipe: '',
      parse: false,
      allergen: '',
      dietary: '',
      title: '',
      ingredients: '',
      recipeError: false,
      pictureError: false,
      picturePopoverFlag: false,
      captionPopoverFlag: false,
      recipePopoverFlag: false,
      showUploadModal: false
    }
  }
  componentWillMount() {
    this.props.nutritionModelReset()
    ReactGA.event({
      category: 'User',
      action: 'User in recipe page',
      nonInteraction: false
    });
  }
  recipeFlow() {
    if (this.state.ingredients === '') {
      this.setState({recipeError: true})
    }
    // else if (this.props.nutrition.picture === '') {
    //   this.setState({pictureError: true})
    // }
    else {
      const {ingredients, title, dietary, allergen} = this.state
      let data = parseRecipe(ingredients)
      this.props.storeParsedData(data.found, data.missing, ingredients, title, dietary, allergen)
      this.props.uploadPhoto()
      ReactGA.event({
        category: 'User',
        action: 'User sending recipe',
        nonInteraction: true
      });
      this.props.router.push('nutrition')
    }
  }
  onDrop(acceptedFiles, rejectedFiles) {
    ReactGA.event({
      category: 'User',
      action: 'Image uploaded',
      nonInteraction: false
    })
    acceptedFiles.forEach(file => {
      this.props.selectedPhoto(file)
    })
  }
  render() {
    const recipeAlert = (this.state.recipeError) ? (
      <Alert bsStyle="danger">
        <h4>Oh snap! You forgot to enter a recipe!</h4>
      </Alert>
    ) : null
    const pictureAlert = (this.state.pictureError) ? (
      <Alert bsStyle="danger">
        <h4>Oh snap! You forgot to add a picture of your meal!</h4>
      </Alert>
    ) : null
    const recipePopover = this.state.recipePopoverFlag ? (
      <div style={{ width: 300 }}>
        <Popover
          id="popover-basic"
          placement="right"
          positionLeft={20}
          positionTop={-40}
          title="Recipe Help"
        >
          Enter recipe ingredients and quantities for the nutrition label
        </Popover>
      </div>
    ) : null
    const picturePopover = this.state.picturePopoverFlag ? (
      <div style={{ width: 300 }}>
        <Popover
          id="popover-basic"
          placement="right"
          positionLeft={20}
          positionTop={-40}
          title="Picture Help"
        >
          Add a meal photo to highlight recipe details
        </Popover>
      </div>
    ) : null
    const captionPopover = this.state.captionPopoverFlag ? (
      <Popover
        id="popover-basic"
        title="Caption Flow"
      >
        Extract ingredients from social media caption
      </Popover>
    ) : null
    let textRows = 9
    let recipeForm = (
      <div>
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Recipe Title"
          placeholder="Pumpkin Waffles"
          onChange={(e) => this.setState({title: e.target.value})}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Dietary Information"
          placeholder="Paleo, Vegan, etc..."
          onChange={(e) => this.setState({dietary: e.target.value})}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Allergen Information"
          placeholder="Peanut, Gluten, etc..."
          onChange={(e) => this.setState({allergen: e.target.value})}
        />
      </div>
    )
    const image = this.props.nutrition.picture ? (
      <Image className="center-block" src={this.props.nutrition.picture} responsive rounded/>
    ) : (
      <div className="text-center">
        {pictureAlert}
        <Button bsStyle="default" onClick={()=>this.setState({ showUploadModal: true })}>
          Upload Meal Photo&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-open"></Glyphicon>
        </Button>
        <Glyphicon
          onClick={()=>this.setState({picturePopoverFlag: !this.state.picturePopoverFlag})}
          style={{marginLeft: 10}}
          glyph="glyphicon glyphicon-info-sign">
          {picturePopover}
        </Glyphicon>
        <UploadModal
          onDrop={(acceptedFiles, rejectedFiles) => this.onDrop.bind(this)}
          show={this.state.showUploadModal}
          onHide={() => this.setState({showUploadModal: false})}
        />
      </div>
    )
    const ml = new MarginLayout()
    const useRecipeButton = (
      <Button className="btn-primary-spacing"
              bsStyle="success"
              onClick={() => this.recipeFlow()}>
        Next: Parse Recipe
      </Button>
    )
    return (
      <div>
        <TopBar step=""
                stepText=""
                aButton={useRecipeButton}/>

        <Row>
          {ml.marginCol}
          <Col xs={ml.xsCol}
               sm={ml.smCol}
               md={ml.mdCol}
               lg={ml.lgCol}>
            <Row>
              <Col xs={4} md={4}>
                {recipeForm}
              </Col>
              <Col xs={8} md={8}>
                <FormGroup controlId="formControlsTextarea">
                  <ControlLabel>Recipe Ingredients</ControlLabel>
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
                    onChange={(e) => this.setState({ingredients: e.target.value, recipeError: false})}
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
