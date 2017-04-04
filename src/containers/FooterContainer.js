import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Footer from '../components/layout/Footer'
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
)(Footer)
