import {
  CLEAR_DATA,
  SELECTED_PHOTO,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  SET_PARSED_DATA
} from '../constants/ActionTypes'

const initialState = {
  resultUrl: '',
  key: '',
  composite: '',
  full: '',
  parsedData: [],
  rawData: [],
  newData: [],
  missingData: []
}
export default function nutrition(state = initialState, action) {
  switch (action.type) {
    case CLEAR_DATA:
      return {
        resultUrl: '',
        key: '',
        composite: '',
        full: '',
        parsedData: [],
        rawData: [],
        newData: [],
        missingData: []
      }
    case RESULT_URL:
      return {
        ...state,
        resultUrl: action.url,
        key: action.key,
      }
    case SEND_SERIALIZED_DATA:
      return {
        ...state,
        composite: action.composite,
        full: action.full
      }
    case SET_PARSED_DATA:
      return {
        ...state,
        parsedData: action.parsedData
      }
    case STORE_PARSED_DATA:
      return {
        ...state,
        parsedData: [...state.parsedData, ...action.parsedData],
        rawData: state.rawData.concat(action.rawData),
        newData: action.parsedData,
        missingData: [...state.missingData, ...action.missingData]
      }
    default:
      return state
  }
}
