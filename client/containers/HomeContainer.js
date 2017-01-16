import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Home from '../components/pages/Home'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    user: state.userReducer,
    nutrition: state.nutritionReducer,
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
