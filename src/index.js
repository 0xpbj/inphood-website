var React = require('react')
var ReactDOM = require('react-dom')
import { Provider } from 'react-redux'
import App from './components/App'

import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootReducer from './reducers'
import rootSaga from './sagas'
import './index.css'

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

import ReactGA from 'react-ga'
ReactGA.initialize('UA-88850545-1', {
  debug: true,
  titleCase: false,
  gaOptions: {
    userId: 'websiteTester'
  }
})

import sagaMonitor from './sagas/sagaMonitor'
const sagaMiddleware = createSagaMiddleware({sagaMonitor})
// const sagaMiddleware = createSagaMiddleware()
const store = createStore(
  rootReducer,
  applyMiddleware(sagaMiddleware)
)
sagaMiddleware.run(rootSaga)
firebase.initializeApp(fbConfig)

function fireTracking() {
  ReactGA.set({ page: window.location.pathname })
  ReactGA.pageview(window.location.pathname)
}

ReactDOM.render(
  <Provider store={store}>
    <App fireTracking={fireTracking}/>
  </Provider>,
  document.getElementById('root')
)