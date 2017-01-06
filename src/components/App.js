import React, { Component } from 'react'
import Route from 'react-router/lib/Route'
import Router from 'react-router/lib/Router'
import IndexRoute from 'react-router/lib/IndexRoute'
import browserHistory from 'react-router/lib/browserHistory'

import Home from "../containers/HomeContainer"
import Layout from "./pages/Layout"
import About from "./pages/About"
import './styles/App.css'
import './styles/custom-styles.css'

export default class App extends Component {
  render() {
    return (
      <Router onUpdate={() => this.props.fireTracking()} history={browserHistory}>
        <Route path="/" component={Layout}>
          <IndexRoute component={Home}></IndexRoute>
          <Route path="about" name="about" component={About}></Route>
        </Route>
      </Router>
    )
  }
}