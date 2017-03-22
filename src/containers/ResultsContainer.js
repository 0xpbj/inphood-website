import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Results from '../components/pages/Results'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    results: state.resultsReducer,
    label: state.labelReducer
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results)
