import {
  IG_UPLOAD_PHOTO,
  POST_LABEL_ID,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  INGREDIENT_FIREBASE_DATA
} from '../constants/ActionTypes'

import * as db from './firebaseCommands'
import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import firebase from 'firebase'
import request from 'request'
import Hello from 'hellojs'
const Config = require('Config')
var AWS = require('aws-sdk')

const firebaseLogin = () => {
  return firebase.auth().signInAnonymously()
  .then(user => ({ user }))
  .catch(error => ({ error }))
}

const uploadImageToS3 = (uri, key, username, thumbnail) => {
  var s3 = new AWS.S3({
    accessKeyId:     Config.AWS_ACCESS_ID,
    secretAccessKey: Config.AWS_SECRET_KEY,
    region: 'us-west-2',
  })
  var options = {
    uri: uri,
    encoding: null
  }
  request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log("failed to get image", error);
      firebase.database().ref('/global/nutritionLabel/'+username+'/'+key).update({
        key,
        user: username,
        oUrl: uri,
        iUrl: '',
        thumbnail
      })
    }
    else {
      s3.putObject({
        Body: body,
        Key: username + '/' + key + '.jpg',
        ACL: "public-read",
        Bucket: "inphoodlabelimagescdn",
        ContentType: "image/jpeg"
      }, function(error, data) {
        if (error) {
          console.log("error downloading image to s3", error);
          firebase.database().ref('/global/nutritionLabel/'+username+'/'+key).update({
            key,
            user: username,
            oUrl: uri,
            iUrl: '',
            thumbnail
          })
        } else {
          console.log("success uploading to s3", data)
        }
      })
      console.log('Thumbnail: ', thumbnail);
      firebase.database().ref('/global/nutritionLabel/'+username+'/'+key).update({
        key,
        user: username,
        oUrl: uri,
        iUrl: 'http://www.image.inphood.com/' + username + '/' + key + '.jpg',
        thumbnail
      })
    }
  })
}

function* loadAWSPut() {
  const {profile} = yield select(state => state.userReducer)
  const {link, picture, username} = yield select(state => state.nutritionReducer)
  const slink = link.slice(0, link.length - 1)
  yield call (firebaseLogin)
  let key = ''
  let thumbnail = ''
  if (!profile) {
    key = firebase.database().ref('/global/nutritionLabel/anonymous').push().key
  }
  else {
    key = slink.substring(slink.lastIndexOf('/')+1)
    thumbnail = profile.thumbnail
  }
  yield call (uploadImageToS3, picture, key, username, thumbnail)
  const url = "http://www.inphood.com/" + key
  if (profile)
    yield put ({type: RESULT_URL, url, key, anonymous: false})
  else
    yield put ({type: RESULT_URL, url, key, anonymous: true})
}

function* loadSerializedData() {
  const {composite, full, key, anonymous,username} = yield select(state => state.nutritionReducer)
  if (anonymous)
    firebase.database().ref('/global/nutritionLabel/anonymous/'+key).update({
      composite,
      full
    })
  else
    firebase.database().ref('/global/nutritionLabel/'+username+'/'+key).update({
      composite,
      full
    })
}

function* postLabelData() {
  while (true) {
    const {labelId, comment} = yield take (POST_LABEL_ID)
    const token = Hello('instagram').getAuthResponse().access_token
    const url = 'https://api.instagram.com/v1/media/' + labelId + '/comments'
    console.log('LabelId: ', labelId);
    console.log('Comment: ', comment);
    console.log('Token: ', token);
    console.log('URL: ', url);
    var options = {
      url: url,
      method: 'post',
      headers: {'Access-Control-Allow-Origin': 'http://127.0.0.1:3000'},
      // 'Access-Control-Allow-Origin': 'http://127.0.0.1:3000',
      form: {
        access_token: token,
        text: comment
      }
    }
    request(options, function(error, response, body) {
      console.log('Error: ', error);
      console.log('Response: ', response);
      console.log('Body: ', body);
    })
    // fetch(url, {
    //   mode: 'no-cors',
    //   method: 'post',
    //   form: {access_token: token, text: 'www.inphood.com/BPCIqRoDtV4'}
    // }).then(function(response) {
    //   console.log(response.status);
    //   console.log("response");
    //   console.log(response);
    // })
    // Hello( 'instagram' ).api( 'me/comments', 'post', {
    //   id: labelId,
    //   text: comment
    // })
    // .then(function(r) {
    //   if (r.meta.code === 200) {
    //     console.log('Comment Added');
    //   }
    // }, console.error.bind(console))
  }
}

// function* callElasticSearch(ingredient) {
//   // This is a bypass that should only be used for development when the lambda server
//   // is down. It is not publically accessible.
//
//   // Call elastic search, essentially this curl command:
//   //
//   //   curl -XPOST '35.167.212.47:9200/firebase/_search' -d '
//   //     {
//   //       "query": { "match": { "Description": "kale" } },
//   //       "size": 1
//   //     }'
//   //
//   const nonPublicUrl = '35.167.212.47:9200/firebase/_search'
//   const data = {
//     'query': {'match': {'Description': ingredient}},
//     'size': 20
//   }
//   let myHeaders = new Headers()
//   myHeaders.append('Content-Type', 'application/json')
//
//   let request = new Request(url, {
//     method: 'POST',
//     body: JSON.stringify(data),
//     headers: myHeaders,
//     mode: 'cors',
//     cache: 'default'
//   })
//
//   fetch(request)
//   .then(function)
// }

function* getDataFromFireBase(ingredient, key) {
  // call firebase:
  // const {userId, labelId} = yield take (GET_LABEL_ID)
  // const path = '/global/nutritionLabel/' + userId + '/' + labelId
  // const data = (yield call(db.getPath, path)).val()
  // yield put({type: LABEL_DATA, data})

  console.log('Trying to get data from Firebase: ------------------------');
  const path = 'global/nutritionInfo/' + key
  const data = (yield call(db.getPath, path)).val()
  console.log('Firebase data: -------------------------------------------');
  console.log('   from ' + path);
  console.log(data)
  yield put ({type: INGREDIENT_FIREBASE_DATA, ingredient, data})
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
      console.log("Unexpected server response (non-JSON object returned)");
    }
  })
}

function* callElasticSearchLambda(ingredient) {
  console.log('--------------------------------------------------------------')
  console.log('callElasticSearch on: ' + ingredient)

  // Call elastic search (effectively this curl request):
  //
  // curl https://da0wffelhb.execute-api.us-west-2.amazonaws.com/prod/ingredients
  //      -X POST
  //      -d '{"query": {"match": {"Description": "nutritional yeast"}}, "size": 10}'
  //      --header 'content-type: application/json'
  //
  //  TODO: fetch not supported in Safari; PBJ install this https://github.com/github/fetch
  //
  const productionUrl = 'https://da0wffelhb.execute-api.us-west-2.amazonaws.com/prod/ingredients'
  const debugUrl = 'https://tah21v2noa.execute-api.us-west-2.amazonaws.com/prod/ingredients'
  const url = debugUrl

  const data = {
    'query': {'match' : {'Description': 'kale'}},
    'size': 20
  }

  let myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  // From MDN and here: https://github.com/matthew-andrews/isomorphic-fetch/issues/34
  let request = new Request(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: myHeaders,
    mode: 'cors',
    cache: 'default'
  })
  const json = yield call (elasticSearchFetch, request)
  for (let index of json.data) {
    yield fork(getDataFromFireBase, ingredient, index._id)
  }
  // console.log('Calling getDataFromFireBase: ------------------------');
  // yield call(getDataFromFireBase, fakeIdForDevSpeed)
}

function filterOutNonFoodWords(foodPhrase) {
  const regex = /\w+/g
  let words = foodPhrase.match(regex)

  // TODO: look into best way to do this (i.e. if we're bombing memory with this
  //       list being allocated every time this is called, then restructure).
  const listOfFoods = require("raw-loader!../data/ingredients.txt")
  const foodWords = new Set(listOfFoods.match(regex))

  const foodIntersection = new Set([...words].filter(x => foodWords.has(x)))
  return [...foodIntersection]
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
  // for (let i = 0; i < parsedData.length; i++) {
  for (let i = 0; i < 1; i++) {
    const parseObj = parsedData[i]
    const foodName = parseObj['name']

    let searchTerm = foodName
    const foodWords = filterOutNonFoodWords(searchTerm)
    if (foodWords.length > 0) {
      searchTerm = foodWords.toString().replace(',', ' ')
    }

    // TODO: (uncomment when PBJ server works)
    yield fork(callElasticSearchLambda, searchTerm)
    // let fakeIdForDevSpeed = 43406
    // yield fork(getDataFromFireBase, fakeIdForDevSpeed)
  }

}

export default function* root() {
  // yield fork(postLabelData)
  yield fork(takeLatest, SEND_SERIALIZED_DATA, loadSerializedData)
  yield fork(takeLatest, IG_UPLOAD_PHOTO, loadAWSPut)
  yield fork(takeLatest, STORE_PARSED_DATA, processParseForLabel)
}
