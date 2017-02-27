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

const firebase = require('firebase')
const fbConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  databaseURL: Config.FIREBASE_DATABASE_URL,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
}
if (firebase.apps.length === 0) {
  firebase.initializeApp(fbConfig)
}

import ReactGA from 'react-ga'
ReactGA.initialize('UA-88850545-2', {
  debug: Config.DEBUG,
  titleCase: false,
  gaOptions: {
    userId: 'websiteUser'
  }
})

import sagaMonitor from './sagas/sagaMonitor'
const sagaMiddleware = Config.DEBUG ? createSagaMiddleware({sagaMonitor}) : createSagaMiddleware()

const store = createStore(
  rootReducer,
  applyMiddleware(sagaMiddleware)
)
sagaMiddleware.run(rootSaga)

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
