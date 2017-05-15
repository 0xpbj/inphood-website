const React = require('react')
// import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import BButton from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'
import {mobileCheck} from '../../helpers/clientCheck'
import Chip from 'react-toolbox/lib/chip'
import Input from 'react-toolbox/lib/input'
import Tooltip from 'react-toolbox/lib/tooltip'
import {Button} from 'react-toolbox/lib/button'
import FontIcon from 'react-toolbox/lib/font_icon'
import MarginLayout from '../../helpers/MarginLayout'
import ServingsController from '../../containers/ServingsControllerContainer'
import { withRouter } from 'react-router'

const TooltipInput = Tooltip(Input)
const TooltipButton = Tooltip(Button)

class Recipe extends React.Component {
  constructor() {
    super()
    this.state = {
      chips: [],
      chipData: [],
      recipe: '',
      isSaved: true,
      parse: false,
      ingredients: '',
      recipeError: false,
      recipePopoverFlag: false,
      newRecipe: false
    }
  }
  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this))
  }
  routerWillLeave(nextLocation) {
    const {matchResultsModel} = this.props.tagModel
    if (!this.state.isSaved && (matchResultsModel.getNumberOfSearches() > 0)) {
      if (!nextLocation.search)
        return 'Your work is not saved! Are you sure you want to leave?'
      else if (nextLocation.search)
        return 'Happy with the recipe ingredients?'
    }
  }
  handleChange = (value) => {
    this.setState({...this.state, ingredients: value, recipeError: false});
  }
  newRecipeFlow() {
    this.props.modelReset()
    this.props.clearData()
    this.setState({newRecipe: false})
  }
  sampleRecipeFlow() {
    // ReactGA.event({
    //   category: 'User',
    //   action: 'User trying sample recipe',
    //   nonInteraction: true
    // });
    const ingredients = '1 c chard\n2.5 lb spinach\n3 tbsp olive oil\n1/4 oz feta cheese\n1 tsp salt\n¼ oz cilantro'
    this.setState({ingredients})
  }
  recipeFlow() {
    if (this.state.ingredients === '') {
      this.setState({recipeError: true})
    }
    else if (this.state.ingredients.length > 5000) {
      this.setState({recipeLengthError: true})
    }
    else {
      // ReactGA.event({
      //   category: 'User',
      //   action: 'User sending recipe',
      //   nonInteraction: true
      // });
      const {ingredients} = this.state
      let data = parseRecipe(ingredients)
      let {uniqueId} = this.props.tagModel
      if (data.found) {
        let vals = []
        for (let val of data.found) {
          this.props.incrementId()
          val.id = uniqueId
          uniqueId++
          vals.push(val)
        }
        this.props.storeParsedData(vals, data.missing, ingredients)
        if (!this.state.showNutritionMixers) {
          this.setState({showNutritionMixers: true})
        }
        this.setState({ingredients: '', isSaved: false, recipeError: false})
      }
    }
  }
  //
  isFetchComplete() {
    const {matchResultsModel} = this.props.tagModel
    const {parsedData} = this.props.nutrition

    const searchTerms = matchResultsModel.getSearchTerms()

    for (let parseObj of parsedData) {
      const tag = parseObj.name
      if (searchTerms.indexOf(tag) === -1) {
        return false
      }
    }

    return true
  }
  //
  getAddIngredientButton() {
    const {matchResultsModel} = this.props.tagModel
    const {parsedData} = this.props.nutrition
    const numIngredients = Object.keys(parsedData).length
    const loadedIngredients = matchResultsModel.getNumberOfSearches()
    let IButton = Button
    if (!mobileCheck()) {
      IButton = Tooltip(Button)
    }
    if (!this.isFetchComplete()) {
      return (
        <div className="text-center">
          <ProgressBar type='circular' mode='indeterminate' multicolor={true} />
        </div>
      )
    } else {
      const {matchResultsModel} = this.props.tagModel
      let newRecipeButton = null
      let addIngredientButton = null
      if (matchResultsModel.getNumberOfSearches() > 0) {
        if (!mobileCheck()) {
          newRecipeButton = (
            <TooltipButton
              tooltip='Click to start a new recipe'
              tooltipPosition='left'
              tooltipDelay={500}
              icon='cake'
              label='New Recipe'
              onClick={() => this.setState({newRecipe: true})}
              raised
              style={{marginRight: 30, color: 'white', backgroundColor: '#BD362F', textTransform: 'none'}}
            />
          )
        }
        else {
          newRecipeButton = (
            <Button
              icon='cake'
              label='New Recipe'
              onClick={() => this.setState({newRecipe: true})}
              raised
              style={{marginRight: 30, color: 'white', backgroundColor: '#BD362F', textTransform: 'none'}}
            />
          )
        }
      }
      else {
        // sample recipe disabled
        // if (!mobileCheck()) {
        //   newRecipeButton = (
        //     <TooltipButton
        //       tooltip='Click to try a sample recipe'
        //       tooltipPosition='left'
        //       tooltipDelay={500}
        //       icon='cached'
        //       label='Sample Recipe'
        //       onClick={() => this.sampleRecipeFlow()}
        //       style={{marginRight: 30, color: 'black', backgroundColor: 'white', textTransform: 'none'}}
        //     />
        //   )
        // }
        // else {
        //   newRecipeButton = (
        //     <Button
        //       icon='cached'
        //       label='Sample Recipe'
        //       onClick={() => this.sampleRecipeFlow()}
        //       style={{marginRight: 30, color: 'black', backgroundColor: 'white', textTransform: 'none'}}
        //     />
        //   )
        // }
        newRecipeButton = null
      }
      if (!mobileCheck()) {
          addIngredientButton = (
            <TooltipButton
            tooltip='Click to add ingredient(s) to label'
            tooltipPosition='left'
            tooltipDelay={500}
            icon='add'
            label='Add Ingredient(s)'
            raised
            style={{color: 'white', backgroundColor: '#51A351', textTransform: 'none'}}
            onClick={() => this.recipeFlow()}
          />
        )
      }
      else {
        addIngredientButton = (
          <Button
            icon='add'
            label='Add Ingredient(s)'
            raised
            style={{color: 'white', backgroundColor: '#51A351', textTransform: 'none'}}
            onClick={() => this.recipeFlow()}
          />
        )
      }
      return(
        <div style={{marginTop: 10}} className="text-right">
          {newRecipeButton}
          {addIngredientButton}
        </div>
      )
    }
  }
  getRecipeInput(recipeAlert) {
    let recipeInput = null
    if (!mobileCheck()) {
      recipeInput = (
        <TooltipInput
          tooltip='Type your ingredients here'
          tooltipPosition='top'
          type='text'
          multiline label='Recipe Ingredients'
          maxLength={5000}
          value={this.state.ingredients}
          onChange={this.handleChange.bind(this)}
          error={recipeAlert}
          hint='1 c spinach'
          required
          icon='restaurant'
        />
      )
    }
    else {
      recipeInput = (
        <Input
          type='text'
          multiline label='Recipe Ingredients'
          maxLength={5000}
          value={this.state.ingredients}
          onChange={this.handleChange.bind(this)}
          error={recipeAlert}
          hint='1 c spinach'
          required
          icon='restaurant'
        />
      )
    }
    return recipeInput
  }
  render() {
    const newRecipeAlert = (this.state.newRecipe) ? (
      <Alert bsStyle="danger" style={{marginTop: 10}} onDismiss={() => this.setState({newRecipe: false})}>
        <h4>Are you sure you want to start a new recipe?</h4>
        <h2><BButton bsStyle="danger" onClick={() => this.newRecipeFlow()}>Continue</BButton></h2>
      </Alert>
    ) : null
    const recipeAlert = (this.state.recipeError) ? 'You forgot to enter an ingredient!' : ''
    const {matchResultsModel} = this.props.tagModel
    const pad = (matchResultsModel.getNumberOfSearches() > 0) ? 0 : 15
    const servingsController = (matchResultsModel.getNumberOfSearches() > 0) ? <ServingsController /> : null
    return (
      <div>
        {newRecipeAlert}
        <FormGroup controlId="formControlsTextarea"
          style={{marginTop:25 + pad,
                  backgroundColor:'white',
                  borderColor:'black',
                  borderRadius:5,
                  borderWidth:1,
                  padding:10,
                  borderStyle:'solid'}}>
          {this.getRecipeInput(recipeAlert)}
        </FormGroup>
        {this.getAddIngredientButton()}
        <div style={{marginTop: 15, marginBottom: 15}}>
          {servingsController}
        </div>
      </div>
    )
  }
}

export default withRouter(Recipe)
