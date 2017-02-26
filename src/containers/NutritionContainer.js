import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Nutrition from '../components/pages/Nutrition'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    nutrition: state.nutritionReducer,
    model: state.modelReducer,
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Nutrition)
