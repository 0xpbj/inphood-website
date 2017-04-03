import {
  SAVE_TO_CLOUD,
  SELECTED_PHOTO,
  CLEAR_DATA,
  GET_LABEL_ID,
  POST_LABEL_ID,
  STORE_PARSED_DATA,
  LAZY_FETCH_FIREBASE,
  MODEL_RESET,
  UPDATE_MATCH_RESULTS_MODEL,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  NM_SET_SERVINGS,
  NM_SCALE_INGREDIENT,
  NM_SET_LABEL_TYPE,
  IM_ADD_CONTROL_MODEL,
  IM_UPDATE_MODEL,
  IM_REM_INGREDIENT_TAG,
  SC_STORE_MODEL,
  UNUSED_TAGS,
  INIT_EMAIL_FLOW,
  GET_EMAIL_DATA,
  COMPLETE_DROPDOWN_CHANGE,
  ADD_SEARCH_SELECTION,
  SEND_USER_GENERATED_DATA,
  INIT_SUPER_SEARCH,
  CLOSE_SEARCH_MODAL,
  GET_MORE_DATA,
  SET_PARSED_DATA,
  SET_TITLE,
  INIT_SERIALIZED_DATA,
  SAVE_LABEL_AWS
} from '../constants/ActionTypes'

export function saveToCloud() {
  return {
    type: SAVE_TO_CLOUD,
  }
}

export function selectedPhoto(photo) {
  return {
    type: SELECTED_PHOTO,
    photo
  }
}

export function clearData() {
  return {
    type: CLEAR_DATA,
  }
}

export function getLabelId(userId, labelId) {
  return {
    type: GET_LABEL_ID,
    userId,
    labelId
  }
}

export function postLabelId(labelId, comment) {
  return {
    type: POST_LABEL_ID,
    labelId,
    comment
  }
}

export function setParsedData(parsedData) {
  return {
    type: SET_PARSED_DATA,
    parsedData
  }
}

export function storeParsedData(parsedData, missingData, rawData, title, dietary, allergen) {
  return {
    type: STORE_PARSED_DATA,
    parsedData,
    missingData,
    rawData,
    title,
    dietary,
    allergen
  }
}

export function lazyFetchFirebase(foodName, ingredient, key, index) {
  return {
    type: LAZY_FETCH_FIREBASE,
    foodName,
    ingredient,
    key,
    index
  }
}

export function modelReset() {
  return {
    type: MODEL_RESET
  }
}

export function updateMatchResultsModel(matchResultsModel) {
  return {
    type: UPDATE_MATCH_RESULTS_MODEL,
    matchResultsModel
  }
}

export function nutritionModelAddIng(tag, ingredientModel, quantity, unit) {
  return {
    type: NM_ADD_INGREDIENT,
    tag,
    ingredientModel,
    quantity,
    unit
  }
}

export function nutritionModelRemIng(tag) {
  return {
    type: NM_REM_INGREDIENT,
    tag
  }
}

export function nutritionModelSetServings(servingsControlModel) {
  return {
    type: NM_SET_SERVINGS,
    servingsControlModel
  }
}

export function nutritionModelScaleIng(tag, value, units) {
  return {
    type: NM_SCALE_INGREDIENT,
    tag,
    value,
    units
  }
}

export function ingredientAddModel(tag, ingredientControlModel) {
  return {
    type: IM_ADD_CONTROL_MODEL,
    tag,
    ingredientControlModel
  }
}

export function updateIngredientControlModel(tag, ingredientControlModel) {
  return {
    type: IM_UPDATE_MODEL,
    tag,
    ingredientControlModel
  }
}

export function ingredientControlModelRemTag(tag) {
  return {
    type: IM_REM_INGREDIENT_TAG,
    tag
  }
}

export function setServingsControllerModel(servingsControlModel) {
  return {
    type: SC_STORE_MODEL,
    servingsControlModel
  }
}

export function unusedTags(tags) {
  return {
    type: UNUSED_TAGS,
    tags
  }
}

export function initEmailFlow() {
  return {
    type: INIT_EMAIL_FLOW
  }
}

export function getEmailData(data) {
  return {
    type: GET_EMAIL_DATA,
    data
  }
}

export function completeMatchDropdownChange(tag, value) {
  return {
    type: COMPLETE_DROPDOWN_CHANGE,
    tag,
    value
  }
}

export function addSearchSelection(searchResult, index) {
  return {
    type: ADD_SEARCH_SELECTION,
    searchResult,
    index
  }
}

export function closeSearchModal() {
  return {
    type: CLOSE_SEARCH_MODAL
  }
}

export function getMoreData(foodName) {
  return {
    type: GET_MORE_DATA,
    foodName
  }
}

export function setLabelType(labelType) {
  return {
    type: NM_SET_LABEL_TYPE,
    labelType
  }
}

export function setTitle(title) {
  return {
    type: SET_TITLE,
    title
  }
}

export function initSerializedData() {
  return {
    type: INIT_SERIALIZED_DATA
  }
}

export function saveLabelToAws() {
  return {
    type: SAVE_LABEL_AWS
  }
}