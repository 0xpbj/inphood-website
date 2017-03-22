import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import IngredientController from '../components/controllers/IngredientController'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    tagModel: state.tagModelReducer,
    ingredientModel: state.ingredientControlModelReducer
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IngredientController)
