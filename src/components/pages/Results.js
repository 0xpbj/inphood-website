const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Label from './NutritionEstimateJSX'
import {Link} from 'react-router'
import {IngredientModel} from '../models/IngredientModel'
import {NutritionModel} from '../models/NutritionModel'
import TagController from '../controllers/TagController'
import CopyToClipboard from 'react-copy-to-clipboard'
import domtoimage from 'dom-to-image'
import TopBar from '../layout/TopBar'
const Config = require('Config')

export default class Results extends React.Component {
  constructor() {
    super()
    this.state = {
      copied: false,
      ecopied: false
    }
  }
  componentWillMount() {
    this.props.modelReset()
    this.props.clearData()
  }
  saveLabelToImage() {
    ReactGA.event({
      category: 'Share',
      action: 'User saving label',
      nonInteraction: false
    });
    domtoimage.toPng(document.getElementById('nutrition-label'), { quality: 1.0 })
    .then(function (dataUrl) {
      var link = document.createElement('a');
      link.download = 'nutrition-label.png';
      link.href = dataUrl;
      link.click();
    });
  }
  // From https://toddmotto.com/methods-to-determine-if-an-object-has-a-given-property/
  //  - addresses limitations of IE and other issues related to checking if an object
  //    has a property.
  //
  hasProp(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property)
  }
  // TODO: this should be a utility or a factory that constructs this from
  //       an ingredient model--it doesn't belong in results
  getTextLabel(anIngredientModel) {
    let textLabel =
      'Serving Size : ' + anIngredientModel.getServingAmount() + ' ' + anIngredientModel.getServingUnit() + '\n' +
      'Calories     : ' + anIngredientModel.getCalories() + '\n' +
      'Fat          : ' + anIngredientModel.getTotalFatPerServing() + ' ' +  anIngredientModel.getTotalFatUnit() + '\n' +
      'Carbs        : ' + anIngredientModel.getTotalCarbohydratePerServing() + ' ' + anIngredientModel.getTotalCarbohydrateUnit() + '\n' +
      'Fiber        : ' + anIngredientModel.getDietaryFiber() + ' ' + anIngredientModel.getDietaryFiberUnit() + '\n' +
      'Protein      : ' + anIngredientModel.getTotalProteinPerServing() + ' ' + anIngredientModel.getTotalProteinUnit() + '\n' +
      'Sugars       : ' + anIngredientModel.getSugars() + ' ' + anIngredientModel.getSugarsUnit() + '\n' +
      'Sodium       : ' + anIngredientModel.getSodium() + ' ' + anIngredientModel.getSodumUnit() + '\n'

    return textLabel
  }
  // TODO: this should be a utility or a factory that constructs this from
  //       a nutrition model--it doesn't belong in results
  getRecipeText(aNutritionModel) {
    let recipeText = ''

    const nmTags = aNutritionModel.getTags()
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
          <h4>Oh snap! Label not found!</h4>
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
      if (this.hasProp(this.props.results.data, 'composite')) {
        let ingredientData = JSON.parse(this.props.results.data.composite)
        let ingredient = new IngredientModel()
        ingredient.initializeFromSerialization(ingredientData)
        textLabel = this.getTextLabel(ingredient)
        nutritionLabel = <Label displayGeneratedStatement={true} ingredientComposite={ingredient}/>
        ReactGA.event({
          category: 'User',
          action: 'User results composite found',
          nonInteraction: false
        });
      }
      const rUser =  user ? user : Config.DEBUG ? 'test' : 'anonymous'
      let recipeText = ''
      if (this.hasProp(this.props.results.data, 'full')) {
        let nutritionModelData = JSON.parse(this.props.results.data.full)
        let nutritionModel = new NutritionModel()
        nutritionModel.initializeFromSerialization(nutritionModelData)
        recipeText = this.getRecipeText(nutritionModel)
        if (recipeText !== '')
          this.props.sendUserGeneratedData(recipeText, label, rUser)
      }
      const path = 'http://www.label.inphood.com/?user=' + rUser + '&label=' + label + '&embed=false'
      const epath = 'http://www.label.inphood.com/?user=' + rUser + '&label=' + label + '&embed=true'
      const embedMsg = '<embed src=' + epath + ' height=600 width=400>'
      const {iUrl, title} = this.props.results.data
      let modTitle = ''
      if (title !== '')
        modTitle = ': ' + title

      const saveButton = (
        <Button
          className="btn-primary-spacing"
          bsStyle="success"
          onClick={() => {this.saveLabelToImage()}}>
          Save Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-save"></Glyphicon>
        </Button>
      )

      const shareButtons = (
        <div className="text-center"
             style={{marginTop: "15", marginBottom: "15"}}>
          <Row>
            <Col xs={1} md={1} />
            <Col xs={5} md={5}>
              {saveButton}
            </Col>
            <Col xs={5} md={5}>
              <CopyToClipboard text={embedMsg}
                onCopy={() => this.setState({ecopied: true, copied: false})}>
                <Button className="btn-primary-spacing" bsStyle="success">
                  Embed Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-edit"></Glyphicon>
                </Button>
              </CopyToClipboard>
            </Col>
            <Col xs={1} md={1} />
          </Row>
          {this.state.copied ? <div style={{marginTop: "20px"}}><pre>{path}</pre><span style={{color: 'red'}}>&nbsp;Copied.</span></div> : null}
          {this.state.ecopied ? <div style={{marginTop: "20px"}}><pre>{embedMsg}</pre><span style={{color: 'red'}}>&nbsp;Copied.</span></div> : null}
        </div>
      )
      const mealPhoto = iUrl ?
        (
          <div>
            <div className="text-center"><ControlLabel>Meal Photo</ControlLabel></div>
            <Image className="center-block" src={iUrl} responsive rounded  style={{marginBottom: "20px"}}/>
          </div>
        ) : null
      const placeHolderCol = <Col xs={1} sm={1} md={1} lg={2}/>
      return (
        <div style={{backgroundColor: 'white'}}>
          <TopBar step="" stepText="" aButton={saveButton}/>
          <Grid>
            <Row>
              <Col xs={12} sm={7} md={6} lg={6}>
                <Row>
                  {placeHolderCol}
                  <Col xs={10} sm={10} md={10} lg={8}>
                    <Row>
                      <Col xs={12}>
                        <div className="text-center"><ControlLabel>Nutrition Label</ControlLabel></div>
                      </Col>
                      <Col xs={12} className="center-block">
                        {nutritionLabel}
                      </Col>
                    </Row>
                    <Row style={{marginTop: 15}}>
                      <div className="text-center"><ControlLabel>Text Nutrition Label</ControlLabel></div>
                      <pre>{textLabel}</pre>
                    </Row>
                  </Col>
                  {placeHolderCol}
                </Row>
              </Col>
              <Col xs={12} sm={5} md={6} lg={6}>
                <Row>
                  {placeHolderCol}
                  <Col xs={10} sm={10} md={10} lg={8}>
                    <Row>
                      {mealPhoto}
                    </Row>
                    <Row>
                      <div className="text-center"><ControlLabel>Recipe{modTitle}</ControlLabel></div>
                      <pre>{recipeText}</pre>
                    </Row>
                  </Col>
                  {placeHolderCol}
                </Row>
              </Col>
            </Row>
          </Grid>
        </div>
      )
    }
  }
}
