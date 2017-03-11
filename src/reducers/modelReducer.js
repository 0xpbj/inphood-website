import {
  NM_RESET,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  NM_SET_SERVINGS,
  NM_SCALE_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  IM_UPDATE_MODEL,
  IM_REM_INGREDIENT_TAG,
  CLEAR_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
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
import {NutritionModel} from '../components/models/NutritionModel'

const initialState = {
  matchResultsModel: new MatchResultsModel(),
  ingredientControlModels: {},
  nutritionModel: new NutritionModel(),
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
    case NM_RESET:
    {
      return {
        matchResultsModel: new MatchResultsModel(),
        ingredientControlModels: {},
        nutritionModel: new NutritionModel(),
        lazyLoadOperation: {
          status: '',
          tag: undefined,
          value: undefined
        },
        modelSetup: false,
        userSearch: false,
        searchIngredient: '',
        selectedTags: [],
        append: false,
        tag: ''
      }
    }
    case NM_ADD_INGREDIENT:
    {
      let {nutritionModel} = state
      nutritionModel.addIngredient(action.tag, action.ingredientModel, action.quantity, action.unit, action.append)
      return {
        ...state,
        nutritionModel: nutritionModel
      }
    }
    case NM_REM_INGREDIENT:
    {
      let {nutritionModel} = state
      nutritionModel.removeIngredient(action.tag)
      return {
        ...state,
        nutritionModel: nutritionModel
      }
    }
    case NM_SET_SERVINGS:
    {
      let {nutritionModel} = state
      const servingsControlModel = action.servingsControlModel
      nutritionModel.setSuggestedServingAmount(servingsControlModel.getValue(),
                                               servingsControlModel.getUnit(),
                                               servingsControlModel.getDisplayUnitCount(),
                                               servingsControlModel.getDisplayUnit())
      return {
        ...state,
        nutritionModel: nutritionModel
      }
    }
    case NM_SCALE_INGREDIENT:
    {
      let {nutritionModel} = state
      nutritionModel.scaleIngredientToUnit(action.tag, action.value, action.units)
      return {
        ...state,
        nutritionModel: nutritionModel
      }
    }
    case IM_ADD_CONTROL_MODEL:
    {
      let {ingredientControlModels} = state
      ingredientControlModels[action.tag] = action.ingredientControlModel
      return {
        ...state,
        ingredientControlModels: ingredientControlModels
      }
    }
    // TODO: AC replace all the individual setters below with this
    case IM_UPDATE_MODEL:
    {
      let {ingredientControlModels} = state
      ingredientControlModels[action.tag] = action.ingredientControlModel
      return {
        ...state,
        ingredientControlModels: ingredientControlModels
      }
    }
    case IM_REM_INGREDIENT_TAG:
    {
      let {ingredientControlModels} = state
      delete ingredientControlModels[action.tag]
      return {
        ...state,
        ingredientControlModels: ingredientControlModels
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

        matchResultsModel.addSearch(searchTerm)
        for (let obj of action.data) {
          const description = obj.info._source.Description
          const ndbNo = obj.info._id
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
        console.log('nutritionReducer - error in INGREDIENT_FIREBASE_DATA');
        console.log(action.foodName);
        console.log(localMatchData.length);
      }

      return {
        ...state,
        matchResultsModel,
        userSearch: action.userSearch,
        append: action.append
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
