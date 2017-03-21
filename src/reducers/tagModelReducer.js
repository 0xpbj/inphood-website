import {
  MODEL_RESET,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  SELECTED_TAGS,
  DELETED_TAGS,
  UNUSED_TAGS,
  REPLACED_TAGS,
  LAZY_FETCH_FIREBASE,
  LAZY_LOAD_FIREBASE,
  SET_FDA_RESULTS,
  PARSE_SEARCH_DATA,
  GET_MORE_DATA,
  SUPER_SEARCH_RESULTS,
  REM_MATCH_RESULT_MODEL
} from '../constants/ActionTypes'

import {MatchResultsModel, SearchResult} from '../components/models/MatchResultsModel'

const initialState = {
  matchResultsModel: new MatchResultsModel(),
  lazyLoadOperation: {
    status: '',
    tag: undefined,
    value: undefined
  },
  modelSetup: false,
  userSearch: false,
  selectedTags: [],
  unusedTags: [],
  deletedTags: [],
  replacedTags: [],
  append: false,
  tag: ''
}

export default function modelFun(state = initialState, action) {
  switch (action.type) {
    case MODEL_RESET:
    {
      return {
        matchResultsModel: new MatchResultsModel(),
        lazyLoadOperation: {
          status: '',
          tag: undefined,
          value: undefined
        },
        modelSetup: false,
        userSearch: false,
        selectedTags: [],
        unusedTags: [],
        deletedTags: [],
        replacedTags: [],
        append: false,
        tag: ''
      }
    }
    case SUPER_SEARCH_RESULTS:
      return {
        ...state,
        tag: action.ingredient,
        matchResultsModel: action.matchResultsModel,
      }
    case GET_MORE_DATA:
    {
      return {
        ...state,
        tag: action.foodName
      }
    }
    case SELECTED_TAGS:
    {
      return {
        ...state,
        selectedTags: action.tags
      }
    }
    case DELETED_TAGS:
    {
      return {
        ...state,
        deletedTags: action.tags
      }
    }
    case UNUSED_TAGS:
    {
      return {
        ...state,
        unusedTags: action.tags
      }
    }
    case REPLACED_TAGS:
    {
      return {
        ...state,
        replacedTags: action.tags
      }
    }
    // case REM_MATCH_RESULT_MODEL:
    // {
    //   let {matchResultsModel} = state
    //   matchResultsModel._searches[action.tag] = []
    //   return {
    //     ...state,
    //     matchResultsModel
    //   }
    // }
    case INITIALIZE_FIREBASE_DATA:
    {
      // Initializes our dictionary of match data with ordered arrays of tuples
      // containing the description, ndbNo and undefined:
      // Clear the match data to prevent populating it twice on 'back' button actions etc.
      let {matchResultsModel} = state
      const searchTerm = action.foodName
      if (matchResultsModel.hasResults(searchTerm) && !action.append) {
        // TODO: can we just return and skip the ...state since nothing changes?
        return {
          ...state
        }
      }
      if (action.append) {
        matchResultsModel._searches[searchTerm] = []
      }
      matchResultsModel.addSearch(searchTerm)
      for (let obj of action.data) {
        const description = obj._source.Description
        const ndbNo = obj._id
        const searchResult = new SearchResult(description, ndbNo)
        matchResultsModel.appendSearchResult(searchTerm, searchResult)
      }
      // Insert ellipses for ellipses search
      if (action.data.length !== 0 && !action.append) {
        const searchResult = new SearchResult('.....', '-1')
        matchResultsModel.appendSearchResult(searchTerm, searchResult)
      }
      return {
        ...state,
        matchResultsModel
      }
    }
    case LAZY_FETCH_FIREBASE:
    {
      let lazyLoadOperation = {
        status: 'inProgress',
        tag: action.ingredient,
        value: action.foodName
      }

      return {
        ...state,
        lazyLoadOperation: lazyLoadOperation
      }
    }
    case LAZY_LOAD_FIREBASE:
    {
      let {matchResultsModel, lazyLoadOperation} = state
      matchResultsModel.defineSearchResultObject(action.ingredient,
                                                 action.index,
                                                 action.data)
      lazyLoadOperation.status = 'done'

      return {
        ...state,
        matchResultsModel,
        lazyLoadOperation: lazyLoadOperation
      }
    }
    case INGREDIENT_FIREBASE_DATA:
    {
      // Performs an ordered insertion of the data returned by firebase for the
      // key (ndbNo) returned from elastic search:
      const searchTerm = action.foodName
      const description = action.ingredient
      let {matchResultsModel} = state
      if (!matchResultsModel.defineSearchResultObjectForDesc(searchTerm,
                                                             description,
                                                             action.data)) {
      }

      return {
        ...state,
        matchResultsModel,
        userSearch: action.userSearch,
        append: action.append
      }
    }
    case SET_FDA_RESULTS:
    {
      console.log('tagModelReducer SET_FDA_RESULTS:');
      console.log('-----------------------------------------------------------');
      const fdaBrandedResults = action.results
      const {matchResultsModel} = state
      if (fdaBrandedResults.hasOwnProperty('count') &&
          fdaBrandedResults.hasOwnProperty('foods')) {

        if (fdaBrandedResults.count > 0) {
          if (!matchResultsModel.hasSearchTerm(action.searchTerm)) {
            matchResultsModel.addSearch(action.searchTerm)
          }

          for (const brandedFoodResult of fdaBrandedResults.foods) {
            const foodObject = brandedFoodResult.food

            if (!(foodObject.hasOwnProperty('desc')
                  && foodObject.desc.hasOwnProperty('name')
                  && foodObject.desc.hasOwnProperty('ndbno')
                  && foodObject.hasOwnProperty('nutrients'))) {
              continue
            }

            let searchResult = new SearchResult(foodObject.desc.name, foodObject.desc.ndbno)
            searchResult.setBrandedDataObj(foodObject)
            matchResultsModel.appendSearchResult(action.searchTerm, searchResult)
          }
        }
      }

      return {
        ...state,
        matchResultsModel,
        results: action.results
      }
    }
    default:
      return state
  }
}
