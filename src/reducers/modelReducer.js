import {
  NM_RESET,
  NM_SETUP,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  NM_SET_SERVINGS,
  NM_SCALE_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  IM_SET_SLIDER_VALUE,
  IM_SET_DROPDOWN_MATCH_VALUE,
  IM_SET_DROPDOWN_UNITS,
  IM_REM_INGREDIENT_TAG,
  CLEAR_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  LAZY_LOAD_FIREBASE,
  LAZY_FETCH_FIREBASE,
  RESET_LAZY_LOAD_STATUS,
} from '../constants/ActionTypes'

import {NutritionModel} from '../components/models/NutritionModel'

const initialState = {
  matchData: {},
  ingredientControlModels: {},
  nutritionModel: new NutritionModel(),
  lazyLoadOperation: {
    status: '',
    tag: undefined,
    value: undefined
  },
  modelSetup: false
}

export default function modelFun(state = initialState, action) {
  switch (action.type) {
    case NM_RESET:
    {
      return {
        ...initialState
      }
    }
    case NM_SETUP:
    {
      return {
        ...state,
        modelSetup: action.flag
      }
    }
    case NM_ADD_INGREDIENT: 
    {
      let {nutritionModel} = state
      nutritionModel.addIngredient(action.tag, action.ingredientModel, action.quantity, action.unit)
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
      nutritionModel.setSuggestedServingAmount(action.value, action.units)
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
    case IM_SET_SLIDER_VALUE:
    {
      let {ingredientControlModels} = state
      ingredientControlModels[action.tag].setSliderValue(action.value)
      return {
        ...state,
        ingredientControlModels: ingredientControlModels
      }
    }
    case IM_SET_DROPDOWN_MATCH_VALUE:
    {
      let {ingredientControlModels} = state
      ingredientControlModels[action.tag].setDropdownMatchValue(action.value)
      return {
        ...state,
        ingredientControlModels: ingredientControlModels
      }
    }
    case IM_SET_DROPDOWN_UNITS:
    {
      let {ingredientControlModels} = state
      ingredientControlModels[action.tag].setDropdownUnits(action.value)
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
    case CLEAR_FIREBASE_DATA:
      {
        let localMatchData = {}

        return {
          ...state,
          matchData: localMatchData
        }
      }
    //
    case INITIALIZE_FIREBASE_DATA:
      {
        // Initializes our dictionary of match data with ordered arrays of tuples
        // containing the description, ndbNo and undefined:
        // Clear the match data to prevent populating it twice on 'back' button actions etc.
        let localMatchData = state.matchData
        if (action.foodName in localMatchData) {
          return
        }

        localMatchData[action.foodName] = []

        for (let obj of action.data) {
          let dataEntry = [obj.info._source.Description, obj.info._id, undefined]
          localMatchData[action.foodName].push(dataEntry)
        }

        return {
          ...state,
          matchData: localMatchData
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
        let {matchData} = state
        const dataObjOffset = 2
        matchData[action.ingredient][action.index][dataObjOffset] = action.data

        let {lazyLoadOperation} = state
        lazyLoadOperation.status = 'done'

        return {
          ...state,
          matchData,
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
    case INGREDIENT_FIREBASE_DATA:
      {
        // console.log('nutritionReducer: INGREDIENT_FIREBASE_DATA --------------');
        // console.log(action.foodName);
        // console.log(action.json);

        // Performs an ordered insertion of the data returned by firebase for the
        // key (ndbNo) returned from elastic search:
        const descriptionOffset = 0
        const dataObjOffset = 2

        let localMatchData = state.matchData
        if (action.foodName in localMatchData) {
          let foodNameArr = localMatchData[action.foodName]

          for (let tupleIdx = 0; tupleIdx < foodNameArr.length; tupleIdx++) {
            if (action.ingredient === foodNameArr[tupleIdx][descriptionOffset]) {
              foodNameArr[tupleIdx][dataObjOffset] = action.data
              break
            }
          }
        } else {
          console.log('nutritionReducer - error in INGREDIENT_FIREBASE_DATA');
          console.log(action.foodName);
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