import {
  CLEAR_DATA,
  SELECTED_PHOTO,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  CLEAN_REDUCERS,
  NM_RESET
} from '../constants/ActionTypes'

const initialState = {
  picture: '',
  resultUrl: '',
  key: '',
  composite: '',
  full: '',
  index: 0,
  rawData: '',
  title: '',
  dietary: '',
  allergen: '',
  parsedData: [],
  recipeFlag: false,
  file: '',
  missingData: []
}
export default function nutrition(state = initialState, action) {
  switch (action.type) {
    case CLEAN_REDUCERS:
    case CLEAR_DATA:
      return {
        picture: '',
        resultUrl: '',
        key: '',
        composite: '',
        full: '',
        index: 0,
        rawData: '',
        title: '',
        dietary: '',
        allergen: '',
        parsedData: [],
        recipeFlag: false,
        file: '',
        missingData: []
      }
    case SELECTED_PHOTO:
      return {
        ...state,
        file: action.photo,
        picture: action.photo.preview,
      }
    case RESULT_URL:
      return {
        ...state,
        resultUrl: action.url,
        key: action.key,
        anonymous: action.anonymous,
      }
    case SEND_SERIALIZED_DATA:
      return {
        ...state,
        composite: action.composite,
        full: action.full
      }
    case STORE_PARSED_DATA:
      return {
        ...state,
        parsedData: action.parsedData,
        rawData: action.rawData,
        recipeFlag: action.recipeFlag,
        title: action.title,
        dietary: action.dietary,
        allergen: action.allergen,
        missingData: action.missingData
      }
    default:
      return state
  }
}
