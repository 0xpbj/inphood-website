import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import EmailForm from '../components/pages/EmailForm'
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
)(EmailForm)
