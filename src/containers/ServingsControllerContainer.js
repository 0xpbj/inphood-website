import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ServingsController from '../components/controllers/ServingsController'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    servings: state.servingsControlsReducer,
    nutritionModelRed: state.nutritionModelReducer,
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServingsController)
