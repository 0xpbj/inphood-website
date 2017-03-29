import {
  MODEL_RESET,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  UNUSED_TAGS,
  LAZY_FETCH_FIREBASE,
  LAZY_LOAD_FIREBASE,
  SET_FDA_RESULTS,
  PARSE_SEARCH_DATA,
  GET_MORE_DATA,
  SUPER_SEARCH_RESULTS,
  REM_MATCH_RESULT_MODEL,
  UPDATE_MATCH_RESULTS_MODEL,
  UPDATE_MATCH_RESULTS_SEARCH_INDEX
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
  unusedTags: [],
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
        unusedTags: [],
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
    case UNUSED_TAGS:
    {
      return {
        ...state,
        unusedTags: action.tags
      }
    }
    case UPDATE_MATCH_RESULTS_MODEL:
    {
      let {matchResultsModel} = state
      return {
        ...state,
        matchResultsModel
      }
    }
    case UPDATE_MATCH_RESULTS_SEARCH_INDEX:
    {
      let {matchResultsModel} = state
      matchResultsModel._searches[action.searchIngredient] = [matchResultsModel._searches[action.searchIngredient][action.index]]
      return {
        ...state,
        matchResultsModel
      }
    }
    case INITIALIZE_FIREBASE_DATA:
    {
      // Initializes our dictionary of match data with ordered arrays of tuples
      // containing the description, ndbNo and undefined:
      // Clear the match data to prevent populating it twice on 'back' button actions etc.
      let {matchResultsModel} = state
      const searchTerm = action.foodName
      if (matchResultsModel.hasResults(searchTerm)) {
        // TODO: can we just return and skip the ...state since nothing changes?
        return {
          ...state
        }
      }

      matchResultsModel.addSearch(searchTerm)
      for (let obj of action.data) {
        const displayDescription = obj.highlight.Description[0]
        const description = obj._source.Description
        const ndbNo = obj._id
        const searchResult = new SearchResult(description, ndbNo, displayDescription)
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
