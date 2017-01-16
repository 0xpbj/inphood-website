// @flow
import React from 'react';
import { Provider } from 'react-redux';
import {
  Link,
  Miss,
  Match,
  Route,
  Router,
  IndexRoute,
  ServerRouter,
  BrowserRouter,
  browserHistory,
} from 'react-router';

import Home from './containers/HomeContainer';
import Layout from './components/pages/Layout';
import About from './components/pages/About';
import NoMatch from './components/pages/NoMatch';
import Results from './containers/ResultsContainer';

export default class App extends React.Component {
  render() {
    const { context, location, store, type, fireTracking } = this.props;
    const layout = (
      <Layout>
        <Match pattern="/" exactly component={Home} />
        <Match pattern="/about" component={About} />
        <Match pattern="/label/:userId/:labelId" component={Results} />
        <Miss component={NoMatch}/>
      </Layout>
    );
    return (
      <Provider store={store}>
        {type === 'client' ? (
          <BrowserRouter>
            {layout}
          </BrowserRouter>
        ) : (
          <ServerRouter context={context} location={location}>
            {layout}
          </ServerRouter>
        )}
      </Provider>
    );
  }
}
