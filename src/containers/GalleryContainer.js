import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Gallery from '../components/pages/Gallery'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    user: state.userReducer,
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Gallery)
