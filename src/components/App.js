import React, { Component } from 'react'
import { Router, Route, IndexRoute, hashHistory } from "react-router"

import Gallery from "./pages/Gallery"
import Home from "./pages/Home"
import Layout from "./pages/Layout"
import './styles/App.css'
import './styles/custom-styles.css'


export default class App extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={Layout}>
          <IndexRoute component={Home}></IndexRoute>
          <Route path="gallery" name="gallery" component={Gallery}></Route>
        </Route>
      </Router>
    )
  }
}