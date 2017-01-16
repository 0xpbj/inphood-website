import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { Provider } from 'react-redux';
import configureStore from './store';
import rootSaga from './sagas';
import App from './app';

import { AppContainer } from 'react-hot-loader';

import WrappedRedBox from './components/pages/WrappedRedBox';

const store = configureStore(
  window.__INITIAL_STATE__  // eslint-disable-line no-underscore-dangle
);

store.runSaga(rootSaga);

ReactGA.initialize('UA-88850545-1', {
  debug: true,
  titleCase: false,
  gaOptions: {
    userId: 'websiteTester',
  },
});

function fireTracking() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

ReactDOM.render(
  (<AppContainer errorReporter={WrappedRedBox}>
    <App
      fireTracking={fireTracking}
      store={store}
      type="client"
    />
  </AppContainer>),
  document.getElementById('app')
);

if (module && module.hot) {
  module.hot.accept('./app', () => {
    const NextApp = require('./app').default;

    ReactDOM.render((
      <AppContainer errorReporter={WrappedRedBox}>
        <NextApp
          fireTracking={fireTracking}
          store={store}
          type="client"
        />
      </AppContainer>
    ), document.getElementById('app'));
  });
}
