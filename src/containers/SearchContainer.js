import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Search from '../components/pages/Search'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    search: state.searchReducer,
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search)
