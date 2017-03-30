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
import CopyToClipboard from 'react-copy-to-clipboard'
import domtoimage from 'dom-to-image'
import TopBar from '../layout/TopBar'
import UploadModal from '../layout/UploadModal'
const Config = require('Config')

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
    this.getLabelInfo()
    ReactGA.initialize('UA-88850545-2', {
      debug: Config.DEBUG,
      titleCase: false,
      gaOptions: {
        userId: 'websiteUser'
      }
    })
  }
  getLabelInfo() {
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
  getTextLabel(anIngredientModel) {
    const microNutrientsAndFnPfxs = IngredientModel.microNutrientsAndFnPfxs

    let textLabel = 'Nutrition Facts\n'
    textLabel +=    'Serving Size       : ' + anIngredientModel.getServingAmount() + ' ' + anIngredientModel.getServingUnit() + '\n'
    textLabel +=    '==========================================\n'
    textLabel +=    'Calories           : ' + anIngredientModel.getCalories() + '\n'
    textLabel +=    '------------------------------------------\n'
    textLabel +=    'Total Fat          : ' + anIngredientModel.getTotalFatPerServing() + ' ' +  anIngredientModel.getTotalFatUnit() +
                                              '    (' + anIngredientModel.getTotalFatRDA() + '% RDA)\n'
    textLabel +=    '  Saturated Fat    : ' + anIngredientModel.getSaturatedFatPerServing() + ' ' + anIngredientModel.getSaturatedFatUnit() +
                                              '    (' + anIngredientModel.getSaturatedFatRDA() + '% RDA)\n'
    textLabel +=    '  Trans Fat        : ' + anIngredientModel.getTransFatPerServing() + ' ' + anIngredientModel.getTransFatUnit() + '\n'
    textLabel +=    'Cholesterol        : ' + anIngredientModel.getCholestorol() + ' ' + anIngredientModel.getCholestorolUnit() +
                                              '   (' + anIngredientModel.getCholestorolRDA() + '% RDA)\n'
    textLabel +=    'Sodium             : ' + anIngredientModel.getSodium() + ' ' + anIngredientModel.getSodiumUnit() +
                                              '  (' + anIngredientModel.getSodiumRDA() + '% RDA)\n'
    textLabel +=    'Total Carbohydrate : ' + anIngredientModel.getTotalCarbohydratePerServing() + ' ' + anIngredientModel.getTotalCarbohydrateUnit() +
                                              '    (' + anIngredientModel.getTotalCarbohydrateRDA() + '% RDA)\n'
    textLabel +=    '  Dietary Fiber    : ' + anIngredientModel.getDietaryFiber() + ' ' + anIngredientModel.getDietaryFiberUnit() +
                                              '    (' + anIngredientModel.getDietaryFiberRDA() + '% RDA)\n'
    textLabel +=    '  Sugars           : ' + anIngredientModel.getSugars() + ' ' + anIngredientModel.getSugarsUnit() + '\n'
    textLabel +=    'Protein            : ' + anIngredientModel.getTotalProteinPerServing() + ' ' + anIngredientModel.getTotalProteinUnit() + '\n'
    textLabel +=    '------------------------------------------\n'
    for (let nutrient in microNutrientsAndFnPfxs) {
      // C+P straight out of NutritionEstimateJSX.
      // TODO: think about re-use, non-repeat.
      //
      const functionPrefix = microNutrientsAndFnPfxs[nutrient]

      const value = anIngredientModel[functionPrefix]()
      let unit = anIngredientModel[functionPrefix + 'Unit']()
      let rda2k = anIngredientModel[functionPrefix + 'RDA']()

      if (unit === 'µg') {  // Convert 'µg' to 'mcg':
        unit = 'mcg'
      }

      if (rda2k === undefined || isNaN(rda2k)) {  // Handle special cases:
        if (functionPrefix === 'get_vitaminA') {
          rda2k = anIngredientModel['get_vitaminA_IURDA']()
        } else if (functionPrefix === 'get_vitaminD') {
          rda2k = anIngredientModel['get_vitaminD_IURDA']()
        } else {
          console.log('RDA based on 2k calorie diet unavailable.');
          rda2k = ''
        }
      }
      if (rda2k != '') {
        rda2k = rda2k + '%'
      }

      const charsToColon = 19
      let rowText = nutrient
      for (let i = 0; i < (charsToColon - nutrient.length); i++) {
        rowText += ' '
      }

      rowText += ': ' + value + ' ' + unit


      const charsToRDA = 31
      const rowTextLength = rowText.length
      for (let i = 0; i < (charsToRDA - rowTextLength); i++) {
        rowText += ' '
      }
      rowText += '(' + rda2k + ' RDA)\n'

      textLabel += rowText
    }
    textLabel +=    '==========================================\n'
    textLabel +=    '* RDA (Recommended Daily Allowance) is\n' +
                    'based on a 2,000 calorie diet. Your\n' +
                    'daily values may be higher or lower\n' +
                    'depending on your calorie needs.\n'
    return textLabel
  }

  // TODO: this should be a utility or a factory that constructs this from
  //       an ingredient model--it doesn't belong in results
  // getTextLabel(anIngredientModel) {
  //   let textLabel =
  //     'Serving Size : ' + anIngredientModel.getServingAmount() + ' ' + anIngredientModel.getServingUnit() + '\n' +
  //     'Calories     : ' + anIngredientModel.getCalories() + '\n' +
  //     'Fat          : ' + anIngredientModel.getTotalFatPerServing() + ' ' +  anIngredientModel.getTotalFatUnit() + '\n' +
  //     'Carbs        : ' + anIngredientModel.getTotalCarbohydratePerServing() + ' ' + anIngredientModel.getTotalCarbohydrateUnit() + '\n' +
  //     'Fiber        : ' + anIngredientModel.getDietaryFiber() + ' ' + anIngredientModel.getDietaryFiberUnit() + '\n' +
  //     'Protein      : ' + anIngredientModel.getTotalProteinPerServing() + ' ' + anIngredientModel.getTotalProteinUnit() + '\n' +
  //     'Sugars       : ' + anIngredientModel.getSugars() + ' ' + anIngredientModel.getSugarsUnit() + '\n' +
  //     'Sodium       : ' + anIngredientModel.getSodium() + ' ' + anIngredientModel.getSodiumUnit() + '\n'
  //
  //   return textLabel
  // }
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
  // getTitleValidationState() {
  //   const length = this.state.title.length
  //   if (length === 1 || length > 100)
  //     return 'error'
  //   else if (length > 0)
  //     return 'success'
  // }
  // getDietaryValidationState() {
  //   const length = this.state.dietary.length
  //   if (length === 1 || length > 100)
  //     return 'error'
  //   else if (length > 0)
  //     return 'success'
  // }
  // getAllergenValidationState() {
  //   const length = this.state.allergen.length
  //   if (length === 1 || length > 100)
  //     return 'error'
  //   else if (length > 0)
  //     return 'success'
  // }
  // onDrop(acceptedFiles, rejectedFiles) {
  //   ReactGA.event({
  //     category: 'User',
  //     action: 'Image uploaded',
  //     nonInteraction: false
  //   })
  //   acceptedFiles.forEach(file => {
  //     this.props.selectedPhoto(file)
  //   })
  // }
  // getMealPhoto() {
  //   const {iUrl} = this.props.results.data
  //   const pictureAlert = (this.state.pictureError) ? (
  //     <Alert bsStyle="danger">
  //       <h4>Oh snap! You forgot to add a picture of your meal!</h4>
  //     </Alert>
  //   ) : null
  //   const picturePopover = this.state.picturePopoverFlag ? (
  //     <div style={{ width: 300 }}>
  //       <Popover
  //         id="popover-basic"
  //         placement="right"
  //         positionLeft={20}
  //         positionTop={-40}
  //         title="Picture Help"
  //       >
  //         Add a meal photo to highlight recipe details
  //       </Popover>
  //     </div>
  //   ) : null
  //   const imLink = iUrl ? iUrl : this.props.results.picture
  //   const image = imLink ? (
  //     <div className="text-center">
  //       <ControlLabel>Meal Photo</ControlLabel>
  //       <Image className="center-block" src={imLink} responsive rounded/>
  //     </div>
  //   ) : (
  //     <div className="text-center">
  //       {pictureAlert}
  //       <Button bsStyle="success" onClick={()=>this.setState({ showUploadModal: true })}>
  //         Upload Meal Photo&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-open"></Glyphicon>
  //       </Button>
  //       <Glyphicon
  //         onClick={()=>this.setState({picturePopoverFlag: !this.state.picturePopoverFlag})}
  //         style={{marginLeft: 10}}
  //         glyph="glyphicon glyphicon-info-sign">
  //         {picturePopover}
  //       </Glyphicon>
  //       <UploadModal
  //         onDrop={(acceptedFiles, rejectedFiles) => this.onDrop.bind(this)}
  //         show={this.state.showUploadModal}
  //         onHide={() => this.setState({showUploadModal: false})}
  //       />
  //     </div>
  //   )
  //   return image
  //     // const mealPhoto = (true) ?
  //     // (
  //     //   <div>
  //     //     <div className="text-center"><ControlLabel>Meal Photo</ControlLabel></div>
  //     //     <Image className="center-block" src={iUrl} responsive rounded  style={{marginBottom: "20px"}}/>
  //     //   </div>
  //     // ) : null
  // }
  // getShareButtons() {
  //   return (
  //     <div className="text-center"
  //          style={{marginTop: "15", marginBottom: "15"}}>
  //       <Row>
  //         <Col xs={1} md={1} />
  //         <Col xs={5} md={5}>
  //           {saveButton}
  //         </Col>
  //         <Col xs={5} md={5}>
  //           <CopyToClipboard text={embedMsg}
  //             onCopy={() => this.setState({ecopied: true, copied: false})}>
  //             <Button className="btn-primary-spacing" bsStyle="success">
  //               Embed Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-edit"></Glyphicon>
  //             </Button>
  //           </CopyToClipboard>
  //         </Col>
  //         <Col xs={1} md={1} />
  //       </Row>
  //       {this.state.copied ? <div style={{marginTop: "20px"}}><pre>{path}</pre><span style={{color: 'red'}}>&nbsp;Copied.</span></div> : null}
  //       {this.state.ecopied ? <div style={{marginTop: "20px"}}><pre>{embedMsg}</pre><span style={{color: 'red'}}>&nbsp;Copied.</span></div> : null}
  //     </div>
  //   )
  // }
  // getTitleForm() {
  //   let {title} = this.props.results.data
  //   let titleForm = !title ? (
  //     <FieldGroup
  //       id="formControlsText"
  //       spellCheck={true}
  //       type="text"
  //       value={this.state.title}
  //       placeholder="Enter a recipe title..."
  //       validationState={this.getTitleValidationState()}
  //       onChange={(e) => this.setState({title: e.target.value})}
  //     />
  //   ) : <div className="text-center"><ControlLabel>{title}</ControlLabel></div>
  //   return titleForm
  // }
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
      // const path = 'http://www.label.inphood.com/?user=' + rUser + '&label=' + label + '&embed=false'
      // const epath = 'http://www.label.inphood.com/?user=' + rUser + '&label=' + label + '&embed=true'
      // const embedMsg = '<embed src=' + epath + ' height=600 width=400>'
      // const {iUrl, title} = this.props.results.data
      // let modTitle = ''
      // if (title && title !== '')
      //   modTitle = ': ' + title
      const placeHolderCol = <Col xs={0} sm={0} md={1} lg={2}/>
      return (
        <div style={{backgroundColor: 'white'}}>
          <TopBar step="" stepText="" aButton={null} router={this.props.router}/>
          <Grid>
            <Row>
              <Col xs={12} sm={6} md={6} lg={6}>
                <Row>
                  {placeHolderCol}
                  <Col xs={12} sm={12} md={10} lg={8}>
                    <Row>
                      <Col xs={12} className="center-block">
                        {nutritionLabel}
                      </Col>
                    </Row>
                  </Col>
                  {placeHolderCol}
                </Row>
              </Col>
              <Col xs={12} sm={6} md={6} lg={6}>
                <Row>
                  {placeHolderCol}
                  <Col xs={12} sm={10} md={10} lg={8}>
                    {/*<Row>
                      <div style={{marginBottom: 10}} className="text-center">
                      {this.getTitleForm()}
                      </div>
                      <div style={{marginBottom: 10}} className="text-center">
                      {this.getMealPhoto()}
                      </div>
                    </Row>*/}
                    <Row>
                      <div className="text-center">
                        <ControlLabel>Recipe</ControlLabel>
                      </div>
                      <pre>{recipeText}</pre>
                    </Row>
                    {/*<Row style={{marginTop: 10}}>
                      <div className="text-center"><ControlLabel>Text Nutrition Label</ControlLabel></div>
                      <pre>{textLabel}</pre>
                    </Row>*/}
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
