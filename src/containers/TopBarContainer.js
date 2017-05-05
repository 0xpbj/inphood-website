import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import TopBar from '../components/layout/TopBar'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    loginRed: state.loginReducer
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar)
