import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import TopBar from '../components/layout/TopBar'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar)
