import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Recipe from '../components/pages/Recipe'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    nutrition: state.nutritionReducer,
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Recipe)
