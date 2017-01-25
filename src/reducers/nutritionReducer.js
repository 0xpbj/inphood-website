import {
  AN_CLEAR_DATA,
  ADD_CAPTION,
  AN_SELECTED_PHOTO,
  SELECTED_PHOTO,
  IG_UPDATED_CAPTION,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  INGREDIENT_FIREBASE_DATA
} from '../constants/ActionTypes'

const initialState = {
  link: '',
  picture: '',
  caption: '',
  updatedCaption: '',
  username: '',
  anonymous: false,
  resultUrl: '',
  key: '',
  composite: '',
  full: '',
  index: 0,
  parsedData: [],
  matchData: {}
}
export default function nutrition(state = initialState, action) {
  switch (action.type) {
    case AN_CLEAR_DATA:
      return {
        ...initialState
      }
    case ADD_CAPTION:
      return {
        ...state,
        caption: action.caption
      }
    case AN_SELECTED_PHOTO:
      return {
        ...state,
        anonymous: true,
        picture: action.photo,
        link: '',
        username: 'anonymous',
      }
    case SELECTED_PHOTO:
      return {
        ...state,
        index: action.index,
        link: action.photo.link,
        picture: action.photo.picture,
        caption: action.photo.caption.text,
        username: action.photo.user.username
      }
    case IG_UPDATED_CAPTION:
      return {
        ...state,
        updatedCaption: action.caption
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
        parsedData: action.parsedData
      }
    case INGREDIENT_FIREBASE_DATA:
      // Data structure:
      //
      //  matchData: {
      //    searchTerm1: {
      //      description1: { ndbNo1 },
      //      description2: { ndbNo2 },
      //      ...
      //    },
      //    searchTerm2: {
      //      description1: { ndbNo1 },
      //      ...
      //    },
      //    ...
      //  }
      let localMatchData = state.matchData
      if (action.searchTerm in localMatchData) {
        localMatchData[action.searchTerm][action.ingredient] = action.data
      } else {
        localMatchData[action.searchTerm] = {}
        localMatchData[action.searchTerm][action.ingredient] = action.data
      }

      return {
        ...state,
        matchData: localMatchData
      }
    default:
      return state
  }
}
