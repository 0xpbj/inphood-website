const React = require('react')
import Alert from 'react-bootstrap/lib/Alert'
import Popover from 'react-bootstrap/lib/Popover'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

export default class RecipeForm extends React.Component {
  constructor() {
    super()
    this.state = {
      ingredients: '',
      recipeError: false,
      recipePopoverFlag: false,
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.storeRecipeFlag) {
      this.props.storeRecipe(this.state.ingredients)
      this.setState({ingredients: ''})
    }
  }
  render() {
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
    const recipeAlert = (this.state.recipeError) ? (
      <Alert bsStyle="danger">
        <h4>You forgot to enter a ingredient!</h4>
      </Alert>
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
            rows={3}
            value={this.state.ingredients}
            placeholder={"1 cup spinach (sliced)\n..."}
            onChange={(e) => this.setState({ingredients: e.target.value, recipeError: false})}
          >
          </FormControl>
        </FormGroup>
      </div>
    )
  }
}
