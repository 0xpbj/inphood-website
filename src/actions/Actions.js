import {
  UPLOAD_PHOTO,
  SELECTED_PHOTO,
  CLEAR_DATA,
  GET_LABEL_ID,
  POST_LABEL_ID,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  LAZY_FETCH_FIREBASE,
  RESET_LAZY_LOAD_STATUS,
  CLEAN_REDUCERS,
  SEARCH_INGREDIENT,
  NM_RESET,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  NM_SET_SERVINGS,
  NM_SCALE_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  IM_UPDATE_MODEL,
  IM_REM_INGREDIENT_TAG,
  SC_STORE_MODEL,
  RESET_SEARCH_FLAG,
  SELECTED_TAGS,
  UNUSED_TAGS,
  GET_MORE_DATA,
  RESET_APPEND_DATA,
  INIT_EMAIL_FLOW,
  GET_EMAIL_DATA,
  COMPLETE_DROPDOWN_CHANGE,
  ADD_SEARCH_SELECTION,
  SEND_USER_GENERATED_DATA,
  INIT_SUPER_SEARCH
} from '../constants/ActionTypes'

export function uploadPhoto() {
  return {
    type: UPLOAD_PHOTO,
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

export function sendSerializedData(composite, full) {
  return {
    type: SEND_SERIALIZED_DATA,
    composite,
    full
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

export function resetLazyLoadOperation() {
  return {
    type: RESET_LAZY_LOAD_STATUS
  }
}

export function cleanReducers() {
  return {
    type: CLEAN_REDUCERS
  }
}

export function searchIngredientData(searchIngredient) {
  return {
    type: SEARCH_INGREDIENT,
    searchIngredient
  }
}

export function nutritionModelReset() {
  return {
    type: NM_RESET
  }
}

export function nutritionModelAddIng(tag, ingredientModel, quantity, unit, append) {
  return {
    type: NM_ADD_INGREDIENT,
    tag,
    ingredientModel,
    quantity,
    unit,
    append
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

export function ingredientModelRemTag(tag) {
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

export function resetSearchFlag() {
  return {
    type: RESET_SEARCH_FLAG,
  }
}

export function selectedTags(tags) {
  return {
    type: SELECTED_TAGS,
    tags
  }
}

export function unusedTags(tags) {
  return {
    type: UNUSED_TAGS,
    tags
  }
}

export function getMoreData(foodName, size) {
  return {
    type: GET_MORE_DATA,
    foodName,
    size
  }
}

export function resetAppendData() {
  return {
    type: RESET_APPEND_DATA
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

export function addSearchSelection(match) {
  return {
    type: ADD_SEARCH_SELECTION,
    match
  }
}

export function initSuperSearch(flag) {
  return {
    type: INIT_SUPER_SEARCH,
    flag
  }
}

export function sendUserGeneratedData(data, labelId, userId) {
  return {
    type: SEND_USER_GENERATED_DATA,
    data,
    labelId,
    userId
  }
}
