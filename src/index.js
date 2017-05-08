const React = require('react')
const ReactDOM = require('react-dom')
import { Provider } from 'react-redux'
import ReactGA from 'react-ga'
import { compose, createStore, applyMiddleware } from 'redux'
import {persistStore, autoRehydrate} from 'redux-persist'
import createSagaMiddleware from 'redux-saga'
import localForage from 'localForage'
import rootReducer from './reducers'
import rootSaga from './sagas'
import './index.css'
import App from './components/App'

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

import sagaMonitor from './sagas/sagaMonitor'
const sagaMiddleware = Config.DEBUG ? createSagaMiddleware({sagaMonitor}) : createSagaMiddleware()

const store = createStore(
  rootReducer,
  undefined,
  compose(
    applyMiddleware(sagaMiddleware)
  )
)

const persistConfig = { 
  whitelist: [
    'loginReducer',
  ],  
  blacklist: [
    'searchReducer',
    'resultsReducer',
    'tagModelReducer',
    'nutritionReducer',
    'nutritionModelReducer',
    'servingsControllerReducer',
    'ingredientControlModelReducer'
  ],  
  storage: localForage,
}

sagaMiddleware.run(rootSaga)
persistStore(store, persistConfig, () => {}).purge(persistConfig.blacklist)

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
