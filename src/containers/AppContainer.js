import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import App from '../components/App'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    data: state.dataReducer,
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
