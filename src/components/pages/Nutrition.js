var React = require('react')
import ReactGA from 'react-ga'
import Label from './NutritionEstimateJSX'
import {IngredientModel} from '../models/IngredientModel'
import {NutritionModel} from '../models/NutritionModel'
import {IngredientControlModel} from '../models/IngredientControlModel'
import {Link} from 'react-router'
import {getValueInUnits,
        getIngredientValueInUnits,
        mapToSupportedUnits,
        mapToSupportedUnitsStrict,
        rationalToFloat} from '../../helpers/ConversionUtils'
import Chip from 'react-toolbox/lib/chip'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Modal from 'react-bootstrap/lib/Modal'
import Slider from 'react-toolbox/lib/slider'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Button from 'react-bootstrap/lib/Button'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'
import ProgressBar from 'react-toolbox/lib/progress_bar'

const Config = require('Config')
const Convert = require('convert-units')

// TODO: put this somewhere sensible:
//
//  Takes a list of [[a, b, c], [d, e, f] ...] and returns a new list containing
//  elements of the specified tuple offset--i.e. given offset 1, it would return
//  [b, e] for the example given above.
//
function getListOfTupleOffset(listOfTuples, offset) {
  if ((listOfTuples.length <= 0) ||
      (listOfTuples[0].length <= offset)) {
    return []
  }

  let listOfTupleOffset = []
  for (let idx = 0; idx < listOfTuples.length; idx++) {
    listOfTupleOffset.push(listOfTuples[idx][offset])
  }

  return listOfTupleOffset
}

function getDataForDescription(listOfTuples, description) {
  // TODO: unify these somewhere - DRY
  // Tuple offsets for firebase data in nutrition reducer:
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2

  for (let idx = 0; idx < listOfTuples.length; idx++) {
    if (listOfTuples[idx][descriptionOffset] === description) {
      return listOfTuples[idx][dataObjOffset]
    }
  }

  return null
}

export default class Nutrition extends React.Component {
  //////////////////////////////////////////////////////////////////////////////
  // React / Component API:
  //////////////////////////////////////////////////////////////////////////////
  constructor(props) {
    super(props)
    this.state = {
      ingredientControlModels: {},
      nutritionModel: new NutritionModel(),
      labelRedirect: false,
      matches: {},  // TODO: delete this
      matchData: {},
      showUrlModal: false,
      selectedTags: [],
      deletedTags: [],
      unmatchedTags: [],
      servingControls: {
        value: 2,
        unit: 'people',
        min: 1,
        max: 12,
        step: 1
      },
      progress: true
    }
  }

  componentWillMount() {
    if (!this.props.user.login) {
      this.props.router.push('/')
    }
    else if (this.props.user.profile) {
      ReactGA.event({
        category: 'User',
        action: 'Get nutrition information for image',
        nonInteraction: false
      });
      this.props.igUploadPhoto()
      ReactGA.event({
        category: 'User',
        action: 'Uploading image to AWS',
        nonInteraction: true
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps -----------------------------------');

    // TODO: refactor and compbine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2

    const matchData = nextProps.nutrition.matchData
    const parsedData = nextProps.nutrition.parsedData


    // Examine to ensure we have got the complete data from firebase, then commence construction
    // and creation of objects for rendering purposes (otherwise we run into problems with things
    // not being defined):
    //
    // There are other things we can do to alleviate this.
    //
    console.log(Object.keys(matchData).length);
    console.log(Object.keys(nextProps.nutrition.parsedData).length);
    console.log('---------')
    console.log(matchData)
    console.log(nextProps.nutrition.parsedData)
    if (Object.keys(matchData).length !== Object.keys(parsedData).length) {
      // TODO: PBJ||AC render spinner
      return
    }
    for (let tag in matchData) {
      const tagMatches = matchData[tag]
      for (let idx = 0; idx < matchData[tag].length; idx++) {
        if (matchData[tag][idx][dataObjOffset] === undefined) {
          return
        }
      }
    }

    console.log('% % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    console.log(' % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    console.log('% % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    console.log('');
    console.log('Complete data received from firebase');

    console.log(nextProps.nutrition);

    let nutritionModel = this.state.nutritionModel
    let ingredientControlModels = this.state.ingredientControlModels
    let selectedTags = []
    let unmatchedTags = []

    for (let tag in matchData) {
      const tagMatches = matchData[tag]
      if (tagMatches.length === 0) {
        unmatchedTags.push(tag)
        continue
      }

      // We use the first value in the list (assumes elastic search returns results
      // in closest match order)
      //const key = tagMatches[0][keyOffset]
      const description = tagMatches[0][descriptionOffset]
      const dataForKey = tagMatches[0][dataObjOffset]

      let ingredientModel = new IngredientModel()
      ingredientModel.initializeSingle(description, tag, dataForKey)
      let measureQuantity = ingredientModel.getMeasureQuantity()
      let measureUnit = ingredientModel.getMeasureUnit()

      // TODO: measureQuantity and measureUnit should actually come from parseData
      // TODO TODO TODO TODO MVP2
      //  - check to see if measureQuantity/measureUnit specified in parseData and
      //    permissible for ingredient known conversions--if so use it, otherewise
      //    message:
      let parseQuantity = undefined
      let parseUnit = undefined
      for (let i = 0; i < parsedData.length; i++) {
      // for (let i = 0; i < 2; i++) {
        const parseObj = parsedData[i]
        const foodName = parseObj['name']

        if (foodName === tag) {
          parseQuantity = rationalToFloat(parseObj['amount'])
          parseUnit = mapToSupportedUnitsStrict(parseObj['unit'])

          if ((parseQuantity !== undefined) && (parseQuantity !== "") && (!isNaN(parseQuantity))) {
            console.log(tag + ', setting measureQuantity to parseQuantity: ' + parseQuantity)
            measureQuantity = parseQuantity
          }
          if ((parseUnit !== undefined) && (parseUnit !== "")) {
            console.log(tag + ', setting measureUnit to parseUnit: ' + parseUnit)
            measureUnit = parseUnit
          }
          break
        }
      }


      nutritionModel.addIngredient(
        description, ingredientModel, measureQuantity, measureUnit)

      let ingredientControlModel = new IngredientControlModel(
        measureQuantity,
        this.getPossibleUnits(measureUnit),
        measureUnit,
        getListOfTupleOffset(tagMatches, descriptionOffset),
        description)

      ingredientControlModels[tag] = ingredientControlModel

      selectedTags.push(tag)
    }

    this.setState({
      matchData: matchData,
      selectedTags: selectedTags,
      unmatchedTags: unmatchedTags,
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels,
      progress: false
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  // Action Handlers:
  //////////////////////////////////////////////////////////////////////////////
  transitionToLabelPage(flag, composite, full, labelOnly) {
    if (flag)
      this.props.postLabelId(this.props.nutrition.key, this.props.nutrition.resultUrl)
    this.props.sendSerializedData(composite, full)
    if (!labelOnly)
      this.props.router.push('result/'+this.props.nutrition.username + '/' + this.props.nutrition.key)
  }
  //
  handleServingValuesChange(servingValue) {
    let servingControls = this.state.servingControls
    let nutritionModel = this.state.nutritionModel

    servingControls['value'] = servingValue
    nutritionModel.setSuggestedServingAmount(servingValue, servingControls['unit'])

    this.setState({
      nutritionModel: nutritionModel,
      servingControls: servingControls
    })
  }
  //
  handleServingDropDownChange(servingUnit) {
    let servingControls = this.state.servingControls
    let nutritionModel = this.state.nutritionModel

    if (servingUnit === 'people') {
      servingControls['min'] = 1
      servingControls['max'] = 12
      servingControls['step'] = 1
      servingControls['value'] = 2
    } else {
      servingControls['min'] = 0
      servingControls['max'] = 100
      servingControls['step'] = 10
      servingControls['value'] = 50
    }
    servingControls['unit'] = servingUnit

    nutritionModel.setSuggestedServingAmount(servingControls['value'], servingUnit)

    this.setState({
      nutritionModel: nutritionModel,
      servingControls: servingControls
    })
  }
  //
  handleSliderValuesChange(tag, value) {
    let ingredientControlModels= this.state.ingredientControlModels
    ingredientControlModels[tag].setSliderValue(value)

    let nutritionModel = this.state.nutritionModel
    nutritionModel.scaleIngredientToUnit(tag, value, ingredientControlModels[tag].getDropdownUnitValue())

    this.setState({
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels
    })
  }
  //
  handleMatchDropdownChange(tag, value) {
    console.log('handleMatchDropdownChange ----------------------------------------');
    console.log('tag = ' + tag);
    console.log('value = ' + value);

    let ingredientControlModels = this.state.ingredientControlModels
    let nutritionModel = this.state.nutritionModel

    // 1. Save the current ingredient key for deletion at the end of this
    //    process:
    let ingredientKeyToDelete = ingredientControlModels[tag].getDropdownMatchValue()
    let ingredientModelToDelete = nutritionModel.getIngredientModel(tag)
    //
    // 2. Create a new IngredientModel:
    //
    const dataForKey = getDataForDescription(this.state.matchData[tag], value)
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(value, tag, dataForKey)
    //
    // 3. Update the match value state for the dropdown:
    //
    ingredientControlModels[tag].setDropdownMatchValue(value)
    //
    // 4. Update the dropdown units and unit value:
    //
    //    a. Get the list of new measurement units that are possible:
    //
    let newMeasureUnit = mapToSupportedUnits(ingredientModel.getMeasureUnit())
    let newUnits = this.getPossibleUnits(newMeasureUnit)
    ingredientControlModels[tag].setDropdownUnits(newUnits)
    //
    //    b. See if the current unit is within the new possibilies, if not
    //       then set to the FDA measure defaults
    //    (TODO: or perhaps fallback to the recipe amount/unit if they worked)
    //
    const currentValue = ingredientControlModels[tag].getSliderValue()
    const currentUnit = ingredientControlModels[tag].getDropdownUnitValue()

    let newValue = undefined
    let newUnit = undefined
    if (newUnits.includes(currentUnit)) {
      newValue = currentValue
      newUnit = currentUnit
    } else {
      console.log('Ingredient change conversion--using grams to convert:');
      console.log('   ' + currentValue + currentUnit + ' to ' + newMeasureUnit);

      // Convert current unit to grams, then convert grams to new measure unit
      // for new ingredient
      let valueInGrams = getValueInUnits(
        currentValue, currentUnit, 'g', ingredientModelToDelete)
      newValue = getValueInUnits(
        valueInGrams, 'g', newMeasureUnit, ingredientModel)
      newUnit = newMeasureUnit

      ingredientControlModels[tag].setSliderValue(newValue)
      ingredientControlModels[tag].setDropdownUnitValue(newUnit)
      // TODO: possibly an alert to tell the user we've converted their number
      //       to a new amount due to unit change and the old units are not
      //       available.
    }
    //
    // 5. Remove the current IngredientModel from the NutritionModel:
    //
    nutritionModel.removeIngredient(ingredientKeyToDelete)
    //
    // 6. Add the new IngredientModel to the NutritionModel:
    nutritionModel.addIngredient(value,
                                 ingredientModel,
                                 newValue,
                                 newUnit)
    this.setState({
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels
    })
  }
  //
  handleUnitDropdownChange(tag, value) {
    console.log('handleUnitDropdownChange ----------------------------------------');
    console.log('tag = ' + tag);
    console.log('value = ' + value);

    let newUnit = value
    let ingredientControlModels = this.state.ingredientControlModels
    let ingredientControlModel = ingredientControlModels[tag]
    let ingredientModel = this.state.nutritionModel.getIngredientModel(tag)

    // TODO: catch the exception from here and mention that their current value
    // will be lost if we change to those units.
    let newValue = getIngredientValueInUnits(
      newUnit, ingredientModel, ingredientControlModel)

    ingredientControlModels[tag].setSliderValue(newValue)
    ingredientControlModels[tag].setDropdownUnitValue(newUnit)

    this.setState({
      ingredientControlModels: ingredientControlModels
    })
  }
  //
  handleChipDelete(tag) {
    console.log('handleChipDelete ------------------------------------------------');
    console.log('tag = ' + tag);
    console.log('selectedTags = ');
    console.log(this.state.selectedTags);
    console.log('deletedTags = ');
    console.log(this.state.deletedTags);

    // 1. Delete this tag from:
    //    this.state..

    //    this.state.nutritionModel
    //    ingredientControlModels
    //
    let nutritionModel = this.state.nutritionModel
    let ingredientControlModels = this.state.ingredientControlModels
    //
    let selectedTags = this.state.selectedTags
    let deletedTags = this.state.deletedTags
    //
    nutritionModel.removeIngredient(ingredientControlModels[tag].getDropdownMatchValue())
    delete ingredientControlModels[tag]
    //
    // 2. Remove the tag from selectedTags (use splice--delete just makes the
    //    element undefined):
    //
    for (let i = 0; i < selectedTags.length; i++) {
      if (tag === selectedTags[i]) {
        selectedTags.splice(i, 1)
        break
      }
    }
    deletedTags.push(tag)
    //
    this.setState({
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels,
      selectedTags: selectedTags,
      deletedTags: deletedTags
    })
  }
  //
  handleChipAdd(tag) {
    console.log('handleChipAdd    ------------------------------------------------');
    console.log('tag = ' + tag);
    console.log('selectedTags = ');
    console.log(this.state.selectedTags);
    console.log('deletedTags = ');
    console.log(this.state.deletedTags);

    // TODO: refactor and compbine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2

    let tagMatches = this.state.matchData[tag]
    let nutritionModel = this.state.nutritionModel
    let ingredientControlModels = this.state.ingredientControlModels

    let selectedTags = this.state.selectedTags
    let deletedTags = this.state.deletedTags

    // TODO: A lot of this is common to componentWillMount. Refactor

    // 1. Add this tag to:
    //    - this.state.nutritionModel
    //    - ingredientControlModels
    //

    const description = tagMatches[0][descriptionOffset]
    const dataForKey = tagMatches[0][dataObjOffset]
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(description, tag, dataForKey)

    const measureQuantity = ingredientModel.getMeasureQuantity()
    const measureUnit = ingredientModel.getMeasureUnit()
    nutritionModel.addIngredient(
      description, ingredientModel, measureQuantity, measureUnit)

    let ingredientControlModel =
      new IngredientControlModel(
            measureQuantity,
            this.getPossibleUnits(measureUnit),
            measureUnit,
            getListOfTupleOffset(tagMatches, descriptionOffset),
            description)

    ingredientControlModels[tag] = ingredientControlModel

    // 2. Add the tag to selectedTags and remove it from deleted tags ...
    //
    for (let i = 0; i < deletedTags.length; i++) {
      if (tag === deletedTags[i]) {
        deletedTags.splice(i, 1)
        break
      }
    }
    selectedTags.push(tag)

    this.setState({
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels,
      selectedTags: selectedTags,
      deletedTags: deletedTags
    })
  }
  //////////////////////////////////////////////////////////////////////////////
  // Miscellany:
  //////////////////////////////////////////////////////////////////////////////
  //
  // TODO: probably move this to ConversionUtils.js
  getPossibleUnits(measureUnit) {
    const excludedUnits = [
      'mm3', 'cm3', 'm3', 'km3', 'in3', 'ft3', 'yd3',
      'mcg', 'mg']

    let sanitizedMeasureUnit = mapToSupportedUnits(measureUnit)

    // We can also convert anything to grams so include those measures since
    // our data is in grams (mass):
    const massUnits = Convert().from('g').possibilities()

    let unitData = []

    const allUnits = Convert().possibilities()
    if (allUnits.includes(sanitizedMeasureUnit)) {
    // if (Convert().possibilities().includes(measureUnit)) {
      // Cryptic one-liner for set-union (3rd result on following SO):
      // http://stackoverflow.com/questions/3629817/getting-a-union-of-two-arrays-in-javascript
      unitData = [...new Set([...massUnits,...Convert().from(sanitizedMeasureUnit).possibilities()])]
      // unitData = massUnits.concat(Convert().from(measureUnit).possibilities())

      // One-liner for set difference
      // From: http://stackoverflow.com/questions/1723168/what-is-the-fastest-or-most-elegant-way-to-compute-a-set-difference-using-javasc
      unitData = unitData.filter(x => excludedUnits.indexOf(x) < 0)
    } else {
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log("Unsupported measureUnit = " + sanitizedMeasureUnit);
      unitData = massUnits.concat([sanitizedMeasureUnit])
      unitData = unitData.filter(x => excludedUnits.indexOf(x) < 0)
    }
    return unitData
  }
  //////////////////////////////////////////////////////////////////////////////
  // UI Element Generation:
  //////////////////////////////////////////////////////////////////////////////
  getChipsFromArray(anArray, deletable) {
    let htmlResult = []
    for (let i = 0; i < anArray.length; i++) {
      let tag = anArray[i]
      if (deletable) {
        htmlResult.push(
          <Chip
            onDeleteClick={this.handleChipAdd.bind(this, tag)}
            deletable>
            <span style={{textDecoration: 'line-through'}}>
              {tag}
            </span>
          </Chip>)
      } else {
        htmlResult.push(
          <Chip
            onDeleteClick={this.handleChipAdd.bind(this, tag)}>
            <span style={{textDecoration: 'line-through'}}>
              {tag}
            </span>
          </Chip>)
        }
    }
    return (
      <div>{htmlResult}</div>
    )
  }
  //
  getServingsController() {
    return (
      <div>
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>Servings</text>
          </Col>
        </Row>
        <div style={{borderWidth: 1,
                     borderColor: 'black',
                     borderStyle: 'solid',
                     borderRadius: 5,
                     padding: 10,
                     marginRight: 10,
                     marginLeft: 10}}>
          <Row>
            <Col xs={10} md={10}>
              <Slider
                value={this.state.servingControls['value']}
                onChange={this.handleServingValuesChange.bind(this)}
                min={this.state.servingControls['min']}
                max={this.state.servingControls['max']}
                step={this.state.servingControls['step']}
                editable pinned snaps/>
            </Col>
            <Col xs={2} md={2}>
                {/* TODO */}
                <Dropdownlist
                  data={['people', 'g']}
                  value={this.state.servingControls['unit']}
                  onChange={this.handleServingDropDownChange.bind(this)}/>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
  //
  getTagPanel(tags, tagName, deletable) {
    if (tags.length === 0) {
      return (<div></div>)
    }

    return (
      <div>
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>{tagName}</text>
          </Col>
        </Row>
        <div style={{borderWidth: 1,
                     borderColor: 'black',
                     borderStyle: 'solid',
                     borderRadius: 5,
                     padding: 10,
                     marginRight: 10,
                     marginLeft: 10}}>
          <Row>
            <Col xs={12} md={12}>
              {/* The section elements here separate the updated tags from the
                  eliminated ones */}
              {this.getChipsFromArray(tags, deletable)}
            </Col>
          </Row>
        </div>
      </div>
    )

  }
  //
  getIngredientController(tag) {
    // Layout:
    //
    //      Egg:
    //      <--------*-------------------------> [   1] [egg]^v
    //      [Eggs, scrambled, frozen mixture                ]^v
    //
    // TODO: - the meta info about the unit (probably make it a little info
    // button next to the units that pops up)
    //
    const ingredientControlModel = this.state.ingredientControlModels[tag]

    return (
      <div>
          {/* row 1 from above: */}
          <Row
            style={{marginTop: 20}}>
            <Col xs={12} md={12}>
              <Chip
                onDeleteClick={this.handleChipDelete.bind(this, tag)}
                deletable>
                {tag}
              </Chip>
            </Col>
          </Row>
          <div style={{borderWidth: 1,
                       borderColor: 'black',
                       borderStyle: 'solid',
                       borderRadius: 5,
                       padding: 10,
                       marginRight: 10,
                       marginLeft: 10}}>
            {/* row 2 from above: */}
            <Row>
              <Col xs={10} md={10} style={{paddingLeft: 5, paddingRight: 5}}>
                <Slider
                  value={ingredientControlModel.getSliderValue()}
                  onChange={this.handleSliderValuesChange.bind(this, tag)}
                  min={ingredientControlModel.getSliderMin()}
                  max={ingredientControlModel.getSliderMax()}
                  step={ingredientControlModel.getSliderStep()}
                  editable
                  snaps/>
              </Col>
              <Col xs={2} md={2} style={{paddingLeft: 0}}>
                <Dropdownlist
                  data={ingredientControlModel.getDropdownUnits()}
                  value={ingredientControlModel.getDropdownUnitValue()}
                  onChange={this.handleUnitDropdownChange.bind(this, tag)}/>
              </Col>
            </Row>
            {/* row 3 from above: */}
            <Row
              style={{marginTop: 10}}>
              <Col xs={12} md={12}>
              <Dropdownlist
                data={ingredientControlModel.getDropdownMatches()}
                value={ingredientControlModel.getDropdownMatchValue()}
                onChange={this.handleMatchDropdownChange.bind(this, tag)}/>
              </Col>
            </Row>
          </div>
      </div>
    )
  }
  //
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
    else if (this.state.progress) {
      return (
        <div className="text-center">
          <ProgressBar type="circular" mode="indeterminate" multicolor={true}/>
        </div>
      )
    }
    //
    // 1. Generate a list of tags not found in our DB and build the array of
    //    sliders:
    //
    let sliders = []
    let notFound = ""
    let ingredientControlModels = this.state.ingredientControlModels
    for (let tag in this.state.matchData) {
    // for (let tag in this.state.matches) {
      if (! (tag in ingredientControlModels)) {
        notFound = notFound + tag + " "
        continue
      }

      sliders.push(this.getIngredientController(tag))
    }

    if (notFound != "") {
      notFound = "(No data for: " + notFound + ")"
    }
    //
    // 2. Serialize the nutrition model and composite ingreident model:
    //
    const full = this.state.nutritionModel.serialize()
    const compositeModel = this.state.nutritionModel.getScaledCompositeIngredientModel()
    const composite = compositeModel.serialize()

    // TODO: PBJ, what does the next line do? Is it needed here?
    let hideUrlModal = () => this.setState({ showUrlModal: false })
    const eventKey = this.props.nutrition.anonymous === false ? "2" : "1"
    return (
      <Grid>
        <Row>
          <Col xs={12} md={12}>
            <div className='text-right'>
              <Button bsStyle="success" onClick={this.transitionToLabelPage.bind(this, false, composite, full, false)}>Share Results</Button>
            </div>
          </Col>
        </Row>

        {/*Serving size below: TODO refactor*/}
        <Row style={{marginTop: 20}}>
          <Col xs={8} md={8}>
            {this.getServingsController()}
            {sliders}
          </Col>
          <Col xs={4} md={4}>
            <Row>
              <div>
                <text>&nbsp;</text>
                <Label ingredientComposite={compositeModel}/>
              </div>
            </Row>
            {/* temporary hack to align top to adjacent slider */}
            <Row style={{marginTop: 9}}>
              {this.getTagPanel(this.state.deletedTags,
                                'Discarded Tags:',
                                true)}
            </Row>
            <Row>
              {this.getTagPanel(this.state.unmatchedTags,
                                'No match found for these tags:',
                                true)}
            </Row>
          </Col>
        </Row>

      </Grid>
    )
  }
}
