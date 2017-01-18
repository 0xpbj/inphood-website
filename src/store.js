// @flow
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import createLogger from 'redux-logger';

import rootReducer from './reducers';

import appConfig from '../config/main';
const Config = require('Config')

import firebase from 'firebase'
require("firebase/app")
require("firebase/auth")
require("firebase/database")
const fbConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  databaseURL: Config.FIREBASE_DATABASE_URL,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
}

const sagaMiddleware = createSagaMiddleware();
const devtools = typeof window === 'object' && window.devToolsExtension ?
  window.devToolsExtension :
  (() => noop => noop);

export default function configureStore(initialState: Object) {
  const middlewares = [
    sagaMiddleware,
  ];

  if (appConfig.env !== 'production' && process.env.BROWSER) {
    const logger = createLogger();
    middlewares.push(logger);
  }

  const enhancers = [
    applyMiddleware(...middlewares),
    devtools(),
  ];

  const store = createStore(
    rootReducer,
    initialState,
    compose(...enhancers)
  );

  store.runSaga = sagaMiddleware.run;
  firebase.initializeApp(fbConfig)

  store.close = () => {
    store.dispatch(END);
  };

  if (typeof window === 'function') {
    const module: Object = window.module;
    if (appConfig.env === 'development' && (module).hot) {
      (module).hot.accept('./reducers', () => {
        const nextRootReducer = require('./reducers').default;
        store.replaceReducer(nextRootReducer);
      });
    }
  }

  return store;
}
