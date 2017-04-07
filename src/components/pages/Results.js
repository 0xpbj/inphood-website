const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import Label from './NutritionEstimateJSX'
import {IngredientModel} from '../models/IngredientModel'
import {NutritionModel} from '../models/NutritionModel'
import TagController from '../controllers/TagController'
// import CopyToClipboard from 'react-copy-to-clipboard'
import Footer from '../../containers/FooterContainer'
import TopBar from '../../containers/TopBarContainer'
import UploadModal from '../layout/UploadModal'
const Config = require('Config')
import {getTextLabel} from '../../helpers/TextLabel'

const FieldGroup = ({ id, label, ...props }) => {
  return (
    <FormGroup controlId={id} validationState={props.validationState}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
    </FormGroup>
  )
}

export default class Results extends React.Component {
  constructor() {
    super()
    this.state = {
      copied: false,
      ecopied: false,
      allergen: '',
      dietary: '',
      title: '',
      pictureError: false,
      picturePopoverFlag: false,
      captionPopoverFlag: false,
      showUploadModal: false
    }
  }
  componentWillMount() {
    const {label, user} = this.props
    if (label && label !== '') {
      const hUser = user ? user : Config.DEBUG ? 'test' : 'anonymous'
      this.props.getLabelId(hUser, label)
    }
  }
  // From https://toddmotto.com/methods-to-determine-if-an-object-has-a-given-property/
  //  - addresses limitations of IE and other issues related to checking if an object
  //    has a property.
  //
  hasProp(object, property) {
    if (object)
      return Object.prototype.hasOwnProperty.call(object, property)
    else
      return null
  }
  getRecipeText(aNutritionModel) {
    let recipeText = ''
    const nmTags = aNutritionModel.getIds()
    for (let index in nmTags) {
      const tag = nmTags[index]
      const scaledIngredient = aNutritionModel.getScaledIngredient(tag)
      recipeText = recipeText +
                   scaledIngredient.getQuantity().toFixed(2) + " " +
                   scaledIngredient.getUnit() + " " +
                   scaledIngredient.getIngredientModel().getKey() +
                   "\n"
    }
    return recipeText
  }
  render() {
    ReactGA.event({
      category: 'User',
      action: 'User viewing results page',
      nonInteraction: true
    });
    const containerStyle = {
      marginTop: "60px"
    }
    if (this.props.results.data === null) {
      ReactGA.event({
        category: 'User',
        action: 'User in incorrect results area',
        nonInteraction: false
      });
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Woaaaah! Label not found!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    }
    else {
      ReactGA.event({
        category: 'User',
        action: 'User in results page',
        nonInteraction: false
      });
      const {label, user} = this.props
      const socialContainerStyle = {
        marginTop: "20px",
        border: "2px solid black",
        padding: "5px",
        margin: "10px",
      }
      const labelContainerStyle = {
        marginTop: "20px",
        border: "2px solid black",
        padding: "5px",
        margin: "10px",
      }
      let textLabel = ''
      // If we've received the data for the Nutrition label, deserialize it for
      // rendering, otherwise display a loading message.
      //   - TODO: make the loading message suck less
      let nutritionLabel = <text> Loading ...</text>
      const rUser =  user ? user : Config.DEBUG ? 'test' : 'anonymous'
      let recipeText = ''
      if (this.hasProp(this.props.results.data, 'composite') && this.hasProp(this.props.results.data, 'full')) {
        let ingredientData = JSON.parse(this.props.results.data.composite)
        let ingredient = new IngredientModel()
        ingredient.initializeFromSerialization(ingredientData)
        let nutritionModelData = JSON.parse(this.props.results.data.full)
        let nutritionModel = new NutritionModel()
        nutritionModel.initializeFromSerialization(nutritionModelData)
        nutritionLabel = (nutritionModel.getLabelType() !== 4) ? <Label displayGeneratedStatement={true} ingredientComposite={ingredient}/> : <pre>{getTextLabel(ingredient)}</pre>
        recipeText = this.getRecipeText(nutritionModel)
        ReactGA.event({
          category: 'User',
          action: 'User results composite found',
          nonInteraction: false
        });
      }
      return (
        <div style={{backgroundColor: 'white'}}>
          <TopBar router={this.props.router}/>
          <Grid>
            <Row style={{marginTop: 25}}>
              <Col xs={12} sm={4} md={4} lg={4} className="text-left">
                {nutritionLabel}
              </Col>
              <Col xs={0} sm={4} md={4} lg={4}/>
              <Col xs={12} sm={4} md={4} lg={4}>
                <pre>{recipeText}</pre>
              </Col>
            </Row>
          </Grid>
        </div>
      )
    }
  }
}
