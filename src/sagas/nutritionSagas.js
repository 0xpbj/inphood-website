import {
  UPLOAD_PHOTO,
  POST_LABEL_ID,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  CLEAR_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  LAZY_FETCH_FIREBASE,
  LAZY_LOAD_FIREBASE,
  SEARCH_INGREDIENT,
  SELECTED_TAGS,
  GET_MORE_DATA,
  INIT_EMAIL_FLOW,
  GET_EMAIL_DATA,
  REMOVE_ELLIPSES,
  NM_ADD_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  RESET_APPEND_DATA,
  NM_REM_INGREDIENT,
  IM_SET_DROPDOWN_MATCH_VALUE,
  IM_SET_DROPDOWN_UNITS,
  COMPLETE_DROPDOWN_CHANGE,
  UNUSED_TAGS,
  NM_SET_SERVINGS
} from '../constants/ActionTypes'

import ReactGA from 'react-ga'
import * as db from './firebaseCommands'
import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import request from 'request'
const firebase = require('firebase')
const Config = require('Config')
const S3 = require('aws-sdk').S3
const SES = require('aws-sdk').SES
import {IngredientModel} from '../components/models/IngredientModel'
import {IngredientControlModel} from '../components/models/IngredientControlModel'
import {getValueInUnits,
        getIngredientValueInUnits,
        mapToSupportedUnits,
        mapToSupportedUnitsStrict,
        rationalToFloat,
        getPossibleUnits} from '../helpers/ConversionUtils'
import * as tupleHelper from '../helpers/TupleHelpers'

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
}

const sendToS3 = (request) => {
  return fetch(request)
  .then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function(json) {
        return json
      })
    } else {
      //console.log("Unexpected server response (non-JSON object returned)");
    }
  })
}

function* sendToLambdaScraper(url, key, username, thumbnail, parsedData, rawData, title, allergen, dietary) {
  const lUrl = Config.SCRAPER_LAMBDA_URL
  let myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  const awsData = {
    url,
    username,
    key
  }
  let request = new Request(lUrl, {
    method: 'POST',
    body: JSON.stringify(awsData),
    headers: myHeaders,
    mode: 'cors',
    cache: 'default'
  })
  const response = yield call (sendToS3, request)
  if (Object.prototype.hasOwnProperty.call(response, 'success')) {
    firebase.database().ref('/global/nutritionLabel/'+username+'/'+key).update({
      key,
      user: username,
      oUrl: url,
      iUrl: 'http://www.image.inphood.com/' + username + '/' + key + '.jpg',
      thumbnail,
      rawData,
      parsedData,
      title,
      dietary,
      allergen
    })
  }
}

function* uploadImageToS3(file, key, username, extension) {
  const s3 = new S3({
    accessKeyId:     Config.AWS_ACCESS_ID,
    secretAccessKey: Config.AWS_SECRET_KEY,
    region: 'us-west-2',
  })
  const params = {
    Bucket: 'inphoodlabelimagescdn',
    Key: username +'/'+ key+extension,
    Body: file,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  }
  s3.upload(params, function(err, data) {})
}

function* loadAWSPut() {
  const {parsedData, rawData, title, dietary, allergen, file} = yield select(state => state.nutritionReducer)
  yield call (firebaseLogin)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  let key = firebase.database().ref('/global/nutritionLabel/' + user).push().key
  // yield call (sendToLambdaScraper, picture, key, username, thumbnail, parsedData, rawData, title, dietary, allergen)
  let iUrl = ''
  if (file && !Config.DEBUG) {
    const extension = file.name.substr(file.name.lastIndexOf('.'))
    yield call (uploadImageToS3, file, key, 'anonymous', extension)
    iUrl = 'http://www.image.inphood.com/anonymous/'+key+extension
  }
  firebase.database().ref('/global/nutritionLabel/' + user + '/' + key).update({
    key,
    user,
    iUrl,
    rawData,
    parsedData,
    title,
    dietary,
    allergen
  })
  const url = "http://www.inphood.com/" + key
  yield put ({type: RESULT_URL, url, key, anonymous: true})
}

function* loadSerializedData() {
  const {composite, full, key} = yield select(state => state.nutritionReducer)
  let user = Config.DEBUG ? 'test' : 'anonymous'
  firebase.database().ref('/global/nutritionLabel/'+user+'/'+key).update({
    composite,
    full
  })
}

function* completeMatchDropdownChange() {
  while (true) {
    const {tag, value} = yield take(COMPLETE_DROPDOWN_CHANGE)
    const {nutritionModel, ingredientControlModels, matchData} = yield select(state => state.modelReducer)
    // 1. Save the current ingredient key for deletion at the end of this
    //    process:
    const ingredientControlModel = ingredientControlModels[tag]
    let ingredientKeyToDelete = ingredientControlModel.getDropdownMatchValue()
    let ingredientModelToDelete = nutritionModel.getIngredientModel(tag)
    // 2. Create a new IngredientModel:
    let tTag = matchData[tag]
    let dataForKey = tupleHelper.getDataForDescription(tTag, value)
    let ingredientModel = new IngredientModel()
    ingredientModel.initializeSingle(value, tag, dataForKey)
    // 3. Update the match value state for the dropdown:
    yield put ({type: IM_SET_DROPDOWN_MATCH_VALUE, tag, value})
    // 4. Update the dropdown units and unit value:
    //
    //    a. Get the list of new measurement units that are possible:
    let newMeasureUnit = mapToSupportedUnits(ingredientModel.getMeasureUnit())
    let newUnits = getPossibleUnits(newMeasureUnit)
    yield put ({type: IM_SET_DROPDOWN_UNITS, tag, units: newUnits})
    //    b. See if the current unit is within the new possibilies, if not
    //       then set to the FDA measure defaults
    //    (TODO: or perhaps fallback to the recipe amount/unit if they worked)
    const currentValue = ingredientControlModel.getSliderValue()
    const currentUnit = ingredientControlModel.getDropdownUnitValue()
    let newUnit = currentUnit
    if (! newUnits.includes(currentUnit)) {
      newUnit = newMeasureUnit
      yield put ({type: IM_SET_DROPDOWN_UNITS, tag, units: newUnit})
    }
    // 5. Remove the current IngredientModel from the NutritionModel:
    yield put ({type: NM_REM_INGREDIENT, tag})
    // 6. Add the new IngredientModel to the NutritionModel:
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User added dropdown ingredient',
      nonInteraction: false,
      label: tag
    });
    yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: currentValue, unit: newUnit, append: true})
  }
}

function* changesFromAppend(tag) {
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2
  const {matchData} = yield select(state => state.modelReducer)
  const tagMatches = matchData[tag]
  if (tagMatches.length === 0) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'No ellipses results returned',
      nonInteraction: false,
      label: tag
    });
    return
  }
  const description = tagMatches[0][descriptionOffset]
  const dataForKey = tagMatches[0][dataObjOffset]
  let ingredientModel = new IngredientModel()
  ingredientModel.initializeSingle(description, tag, dataForKey)
  const measureQuantity = ingredientModel.getMeasureQuantity()
  const measureUnit = ingredientModel.getMeasureUnit()
  yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: measureQuantity, unit: measureUnit, append: true})
  let ingredientControlModel =
    new IngredientControlModel(
          measureQuantity,
          getPossibleUnits(measureUnit),
          measureUnit,
          tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
          description)
  yield put ({type: IM_ADD_CONTROL_MODEL, tag, ingredientControlModel})
}

function* changesFromSearch() {
  const {matchData, searchIngredient} = yield select(state => state.modelReducer)
  let {selectedTags, unmatchedTags} = yield select(state => state.modelReducer)
  // TODO: refactor and combine
  // Tuple offsets for firebase data in nutrition reducer:
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2
  // Check that the first dataObject is not undefined (modified from non-lazy
  // load where every match was checked)
  const firstMatch = 0
  const tag = searchIngredient
  const tagMatches = matchData[tag]
  if (tagMatches.length === 0) {
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'No search results returned',
      nonInteraction: false,
      label: searchIngredient
    });
    if (unmatchedTags.indexOf(tag) === -1) {
      unmatchedTags.push(tag)
      yield put ({type: UNUSED_TAGS, tags: unmatchedTags})
    }
    return
  }
  // We use the first value in the list (assumes elastic search returns results
  // in closest match order)
  const description = tagMatches[0][descriptionOffset]
  const dataForKey = tagMatches[0][dataObjOffset]
  let ingredientModel = new IngredientModel()
  ingredientModel.initializeSingle(description, tag, dataForKey)
  let measureQuantity = ingredientModel.getMeasureQuantity()
  let measureUnit = ingredientModel.getMeasureUnit()
  let tryQuantity = measureQuantity
  let tryUnit = measureUnit
  let errorStr = ''
  try {
    yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: tryQuantity, unit: tryUnit, append: false})
  }
  catch(err) {
    errorStr = err
  }
  finally {
    // We failed to add the ingredient with the specified quantity/unit, so try
    // using the FDA values (not try/catch--if this fails we have a serious internal
    // error--i.e. this should always work.)
    if (errorStr !== '') {
      tryQuantity = measureQuantity
      tryUnit = measureUnit
      yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: tryQuantity, unit: tryUnit, append: false})
    }
  }
  ReactGA.event({
    category: 'Nutrition Mixer',
    action: 'Search results added to label',
    nonInteraction: false,
    label: searchIngredient
  });
  let ingredientControlModel = new IngredientControlModel(
    tryQuantity,
    getPossibleUnits(tryUnit),
    tryUnit,
    tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
    description)
  yield put ({type: IM_ADD_CONTROL_MODEL, tag, ingredientControlModel})
  const {servingsControls} = yield select(state => state.servingsControlsReducer)
  yield put ({type: NM_SET_SERVINGS, value: servingsControls['value'], units: servingsControls['unit']})
  selectedTags.push(tag)
  yield put ({type: SELECTED_TAGS, tags: selectedTags})
}

function* getDataFromFireBase(foodName, ingredient, key, index, userSearch, append) {
  const path = 'global/nutritionInfo/' + key
  const flag = (yield call(db.getPath, path)).exists()
  if (flag) {
    const data = (yield call(db.getPath, path)).val()
    if (index) {
      yield put ({type: LAZY_LOAD_FIREBASE, foodName, ingredient, index, data})
      yield put ({type: COMPLETE_DROPDOWN_CHANGE, tag: ingredient, value: foodName})
    }
    else {
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data, userSearch, append})
      if (append)
        yield call (changesFromAppend, foodName)
      else if (userSearch)
        yield call (changesFromSearch)
    }
  }
  else {
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient, data: [], userSearch, append})
  }
}

const elasticSearchFetch = (request) => {
  return fetch(request)
  .then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function(json) {
        return json
      });
    } else {
      //console.log("Unexpected server response (non-JSON object returned)");
    }
  })
}

function* fallbackSearch(searchIngredient, foodName, size, userSearch, append, fallback, tokenize, parse) {
  const token = foodName.split(",")
  if (token[0] && tokenize) {
    yield fork(callElasticSearchLambda, token[0], foodName, size, userSearch, append, true, false, true)
  }
  else if (parse) {
    const regex = /[^\r\n]+/g
    const file = require("raw-loader!../data/ingredients.txt")
    const fileWords = new Set(file.match(regex))
    let results = []
    for (let i of fileWords) {
      if (i.match(searchIngredient + '.?') || searchIngredient.indexOf(i) !== -1) {
        results.push(i)
      }
    }
    if (results.length) {
      const levenshtein = require('fast-levenshtein')
      let sortedData = []
      for (let i of results) {
        let d = levenshtein.get(foodName, i)
        sortedData.push({info: i, distance: d})
      }
      sortedData.sort(function(a, b) {
        return a.distance - b.distance
      })
      yield fork(callElasticSearchLambda, sortedData[0].info, foodName, size, userSearch, append, false, false, false)
    }
    else {
      yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: [], append})
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient: '', data: [], userSearch, append})
    }
  }
}

function* callElasticSearchLambda(searchIngredient, foodName, size, userSearch, append, fallback, tokenize, parse) {
  // Call elastic search (effectively this curl request):
  //
  // curl Config.ELASTIC_LAMBDA_URL
  //      -X POST
  //      -d '{"query": {"match": {"Description": "nutritional yeast"}}, "size": 10}'
  //      --header 'content-type: application/json'
  //
  const url = Config.ELASTIC_LAMBDA_URL
  const search = {
    'query': {'match' : {'Description': searchIngredient}},
    'size': size
  }
  let myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  // From MDN and here: https://github.com/matthew-andrews/isomorphic-fetch/issues/34
  let request = new Request(url, {
    method: 'POST',
    body: JSON.stringify(search),
    headers: myHeaders,
    mode: 'cors',
    cache: 'default'
  })
  const json = yield call (elasticSearchFetch, request)
  // TODO: possibly need to preserve the order of the results (the parallel get and
  // object construction in nutritionReducer destroys this.)
  let {data} = json
  var levenshtein = require('fast-levenshtein');
  let sortedData = []
  for (let i of data) {
    var res = i._source.Description.split(",")
    var spr = res[0].split(" ")
    let d = levenshtein.get(foodName, spr[0])
    sortedData.push({info: i, distance: d})
  }
  if (sortedData[0]) {
    sortedData.sort(function(a, b) {
      return a.distance - b.distance;
    })
    const {matchData} = yield select(state => state.modelReducer)
    const length = matchData[foodName] ? matchData[foodName].length : 0
    if (sortedData.length > length) {
      yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: sortedData, append})
      yield fork(getDataFromFireBase, foodName, sortedData[0].info._source.Description, sortedData[0].info._id, 0, userSearch, append)
    }
    else {
      yield put ({type: REMOVE_ELLIPSES, foodName})
    }
  }
  else if (fallback) {
    yield fork(fallbackSearch, searchIngredient, foodName, 5, userSearch, append, fallback, tokenize, parse)
  }
  else {
    yield put ({type: INITIALIZE_FIREBASE_DATA, foodName, data: [], append})
    yield put ({type: INGREDIENT_FIREBASE_DATA, foodName, ingredient: '', data: [], userSearch, append})
  }
}

function* fetchMoreData() {
  while (true) {
    const {foodName, size} = yield take(GET_MORE_DATA)
    const userSearch = false
    const append = true
    const fallback = false
    const tokenize = false
    const parse = false
    yield fork(callElasticSearchLambda, foodName, foodName, size+5, userSearch, append, fallback, tokenize, parse)
  }
}

function* lazyFetchFirebaseData() {
  while (true) {
    const {foodName, ingredient, key, index} = yield take(LAZY_FETCH_FIREBASE)
    yield fork(getDataFromFireBase, foodName, ingredient, key, index)
  }
}

function* changesFromRecipe() {
  const {parsedData} = yield select(state => state.nutritionReducer)
  const {matchData} = yield select(state => state.modelReducer)
  if (Object.keys(matchData).length === Object.keys(parsedData).length) {
    const {missingData} = yield select(state => state.nutritionReducer)
    // TODO: refactor and combine
    // Tuple offsets for firebase data in nutrition reducer:
    const descriptionOffset = 0
    const keyOffset = 1
    const dataObjOffset = 2
    // Check that the first dataObject is not undefined (modified from non-lazy
    // load where every match was checked)
    const firstMatch = 0
    for (let tag in matchData) {
      if (matchData[tag].length === 0) {
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Missing data for ingredient',
          nonInteraction: false,
          label: tag
        });
        continue
      }
      if (matchData[tag][firstMatch][dataObjOffset] === undefined) {
        return
      }
    }
    let selectedTags = []
    for (let tag in matchData) {
      const tagMatches = matchData[tag]
      // We use the first value in the list (assumes elastic search returns results
      // in closest match order)
      //const key = tagMatches[0][keyOffset]
      if (tagMatches.length === 0) {
        if (missingData.indexOf(tag) === -1) {
          missingData.push(tag)
          ReactGA.event({
            category: 'Nutrition Mixer',
            action: 'Missing data for ingredient',
            nonInteraction: false,
            label: tag
          });
        }
        continue
      }
      const description = tagMatches[0][descriptionOffset]
      const dataForKey = tagMatches[0][dataObjOffset]
      let ingredientModel = new IngredientModel()
      ingredientModel.initializeSingle(description, tag, dataForKey)
      let measureQuantity = ingredientModel.getMeasureQuantity()
      let measureUnit = ingredientModel.getMeasureUnit()
      let tryQuantity = measureQuantity
      let tryUnit = measureUnit
      let parseQuantity = undefined
      let parseUnit = undefined
      for (let i = 0; i < parsedData.length; i++) {
        const parseObj = parsedData[i]
        const foodName = parseObj['name']
        if (foodName === tag) {
          // Sometimes the parseObj returns things like 'toTaste=true' and no
          // amount or unit fields. TODO: we should probably exclude those tags/
          // ingredients from the label in MVP3 or put them in their own bucket.
          if ('amount' in parseObj) {
            if ((parseObj['amount'].hasOwnProperty('min')) &&
                 parseObj['amount'].hasOwnProperty('max')) {
              const parseMinQuantity = rationalToFloat(parseObj['amount'].min)
              const parseMaxQuantity = rationalToFloat(parseObj['amount'].max)
              parseQuantity = (parseMinQuantity + parseMaxQuantity) / 2.0
            } else {
              parseQuantity = rationalToFloat(parseObj['amount'])
            }
          }
          if ('unit' in parseObj) {
            parseUnit = mapToSupportedUnitsStrict(parseObj['unit'])
          }
          if ((parseQuantity !== undefined) && (parseQuantity !== "") && (!isNaN(parseQuantity))) {
            //console.log(tag + ', setting measureQuantity to parseQuantity: ' + parseQuantity);
            tryQuantity = parseQuantity
          }
          if ((parseUnit !== undefined) && (parseUnit !== "")) {
            //console.log(tag + ', setting measureUnit to parseUnit: ' + parseUnit);
            tryUnit = parseUnit
          }
          break
        }
      }
      let errorStr = ''
      try {
        yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: tryQuantity, unit: tryUnit, append: false})
      }
      catch(err) {
        errorStr = err
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Error adding ingredient',
          nonInteraction: false,
          label: tag
        });
      }
      finally {
        // We failed to add the ingredient with the specified quantity/unit, so try
        // using the FDA values (not try/catch--if this fails we have a serious internal
        // error--i.e. this should always work.)
        if (errorStr !== '') {
          tryQuantity = measureQuantity
          tryUnit = measureUnit
          yield put ({type: NM_ADD_INGREDIENT, tag, ingredientModel, quantity: tryQuantity, unit: tryUnit, append: false})
        }
      }
      let ingredientControlModel = new IngredientControlModel(
        tryQuantity,
        getPossibleUnits(tryUnit),
        tryUnit,
        tupleHelper.getListOfTupleOffset(tagMatches, descriptionOffset),
        description)
      yield put ({type: IM_ADD_CONTROL_MODEL, tag, ingredientControlModel})
      selectedTags.push(tag)
    }
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'User recipe parsed',
      nonInteraction: false,
    });
    const {servingsControls} = yield select(state => state.servingsControlsReducer)
    yield put ({type: NM_SET_SERVINGS, value: servingsControls['value'], units: servingsControls['unit']})
    yield put ({type: SELECTED_TAGS, tags: selectedTags})
    yield put ({type: UNUSED_TAGS, tags: missingData})
  }
}

function* processParseForLabel() {
  // Get the parse data out of the nutrition reducer and call elastic search on
  // it to build the following structure:
  //   [
  //     'Green Onion' : ['dbKey1', 'dbKey2' ...],
  //     'red bean' : ['dbKey1', ...],
  //     'yakisoba' : []
  //   ]
  const {parsedData} = yield select(state => state.nutritionReducer)
  for (let i = 0; i < parsedData.length; i++) {
    const parseObj = parsedData[i]
    const foodName = parseObj['name']
    yield put({type: CLEAR_FIREBASE_DATA})
    const userSearch = false
    const append = false
    const fallback = true
    const size = 5
    const tokenize = true
    const parse = true
    yield fork(callElasticSearchLambda, foodName, foodName, size, userSearch, append, fallback, tokenize, parse)
  }
}

function* userSearchIngredient() {
  while (true) {
    const {searchIngredient} = yield take(SEARCH_INGREDIENT)
    const userSearch = true
    const append = false
    const fallback = true
    if (searchIngredient) {
      const size = 5
      const tokenize = false
      const parse = false
      yield fork(callElasticSearchLambda, searchIngredient, searchIngredient, size, userSearch, append, fallback, tokenize, parse)
    }
    else {
      yield put ({type: INITIALIZE_FIREBASE_DATA, foodName: searchIngredient, data: [], append})
      yield put ({type: INGREDIENT_FIREBASE_DATA, foodName: searchIngredient, ingredient: '', data: [], userSearch, append})
    }
  }
}

function* lambdaHack() {
  if (!Config.DEBUG) {
    const url = Config.ELASTIC_LAMBDA_URL
    const search = {
      'query': {'match' : {'Description': 'kale'}},
      'size': 1
    }
    let myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    let request = new Request(url, {
      method: 'POST',
      body: JSON.stringify(search),
      headers: myHeaders,
      mode: 'cors',
      cache: 'default'
    })
    yield call (elasticSearchFetch, request)
  }
}

function* sendEmail () {
  const {data} = yield take(GET_EMAIL_DATA)
  var params = {
    Destination: { /* required */
      ToAddresses: [
        'info@inphood.com',
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Data: data, /* required */
        },
        Text: {
          Data: data, /* required */
        }
      },
      Subject: { /* required */
        Data: 'Feedback Email', /* required */
      }
    },
    Source: 'no-reply@inphood.com', /* required */
    Tags: [
      {
        Name: 'STRING_VALUE', /* required */
        Value: 'STRING_VALUE' /* required */
      },
    ]
  }
  const ses = new SES({
    accessKeyId:     Config.AWS_ACCESS_ID,
    secretAccessKey: Config.AWS_SECRET_KEY,
    region: 'us-west-2',
  })
  ses.sendEmail(params, function(err, data) {
    if(err)
      throw err
    console.log('Email sent:', data);
  })
}

export default function* root() {
  yield call(lambdaHack)
  yield fork(lazyFetchFirebaseData)
  yield fork(userSearchIngredient)
  yield fork(fetchMoreData)
  yield fork(completeMatchDropdownChange)
  yield fork(takeLatest, INGREDIENT_FIREBASE_DATA, changesFromRecipe)
  yield fork(takeLatest, INIT_EMAIL_FLOW, sendEmail)
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadSerializedData)
  yield fork(takeLatest, UPLOAD_PHOTO, loadAWSPut)
  yield fork(takeLatest, STORE_PARSED_DATA, processParseForLabel)
}
