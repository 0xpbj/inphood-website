import {
  AN_CLEAR_DATA,
  ADD_CAPTION,
  AN_SELECTED_PHOTO,
  SELECTED_PHOTO,
  IG_UPDATED_CAPTION,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  INITIALIZE_FIREBASE_DATA,
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
    //
    // FIREBASE DATA:
    // Data structure:
    //
    //  matchData: {
    //    searchTerm1: [
    //      [description1, ndbNo1, dataObj1],
    //      [description2, ndbNo2, dataObj2],
    //      ...
    //      ...
    //    ],
    //    searchTerm2: [
    //      [descriptionM, ndbNoM, dataObjM],
    //      [descriptionN, ndbNoN, dataObjN],
    //      ...
    //    ],
    //    ...
    //  }
    case INITIALIZE_FIREBASE_DATA:
      {
        console.log('nutritionReducer: INITIALIZE_FIREBASE_DATA --------------')
        console.log(action.searchTerm)
        console.log(action.json)

        // Initializes our dictionary of match data with ordered arrays of tuples
        // containing the description, ndbNo and undefined:

        // Clear the match data to prevent populating it twice on 'back' button actions etc.
        let localMatchData = state.matchData
        if (action.seachTerm in localMatchData) {
          return
        }

        localMatchData[action.searchTerm] = []

        for (let obj of action.json.data) {
          let dataEntry = [obj._source.Description, obj._id, undefined]
          localMatchData[action.searchTerm].push(dataEntry)
        }

        return {
          ...state,
          matchData: localMatchData
        }
      }
    //
    case INGREDIENT_FIREBASE_DATA:
      {
        // console.log('nutritionReducer: INGREDIENT_FIREBASE_DATA --------------')
        // console.log(action.searchTerm)
        // console.log(action.json)

        // Performs an ordered insertion of the data returned by firebase for the
        // key (ndbNo) returned from elastic search:

        const descriptionOffset = 0
        const dataObjOffset = 2

        let localMatchData = state.matchData
        if (action.searchTerm in localMatchData) {
          let searchTermArr = localMatchData[action.searchTerm]

          for (let tupleIdx = 0; tupleIdx < searchTermArr.length; tupleIdx++) {
            if (action.ingredient === searchTermArr[tupleIdx][descriptionOffset]) {
              searchTermArr[tupleIdx][dataObjOffset] = action.data
              break
            }
          }
        } else {
          console.log('nutritionReducer - error in INGREDIENT_FIREBASE_DATA');
          console.log(action.searchTerm);
          console.log(localMatchData.length);
        }

        return {
          ...state,
          matchData: localMatchData
        }
      }
    default:
      return state
  }
}
