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
import ProgressBar from 'react-bootstrap/lib/ProgressBar'

import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'
// import ProgressBar from 'react-toolbox/lib/progress_bar'

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

function getIndexForDescription(listOfTuples, description) {
  // TODO: unify these somewhere - DRY
  // Tuple offsets for firebase data in nutrition reducer:
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2

  for (let idx = 0; idx < listOfTuples.length; idx++) {
    if (listOfTuples[idx][descriptionOffset] === description) {
      return idx
    }
  }

  return -1
}

function getTupleForDescription(listOfTuples, description) {
  let index = getIndexForDescription(listOfTuples, description)

  if (index < 0) {
    return null
  }

  return listOfTuples[index]
}

function getDataForDescription(listOfTuples, description) {
  // TODO: unify these somewhere - DRY
  // Tuple offsets for firebase data in nutrition reducer:
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2

  let tuple = getTupleForDescription(listOfTuples, description)
  if (tuple === null) {
    return null
  }

  return tuple[dataObjOffset]
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
      progress: 0,
      matchIndex: 0
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

    let lazyLoadOperation = nextProps.nutrition.lazyLoadOperation
    console.log('lazyLoadOperation.status = ' + lazyLoadOperation.status)
    if (lazyLoadOperation.status === 'done') {
      this.completeMatchDropdownChange(lazyLoadOperation.tag, lazyLoadOperation.value)
      this.props.resetLazyLoadOperation()
    }
    // HORRIBLE HACK:
    //  - the code below here used to be in componentWillMount, it was essentially
    //    designed to be run once. When we inserted the code to lazy load the pulldown
    //    data from firebase, we ended up introducing additional calls to this method.
    //    The check below uses the state of the lazyLoadOperation in redux to prevent
    //    the code below from being repeatedly run, which introduces a host of bugs, i.e.:
    //      * the pulldown gets re-rendered with incorrect information
    //      * items from the unselected list get pushed back into the selected list
    //
    //    TODO: in MVP3, re-architect this properly to work with the redux store
    //
    if (lazyLoadOperation.status === 'inProgress' ||
        lazyLoadOperation.status === 'idle' ||
        lazyLoadOperation.status == 'done') {
      return
    }

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
    // console.log(Object.keys(matchData).length);
    // console.log(Object.keys(nextProps.nutrition.parsedData).length);
    // console.log('---------');
    // console.log(matchData);
    // console.log(nextProps.nutrition.parsedData);
    if (Object.keys(matchData).length !== Object.keys(parsedData).length) {
      return
    }

    // Check that the first dataObject is not undefined (modified from non-lazy
    // load where every match was checked)
    const firstMatch = 0
    for (let tag in matchData) {
      if (matchData[tag].length === 0) {
        continue
      }
      if (matchData[tag][firstMatch][dataObjOffset] === undefined) {
        return
      }
    }

    // A spinner gets rendered until this method gets here.

    // console.log('% % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    // console.log(' % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    console.log('% % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %');
    // console.log('');
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

      let tryQuantity = measureQuantity
      let tryUnit = measureUnit

      let parseQuantity = undefined
      let parseUnit = undefined
      for (let i = 0; i < parsedData.length; i++) {
        const parseObj = parsedData[i]
        const foodName = parseObj['name']

        if (foodName === tag) {

          // Sometimes the parseObj returns things like 'toTaste=true' and no
          // amount or unit fields. TODO: we should probably exclude those tags/
          // ingredients from the label in MVP3 or put them in their own bucket.
          if ('amount' in parseObj) {
            if ((parseObj['amount'].hasOwnProperty('min')) &&
                 parseObj['amount'].hasOwnProperty('max')) {
              const parseMinQuantity = rationalToFloat(parseObj['amount'].min)
              const parseMaxQuantity = rationalToFloat(parseObj['amount'].max)
              parseQuantity = (parseMinQuantity + parseMaxQuantity) / 2.0
            } else {
              parseQuantity = rationalToFloat(parseObj['amount'])
            }
          }
          if ('unit' in parseObj) {
            parseUnit = mapToSupportedUnitsStrict(parseObj['unit'])
          }

          if ((parseQuantity !== undefined) && (parseQuantity !== "") && (!isNaN(parseQuantity))) {
            console.log(tag + ', setting measureQuantity to parseQuantity: ' + parseQuantity);
            tryQuantity = parseQuantity
          }
          if ((parseUnit !== undefined) && (parseUnit !== "")) {
            console.log(tag + ', setting measureUnit to parseUnit: ' + parseUnit);
            tryUnit = parseUnit
          }

          break
        }
      }

      let errorStr = ''
      try {
        nutritionModel.addIngredient(tag, ingredientModel, tryQuantity, tryUnit)
      } catch(err) {
        errorStr = err
        console.log(errorStr);
      } finally {
        // We failed to add the ingredient with the specified quantity/unit, so try
        // using the FDA values (not try/catch--if this fails we have a serious internal
        // error--i.e. this should always work.)
        if (errorStr !== '') {
          tryQuantity = measureQuantity
          tryUnit = measureUnit
          nutritionModel.addIngredient(tag, ingredientModel, tryQuantity, tryUnit)
        }
      }
      console.log('===========================================================');
      console.log('after addIngredient: ' + tag + '(' + description + ')');
      console.log('nutritionModel:');
      for (let key in nutritionModel._scaledIngredients) {
        console.log('key = ' + key);
      }

      let ingredientControlModel = new IngredientControlModel(
        tryQuantity,
        this.getPossibleUnits(tryUnit),
        tryUnit,
        getListOfTupleOffset(tagMatches, descriptionOffset),
        description)

      ingredientControlModels[tag] = ingredientControlModel

      selectedTags.push(tag)
    }

    // Hackity hack hack--init the serving amount from the servingControls so they
    // match on presentation of the label
    let servingControls = this.state.servingControls
    nutritionModel.setSuggestedServingAmount(servingControls['value'], servingControls['unit'])

    this.setState({
      matchData: matchData,
      selectedTags: selectedTags,
      unmatchedTags: unmatchedTags,
      nutritionModel: nutritionModel,
      ingredientControlModels: ingredientControlModels,
      progress: 1
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
      servingControls['max'] = 300
      servingControls['step'] = 25
      servingControls['value'] = 100
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
  completeMatchDropdownChange(tag, value) {
    // debugger
    console.log('completeMatchDropdownChange ----------------------------------------');
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
    let dataForKey = getDataForDescription(this.state.matchData[tag], value)
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
    nutritionModel.removeIngredient(tag)
    //
    // 6. Add the new IngredientModel to the NutritionModel:
    nutritionModel.addIngredient(tag,
                                 ingredientModel,
                                 newValue,
                                 newUnit)
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

    // TODO: refactor and compbine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2

    let tagMatches = this.state.matchData[tag]
    let dataForKey = getDataForDescription(tagMatches, value)
    if (dataForKey === undefined) {   // Lazy loading from FB
      let index = getIndexForDescription(tagMatches, value)
      let tuple = tagMatches[index]
      this.props.lazyFetchFirebase(value, tag, tuple[keyOffset], index)
    } else {
      this.completeMatchDropdownChange(tag, value)
    }
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
    nutritionModel.removeIngredient(tag)
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
      tag, ingredientModel, measureQuantity, measureUnit)

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
    const numIngredients = Object.keys(this.props.nutrition.parsedData).length
    const loadedIngredients = Object.keys(this.props.nutrition.matchData).length

    if (!this.props.user.profile) {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Oh snap! Login Error!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    } else if (loadedIngredients < numIngredients) {
      const progress = (100.0 * loadedIngredients) / numIngredients
      console.log('\n\n\nProgress: ', progress)
      return (
        <div className="text-center">
          <ProgressBar striped
           bsStyle="success" now={progress} />
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
                                false)}
            </Row>
          </Col>
        </Row>

      </Grid>
    )
  }
}
