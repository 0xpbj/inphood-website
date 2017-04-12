import {
  CLEAR_DATA,
  RESULT_KEY,
  LABEL_DATA,
  GET_LABEL_ID,
  STORE_PARSED_DATA,
  SERIALIZE_TO_FIREBASE,
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import * as db from './firebaseCommands'
const Config = require('Config')
const firebase = require('firebase')
import 'clientjs'
import Fingerprint2 from 'fingerprintjs2'

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
}

const getRecipeText = (aNutritionModel) => {
  let recipeText = ''
  const nmTags = aNutritionModel.getIds()
  for (let index in nmTags) {
    const tag = nmTags[index]
    const scaledIngredient = aNutritionModel.getScaledIngredient(tag)
    recipeText = recipeText +
                 scaledIngredient.getQuantity().toFixed(2) + " " +
                 scaledIngredient.getUnit() + " " +
                 scaledIngredient.getIngredientModel().getKey() +
                 "\n"
  }
  return recipeText
}

function* getUserInfo() {
  Fingerprint2().get(function(result) { 
    const path = '/global/nutritionLabel/fingerprint/' + result + '/userInfo'
    var ref = firebase.database().ref(path)
    ref.once("value").then(function(snapshot) {
      if (snapshot.exists() === false) {
        const client = new ClientJS()
        // const fingerprint = client.getFingerprint()
        var date = new Date(Date.now()).toDateString()
        // const browserData = client.getBrowserData() ? client.getBrowserData() : ''
        // const fingerPrint = client.getFingerprint()
        const userAgent = client.getUserAgent()
        const browser = client.getBrowser()
        const browserVersion = client.getBrowserVersion()
        const browserMajorVersion = client.getBrowserMajorVersion()
        const isIE = client.isIE()
        const isChrome = client.isChrome()
        const isFirefox = client.isFirefox()
        const isSafari = client.isSafari()
        const isOpera = client.isOpera()
        const engine = client.getEngine()
        const engineVersion = client.getEngineVersion()
        const os = client.getOS()
        const osVersion = client.getOSVersion()
        const isWindows = client.isWindows()
        const isMac = client.isMac()
        const isLinux = client.isLinux()
        const isUbuntu = client.isUbuntu()
        const isSolaris = client.isSolaris()
        // const device = client.getDevice() ? client.getDevice()
        // const deviceType = client.getDeviceType()
        // const deviceVendor = client.getDeviceVendor()
        // const cpu = client.getCPU()
        const isMobile = client.isMobile()
        const isMobileMajor = client.isMobileMajor()
        const isMobileAndroid = client.isMobileAndroid()
        const isMobileOpera = client.isMobileOpera()
        const isMobileWindows = client.isMobileWindows()
        const isMobileBlackBerry = client.isMobileBlackBerry()
        const isMobileIOS = client.isMobileIOS()
        const isIphone = client.isIphone()
        const isIpad = client.isIpad()
        const isIpod = client.isIpod()
        const screenPrint = client.getScreenPrint()
        const colorDepth = client.getColorDepth()
        const currentResolution = client.getCurrentResolution()
        const availableResolution = client.getAvailableResolution()
        // const deviceXDPI = client.getDeviceXDPI()
        // const deviceYDPI = client.getDeviceYDPI()
        const plugins = client.getPlugins()
        const isJava = client.isJava()
        const javaVersion = client.getJavaVersion()
        const isFlash = client.isFlash()
        const flashVersion = client.getFlashVersion()
        const isSilverlight = client.isSilverlight()
        const silverLightVersion = client.getSilverlightVersion()
        const mimeTypes = client.getMimeTypes()
        const isMimeTypes = client.isMimeTypes()
        const isFont = client.isFont()
        const fonts = client.getFonts()
        const isLocalStorage = client.isLocalStorage()
        const isSessionStorage = client.isSessionStorage()
        const isCookie = client.isCookie()
        const timeZone = client.getTimeZone()
        const language = client.getLanguage()
        // const systemLanguage = client.getSystemLanguage()
        const isCanvas = client.isCanvas()
        const canvasPrint = client.getCanvasPrint()
        firebase.database().ref('/global/nutritionLabel/fingerprint/' + result + '/userInfo/').update({
          date,
          // browserData,
          fingerPrint: result,
          userAgent,
          browser,
          browserVersion,
          browserMajorVersion,
          isIE,
          isChrome,
          isFirefox,
          isSafari,
          isOpera,
          engine,
          engineVersion,
          os,
          osVersion,
          isWindows,
          isMac,
          isLinux,
          isUbuntu,
          isSolaris,
          // device,
          // deviceType,
          // deviceVendor,
          // cpu,
          isMobile,
          isMobileMajor,
          isMobileAndroid,
          isMobileOpera,
          isMobileWindows,
          isMobileBlackBerry,
          isMobileIOS,
          isIphone,
          isIpad,
          isIpod,
          screenPrint,
          colorDepth,
          currentResolution,
          availableResolution,
          // deviceXDPI,
          // deviceYDPI,
          plugins,
          isJava,
          javaVersion,
          isFlash,
          flashVersion,
          isSilverlight,
          silverLightVersion,
          mimeTypes,
          isMimeTypes,
          isFont,
          fonts,
          isLocalStorage,
          isSessionStorage,
          isCookie,
          timeZone,
          language,
          // systemLanguage,
          isCanvas,
          canvasPrint,
        })
      }
    })
  })
}

function* loadFirebaseData() {
  const {parsedData, rawData, key} = yield select(state => state.nutritionReducer)
  if (key !== '') {
    const {nutritionModel} = yield select(state => state.nutritionModelReducer)
    const full = nutritionModel.serialize()
    const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
    const composite = compositeModel.serialize()
    const userGeneratedData = getRecipeText(nutritionModel)
    var date = new Date(Date.now()).toDateString()
    const debug = Config.DEBUG
    firebase.database().ref('/global/nutritionLabel/' + key).update({
      full,
      rawData,
      parsedData,
      composite,
      userGeneratedData,
      date,
      debug
    })
    if (!debug) {
      Fingerprint2().get(function(result) {
        firebase.database().ref('/global/nutritionLabel/' + key).update({
          fingerprint: result
        })
        firebase.database().ref('/global/nutritionLabel/fingerprint/' + result + '/' + key).update({
          date
        })
      })
    }
  }
}

function* getLabelData() {
  while (true) {
    const {labelId} = yield take (GET_LABEL_ID)
    const path = '/global/nutritionLabel/' + labelId
    const data = (yield call(db.getPath, path)).val()
    yield put({type: LABEL_DATA, data})
  }
}

function* initFirebaseKeys() {
  yield take (STORE_PARSED_DATA)
  yield call (firebaseLogin)
  const key = firebase.database().ref('/global/nutritionLabel/').push().key
  yield put ({type: RESULT_KEY, key})
}

export default function* root() {
  yield fork(getLabelData)
  yield fork(takeLatest, CLEAR_DATA, getUserInfo)
  yield fork(takeLatest, CLEAR_DATA, initFirebaseKeys)
  yield fork(takeLatest, SERIALIZE_TO_FIREBASE, loadFirebaseData)
}
