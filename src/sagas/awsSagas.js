import {
  SAVE_LABEL_AWS,
  SET_SHARE_URL
} from '../constants/ActionTypes'

import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
const firebase = require('firebase')
const Config = require('Config')
const S3 = require('aws-sdk').S3
import ReactGA from 'react-ga'
import domtoimage from 'dom-to-image'
import html2canvas from 'html2canvas'
import { delay } from 'redux-saga'
import {mobileCheck, isChrome} from '../helpers/clientCheck'


const getDomJpeg = () => {
  return domtoimage.toJpeg(document.getElementById('nutrition-label'), { quality: 1.0 })
  .then(data => ({data}))
  .catch(error => console.error(error));
}

const getCanvas = () => {
  return html2canvas(document.getElementById('nutrition-label'))
  .then(canvas => ({canvas}))
}

const uploadToAWS = (data, key, format, extension) => {
  const s3 = new S3({
    accessKeyId:     Config.AWS_ACCESS_ID,
    secretAccessKey: Config.AWS_SECRET_KEY,
    region: 'us-west-2',
  })
  const params = {
    Bucket: 'inphoodlabelimagescdn',
    Key: key + '/' + format +  extension,
    Body: data,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  }
  s3.upload(params, (error, info) => {
    console.log('Error: ', error);
    console.log('Data:  ', info);
  })
}

const labelTypeConstant = {
  0 : 'standard',
  1 : 'complete',
  2 : 'micronut',
  3 : 'sugarmic',
  4 : 'text',
  5 : 'personal'
}

function* loadLabelToAWS() {
  const {key} = yield select(state => state.nutritionReducer)
  const {nutritionModel} = yield select(state => state.nutritionModelReducer)
  const labelType = nutritionModel.getLabelType()
  const labelFormat = labelTypeConstant[labelType]
  const extension = '.jpeg'
  let buffer
  ReactGA.event({
    category: 'Label',
    action: 'User saving label',
    nonInteraction: false,
    label: labelFormat
  });
  if (isChrome() && !mobileCheck()) {
    const {data} = yield call (getDomJpeg)
    buffer = new Buffer(data.replace(/^data:image\/\w+;base64,/, ""),'base64')
  }
  else {
    const {canvas} = yield call (getCanvas)
    const data = canvas.toDataURL('image/jpeg')
    buffer = new Buffer(data.replace(/^data:image\/\w+;base64,/, ""),'base64')
  }
  yield call (uploadToAWS, buffer, key, labelFormat, extension)
  const url = 'http://www.image.inphood.com/' + key + '/' + labelFormat + extension
  const shareUrl = <a href={url} target='_blank'>{url}</a>
  const embedUrl = '<a href=\'https://www.inphood.com\' target=\'_blank\'><img width="340" src=\''+url+'\'/></a>'
  yield call(delay, 500)
  yield put ({type: SET_SHARE_URL, shareUrl, embedUrl})
}

export default function* root() {
  yield fork(takeLatest, [SAVE_LABEL_AWS], loadLabelToAWS)
}