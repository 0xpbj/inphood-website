import {
  MODEL_RESET,
  CLEAR_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  SET_FDA_RESULTS,
  LAZY_LOAD_FIREBASE,
  LAZY_FETCH_FIREBASE,
  RESET_LAZY_LOAD_STATUS,
  SEARCH_INGREDIENT,
  RESET_SEARCH_FLAG,
  SELECTED_TAGS,
  UNUSED_TAGS,
  GET_MORE_DATA,
  RESET_APPEND_DATA,
  REMOVE_ELLIPSES
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
  searchIngredient: '',
  selectedTags: [],
  unusedTags: [],
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
        searchIngredient: '',
        selectedTags: [],
        unusedTags: [],
        append: false,
        tag: ''
      }
    }
    case CLEAR_FIREBASE_DATA:
    {
      return {
        ...state,
        tag: '',
        matchResultsModel: new MatchResultsModel()
      }
    }
    case RESET_APPEND_DATA:
    {
      return {
        ...state,
        append: false,
        tag: ''
      }
    }
    case GET_MORE_DATA:
    {
      return {
        ...state,
        tag: action.foodName
      }
    }
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
      if (action.data.length !== 0 && !action.userSearch && !action.remEllipses) {
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
    case RESET_LAZY_LOAD_STATUS:
    {
      return {
        ...state,
        lazyLoadOperation: {
          status: 'idle',
          tag: undefined,
          value: undefined
        }
      }
    }
    case RESET_SEARCH_FLAG:
    {
      console.log('RESET_SEARCH_FLAG --------------------------------------');
      return {
        ...state,
        userSearch: false,
        searchIngredient: ''
      }
    }
    case SEARCH_INGREDIENT:
    {
      console.log('SEARCH_INGREDIENT: ' + action.searchIngredient + '-------------');
      return {
        ...state,
        searchIngredient: action.searchIngredient
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
        // console.log('error in INGREDIENT_FIREBASE_DATA');
        // console.log(action.foodName);
        // console.log(matchResultsModel.toString());
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
    case SELECTED_TAGS:
    {
      return {
        ...state,
        selectedTags: action.tags
      }
    }
    case UNUSED_TAGS:
    {
      return {
        ...state,
        unusedTags: action.tags
      }
    }
    default:
      return state
  }
}
