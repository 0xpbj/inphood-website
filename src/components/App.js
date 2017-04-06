const React = require('react')
import Route from 'react-router/lib/Route'
import Router from 'react-router/lib/Router'
import Redirect from 'react-router/lib/Redirect'
import IndexRoute from 'react-router/lib/IndexRoute'
import browserHistory from 'react-router/lib/browserHistory'

import About from './pages/About'
import Layout from './pages/Layout'
import NoMatch from './pages/NoMatch'
import Generator from '../containers/GeneratorContainer'

import './styles/App.css'
import './styles/custom-styles.css'

export default class App extends React.Component {
  render() {
    return (
      <Router onUpdate={() => this.props.fireTracking()} history={browserHistory}>
        <Route path='/' component={Layout}>
          <IndexRoute component={Generator}></IndexRoute>
          <Route path='about' name='about' component={About}></Route>
          <Route path='*' component={NoMatch}/>
        </Route>
      </Router>
    )
  }
}
