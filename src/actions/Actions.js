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
  NM_REM_INGREDIENT,
  NM_SET_SERVINGS,
  NM_SET_SERVINGS_LINES,
  NM_SCALE_INGREDIENT,
  NM_SET_LABEL_TYPE,
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
  SERIALIZE_TO_FIREBASE,
  SAVE_LABEL_AWS,
  INCREMENT_ID
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

export function getLabelId(labelId) {
  return {
    type: GET_LABEL_ID,
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

export function lazyFetchFirebase(foodName, id, ingredient, key, index) {
  return {
    type: LAZY_FETCH_FIREBASE,
    foodName,
    id,
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

export function nutritionModelRemIng(id) {
  return {
    type: NM_REM_INGREDIENT,
    id
  }
}

export function nutritionModelSetServings(servingsControlModel) {
  return {
    type: NM_SET_SERVINGS,
    servingsControlModel
  }
}

export function nutritionModelSetServingsLines(servingsLines) {
  return {
    type: NM_SET_SERVINGS_LINES,
    servingsLines
  }
}

export function nutritionModelScaleIng(id, value, units) {
  return {
    type: NM_SCALE_INGREDIENT,
    id,
    value,
    units
  }
}

export function updateIngredientControlModel(id, ingredientControlModel) {
  return {
    type: IM_UPDATE_MODEL,
    id,
    ingredientControlModel
  }
}

// TODO: rename to ingredientControlModelRemIng
export function ingredientControlModelRemTag(id) {
  return {
    type: IM_REM_INGREDIENT_TAG,
    id
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

export function completeMatchDropdownChange(id, value) {
  return {
    type: COMPLETE_DROPDOWN_CHANGE,
    id,
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

export function serializeToFirebase() {
  return {
    type: SERIALIZE_TO_FIREBASE
  }
}

export function saveLabelToAws() {
  return {
    type: SAVE_LABEL_AWS
  }
}

export function incrementId() {
  return {
    type: INCREMENT_ID
  }
}
