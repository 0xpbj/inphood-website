const React = require('react')
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
import ProgressBar from 'react-toolbox/lib/progress_bar'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'
import Chip from 'react-toolbox/lib/chip'

import MarginLayout from '../../helpers/MarginLayout'
import ServingsController from '../../containers/ServingsControllerContainer'
import { withRouter } from 'react-router'

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
  componentWillMount() {
    ReactGA.event({
      category: 'User',
      action: 'User in recipe page',
      nonInteraction: false
    });
    this.setState({isSaved: true})
  }
  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this))
  }
  routerWillLeave(nextLocation) {
    if (!this.state.isSaved) {
      if (!nextLocation.search)
        return 'Your work is not saved! Are you sure you want to leave?'
      else if (nextLocation.search)
        return 'Happy with the changes?'
    }
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
        this.setState({ingredients: '', isSaved: false})
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
        <Button className="btn-primary-spacing"
                bsStyle="success"
                onClick={() => this.recipeFlow()}>
          Add Ingredients&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-apple"></Glyphicon>
        </Button>
      )
    }
  }
  //
  render() {
    let textRows = 3
    const recipeAlert = (this.state.recipeError) ? (
      <Alert bsStyle="danger">
        <h4>You forgot to enter a ingredient!</h4>
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

    return (
      <div>
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
            placeholder={"1 cup spinach (sliced)\n..."}
            onChange={(e) => this.setState({ingredients: e.target.value, recipeError: false})}
          >
          </FormControl>
        </FormGroup>
        <div style={{marginTop: 10}} className="text-right">
          {this.getAddIngredientButton()}
        </div>
        <div style={{marginTop: 15, marginBottom: 15}}>
          <ServingsController/>
        </div>
      </div>
    )
  }
}

export default withRouter(Recipe)
