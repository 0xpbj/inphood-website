var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'
import {IngredientModel} from '../models/IngredientModel'
import {getValueInUnits,
        getIngredientValueInUnits,
        mapToSupportedUnits,
        mapToSupportedUnitsStrict,
        rationalToFloat,
        getPossibleUnits} from '../../helpers/ConversionUtils'
import Slider from 'react-toolbox/lib/slider'
import * as tupleHelper from '../../helpers/TupleHelpers'

export default class IngredientController extends React.Component {
  constructor(props) {
    super(props)
  }

  handleSliderValuesChange(value) {
    const {tag} = this.props
    const ingredientControlModel = this.props.model.ingredientControlModels[tag]
    const units = ingredientControlModel.getDropdownUnitValue()

    // console.log('-------------------------------------------------------------');
    // console.log('handleSliderValuesChange:');
    // console.log('tag = ' + tag);
    // console.log('value = ' + value);

    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Slider value changed',
      nonInteraction: false,
    });

    this.updateReduxStore(tag, value, units)
  }

  handleEditBoxValueChange(formObject) {
    const {tag} = this.props
    const value = formObject.target.value

    // console.log('------------------------------------------------------------');
    // console.log('handleEditBoxValueChange:');
    // console.log('tag = ' + tag);
    // console.log('value = ' + value);

    this.props.ingredientSetEditBoxValue(tag, value)
  }

  handleUnitDropdownChange(units) {
    const {tag} = this.props
    const ingredientControlModel = this.props.model.ingredientControlModels[tag]
    const value = ingredientControlModel.getSliderValue()

    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User changed units for ingredient',
      nonInteraction: false,
      label: tag
    });

    //console.log('handleUnitDropdownChange ----------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('units = ' + units);

    this.updateReduxStore(tag, value, units)
  }

  completeMatchDropdownChange(tag, value) {
    //console.log('completeMatchDropdownChange ----------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('value = ' + value);
    const {nutritionModel, ingredientControlModels} = this.props.model

    // 1. Save the current ingredient key for deletion at the end of this
    //    process:
    const ingredientControlModel = ingredientControlModels[tag]
    let ingredientKeyToDelete = ingredientControlModel.getDropdownMatchValue()
    let ingredientModelToDelete = nutritionModel.getIngredientModel(tag)

    // 2. Create a new IngredientModel:
    let dataForKey = tupleHelper.getDataForDescription(this.props.model.matchData[tag], value)
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(value, tag, dataForKey)

    // 3. Update the match value state for the dropdown:
    this.props.ingredientSetDropdownMatchValue(tag,value)

    // 4. Update the dropdown units and unit value:
    //
    //    a. Get the list of new measurement units that are possible:
    let newMeasureUnit = mapToSupportedUnits(ingredientModel.getMeasureUnit())
    let newUnits = getPossibleUnits(newMeasureUnit)
    this.props.ingredientSetDropdownUnits(tag, newUnits)
    //    b. See if the current unit is within the new possibilies, if not
    //       then set to the FDA measure defaults
    //    (TODO: or perhaps fallback to the recipe amount/unit if they worked)
    const currentValue = ingredientControlModel.getSliderValue()
    const currentUnit = ingredientControlModel.getDropdownUnitValue()
    let newUnit = currentUnit
    if (! newUnits.includes(currentUnit)) {
      newUnit = newMeasureUnit
      this.props.ingredientSetDropdownUnitsValue(tag, newUnit)
    }

    // 5. Remove the current IngredientModel from the NutritionModel:
    this.props.nutritionModelRemIng(tag)

    // 6. Add the new IngredientModel to the NutritionModel:
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User added dropdown ingredient',
      nonInteraction: false,
      label: tag
    });
    this.props.nutritionModelAddIng(tag,
                                 ingredientModel,
                                 currentValue,
                                 newUnit)

    this.props.resetLazyLoadOperation()
  }

  handleMatchDropdownChange(value) {
    const {tag} = this.props

    //console.log('handleMatchDropdownChange ----------------------------------------');
    //console.log('tag = ' + tag);
    //console.log('value = ' + value);
    // TODO: refactor and compbine
    // Tuple offsets for firebase data in nutrition reducer:

    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2
    let tagMatches = this.props.model.matchData[tag]
    let dataForKey = tupleHelper.getDataForDescription(tagMatches, value)
    if (dataForKey === undefined) {   // Lazy loading from FB
      let index = tupleHelper.getIndexForDescription(tagMatches, value)
      let tuple = tagMatches[index]
      if (value === '.....') {
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'User triggered elipses search',
          nonInteraction: false,
          label: tag
        });
        this.props.getMoreData(tag, tagMatches.length)
      }
      else {
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'User triggered dropdown lazy firebase fetch',
          nonInteraction: false,
          label: tag
        });
        this.props.lazyFetchFirebase(value, tag, tuple[keyOffset], index)
      }
    } else {
      this.completeMatchDropdownChange(tag, value)
    }
  }

  getValidationState() {
    const {tag} = this.props
    const ingredientControlModel = this.props.model.ingredientControlModels[tag]
    const editBoxValue = ingredientControlModel.getEditBoxValue()

    // Check to see if editBoxValue is a number--if so, return success because
    // rationalToFloat expects a string. This also helps to catch things like
    // "" and " " which evaluate to numbers (isNan===false) with the second
    // predicate checking for string type.
    if (! isNaN(editBoxValue)) {
      if ((typeof editBoxValue) !== "string") {
        return 'success'
      }
    }

    // Try and convert to a rational number from a variety of string
    // representations (i.e. "1/2" "024" etc.), failing that, return error.
    try {
      const value = rationalToFloat(editBoxValue)
    } catch(err) {
      return 'error'
    }

    return 'success'
  }

  updateReduxStore(tag, value, units) {
    this.props.ingredientSetSliderValue(tag, value)
    this.props.ingredientSetDropdownUnitsValue(tag, units)
    this.props.nutritionModelScaleIng(tag, value, units)
  }

  updateReduxStoreIfValid() {
    if (this.getValidationState() === 'success') {
      const {tag} = this.props
      const ingredientControlModel = this.props.model.ingredientControlModels[tag]

      const editBoxValue = ingredientControlModel.getEditBoxValue()
      let value = editBoxValue
      if ((typeof editBoxValue) !== 'number') {
        value = rationalToFloat(editBoxValue)
      }
      const units = ingredientControlModel.getDropdownUnitValue()

      this.updateReduxStore(tag, value, units)
    }
  }

  submitNewSliderValue(event) {
    this.updateReduxStoreIfValid()

    // This prevents the default behavior of a form submit which causes a full
    // re-render / re-state!
    event.preventDefault()
  }

  onEditBoxBlurred() {
    this.updateReduxStoreIfValid()
  }

  render() {
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(this.props)
    const {tag} = this.props
    const ingredientControlModel = this.props.model.ingredientControlModels[tag]
    const formControlId = tag + "FormControlId"
    const sliderValue = ingredientControlModel.getSliderValue()
    const editBoxValue = ingredientControlModel.getEditBoxValue()

    return (
      <div style={{borderWidth: 1,
                   borderColor: 'black',
                   borderStyle: 'solid',
                   borderRadius: 5,
                   padding: 10,
                   marginRight: 10,
                   marginLeft: 10}}>

        <Row>
          <Col xs={8} md={8} style={{paddingLeft: 5, paddingRight: 5}}>
            <Slider
              value={sliderValue}
              onChange={this.handleSliderValuesChange.bind(this)}
              min={ingredientControlModel.getSliderMin()}
              max={ingredientControlModel.getSliderMax()}
              step={ingredientControlModel.getSliderStep()}
              snaps/>
          </Col>
          <Col xs={2} md={2} style={{paddingLeft: 0, paddingRight: 5}}>
            <form
              onSubmit={(event) => this.submitNewSliderValue(event)}
              autoComplete="off">
              <FormGroup
                controlId={formControlId}
                validationState={this.getValidationState()}>
                <FormControl
                  componentClass="input"
                  className="text-right"
                  type="text"
                  label="Text"
                  value={editBoxValue}
                  onBlur={this.onEditBoxBlurred.bind(this)}
                  onChange={this.handleEditBoxValueChange.bind(this)}/>
              </FormGroup>
            </form>
          </Col>
          <Col xs={2} md={2} style={{paddingLeft: 0}}>
            <Dropdownlist
              data={ingredientControlModel.getDropdownUnits()}
              value={ingredientControlModel.getDropdownUnitValue()}
              onChange={this.handleUnitDropdownChange.bind(this)}/>
          </Col>
        </Row>

        <Row
          style={{marginTop: 10}}>
          <Col xs={12} md={12}>
          <Dropdownlist
            data={ingredientControlModel.getDropdownMatches()}
            value={ingredientControlModel.getDropdownMatchValue()}
            onChange={this.handleMatchDropdownChange.bind(this)}/>
          </Col>
        </Row>

      </div>
    )
  }
}
