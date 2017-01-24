var React = require('react')
import Route from 'react-router/lib/Route'
import Router from 'react-router/lib/Router'
import Redirect from 'react-router/lib/Redirect'
import IndexRoute from 'react-router/lib/IndexRoute'
import browserHistory from 'react-router/lib/browserHistory'

import Home from "../containers/HomeContainer"
import SelectedImage from "../containers/SelectedImageContainer"
import Gallery from "../containers/GalleryContainer"
import Nutrition from "../containers/NutritionContainer"
import Layout from "./pages/Layout"
import About from "./pages/About"
import NoMatch from "./pages/NoMatch"
import Results from "../containers/ResultsContainer"
import './styles/App.css'
import './styles/custom-styles.css'

export default class App extends React.Component {
  requireAuth(nextState, replace) {
    if (this.props.user.login === false) {
      replace({
        pathname: '/',
      })
    }
  }
  render() {
    return (
      <Router onUpdate={() => this.props.fireTracking()} history={browserHistory}>
        <Route path="/" component={Layout}>
          <IndexRoute component={Home}></IndexRoute>
          <Route path="about" name="about" component={About} onEnter={this.requireAuth.bind(this)}></Route>
          <Route path="gallery" name="gallery" component={Gallery} onEnter={this.requireAuth.bind(this)}></Route>
          <Route path="image" name="image" component={SelectedImage} onEnter={this.requireAuth.bind(this)}></Route>
          <Route path="nutrition" name="nutrition" component={Nutrition} onEnter={this.requireAuth.bind(this)}></Route>
          <Route path="result/:userId/:labelId" name="label" component={Results} onEnter={this.requireAuth.bind(this)}></Route>
          <Route path="*" component={NoMatch}/>
        </Route>
      </Router>
    )
  }
}