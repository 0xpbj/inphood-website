import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Nutrition from '../components/pages/Nutrition'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    tagModel: state.tagModelReducer,
    fdaBrandedData: state.fdaReducer,
    nutrition: state.nutritionReducer,
    ingredientModel: state.ingredientModelReducer,
    nutritionModelRed: state.nutritionModelReducer,
    servingsControls: state.servingsControlsReducer
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Nutrition)
