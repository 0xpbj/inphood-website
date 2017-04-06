import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Nutrition from '../components/pages/Nutrition'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    tagModel: state.tagModelReducer,
    nutrition: state.nutritionReducer,
    ingredientControlModelRed: state.ingredientControlModelReducer,
    nutritionModelRed: state.nutritionModelReducer,
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Nutrition)
