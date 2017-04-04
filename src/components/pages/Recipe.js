const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Popover from 'react-bootstrap/lib/Popover'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'
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
    }
  }
  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this))
  }
  routerWillLeave(nextLocation) {
    if (!this.state.isSaved) {
      if (!nextLocation.search)
        return 'Your work is not saved! Are you sure you want to leave?'
      else if (nextLocation.search)
        return 'Happy with the recipe ingredients?'
    }
  }
  handleChange = (value) => {
    this.setState({...this.state, ingredients: value});
  }
  sampleRecipeFlow() {
    ReactGA.event({
      category: 'User',
      action: 'User trying sample recipe',
      nonInteraction: true
    });
    const ingredients = '1 c chard\n2 c spinach\n3 tbsp olive oil\n2 oz feta cheese\n1 tsp salt'
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
      ReactGA.event({
        category: 'User',
        action: 'User sending recipe',
        nonInteraction: true
      });
      const {ingredients} = this.state
      let data = parseRecipe(ingredients)
      if (data.found) {
        this.props.storeParsedData(data.found, data.missing, ingredients)
        if (!this.state.showNutritionMixers) {
          this.setState({showNutritionMixers: true})
        }
        this.setState({ingredients: '', isSaved: false, recipeError: false})
      }
    }
  }
  getAddIngredientButton() {
    const {matchResultsModel} = this.props.tagModel
    const {parsedData} = this.props.nutrition
    const numIngredients = Object.keys(parsedData).length
    const loadedIngredients = matchResultsModel.getNumberOfSearches()
    if (loadedIngredients < numIngredients) {
      return (
        <div className="text-center">
          <ProgressBar type='circular' mode='indeterminate' multicolor={true} />
        </div>
      )
    } else {
      return(
        <div style={{marginTop: 10}} className="text-right">
          <TooltipButton
            tooltip='Click to try a sample recipe'
            tooltipPosition='left'
            tooltipDelay={500}
            icon='cached'
            label='Sample Recipe'
            onClick={() => this.sampleRecipeFlow()}
            style={{marginRight: 30, textTransform: 'none'}}
          />
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
        </div>
      )
    }
  }
  render() {
    const recipeAlert = (this.state.recipeError) ? (
      <Alert bsStyle="danger">
        <h4>You forgot to enter an ingredient!</h4>
      </Alert>
    ) : null
    return (
      <div>
        <FormGroup controlId="formControlsTextarea">
          {recipeAlert}
          <TooltipInput
            tooltip='Type your ingredients here'
            tooltipPosition='top'
            type='text'
            multiline label='Recipe Ingredients'
            maxLength={5000}
            value={this.state.ingredients}
            onChange={this.handleChange.bind(this)}
            hint='1 c spinach'
            required
            icon='restaurant'
          />
        </FormGroup>
        {this.getAddIngredientButton()}
        <div style={{marginTop: 15, marginBottom: 15}}>
          <ServingsController/>
        </div>
      </div>
    )
  }
}

export default withRouter(Recipe)
