import {
  CLEAR_DATA,
  RESULT_KEY,
  STORE_PARSED_DATA,
  SET_PARSED_DATA
} from '../constants/ActionTypes'

const initialState = {
  key: '',
  parsedData: [],
  rawData: [],
  newData: [],
  missingData: []
}
export default function nutrition(state = initialState, action) {
  switch (action.type) {
    case CLEAR_DATA:
      return {
        key: '',
        parsedData: [],
        rawData: [],
        newData: [],
        missingData: []
      }
    case RESULT_KEY:
      return {
        ...state,
        key: action.key,
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
