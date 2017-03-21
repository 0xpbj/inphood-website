import {
  INIT_EMAIL_FLOW,
  GET_EMAIL_DATA,
} from '../constants/ActionTypes'

import ReactGA from 'react-ga'
import { fork, take, takeLatest } from 'redux-saga/effects'
const SES = require('aws-sdk').SES
const Config = require('Config')

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
  // yield fork(takeLatest, INIT_EMAIL_FLOW, sendEmail)
}