import {
  IG_UPLOAD_PHOTO,
  SELECTED_PHOTO,
  IG_LOGIN_REQUEST,
  IG_LOGOUT_REQUEST,
  IG_REFRESH_REQUEST,
  ADD_CAPTION,
  AN_UPLOAD_PHOTO,
  AN_SELECTED_PHOTO,
  AN_CLEAR_DATA,
  GET_LABEL_ID,
  IG_UPDATED_CAPTION,
  POST_LABEL_ID,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  LAZY_FETCH_FIREBASE,
  RESET_LAZY_LOAD_STATUS,
  CLEAN_REDUCERS,
  SEARCH_INGREDIENT,
  NM_RESET,
  NM_SETUP,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  NM_SET_SERVINGS,
  NM_SCALE_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  IM_SET_SLIDER_VALUE,
  IM_SET_DROPDOWN_MATCH_VALUE,
  IM_SET_DROPDOWN_UNITS_VALUE,
  IM_SET_DROPDOWN_UNITS,
  IM_REM_INGREDIENT_TAG,
  RESET_SEARCH_FLAG,
  SELECTED_TAGS
} from '../constants/ActionTypes'

export function igUploadPhoto() {
  return {
    type: IG_UPLOAD_PHOTO,
  }
}

export function igSelectedPhoto(index, photo) {
  return {
    type: SELECTED_PHOTO,
    index,
    photo
  }
}

export function igLoginRequest() {
  return {
    type: IG_LOGIN_REQUEST
  }
}

export function igLogoutRequest() {
  return {
    type: IG_LOGOUT_REQUEST
  }
}

export function igRefreshRequest() {
  return {
    type: IG_REFRESH_REQUEST
  }
}

export function addCaption(caption) {
  return {
    type: ADD_CAPTION,
    caption
  }
}

export function anUploadPhoto() {
  return {
    type: AN_UPLOAD_PHOTO,
  }
}

export function anSelectedPhoto(photo) {
  return {
    type: AN_SELECTED_PHOTO,
    photo
  }
}

export function anClearData() {
  return {
    type: AN_CLEAR_DATA,
  }
}

export function getLabelId(userId, labelId) {
  return {
    type: GET_LABEL_ID,
    userId,
    labelId
  }
}

export function igUpdatedCaption(caption) {
  return {
    type: IG_UPDATED_CAPTION,
    caption
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

export function nutritionModelSetup(flag) {
  return {
    type: NM_SETUP,
    flag
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

export function nutritionModelSetServings(value, units) {
  return {
    type: NM_SET_SERVINGS,
    value,
    units
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

export function ingredientSetSliderValue(tag, value) {
  return {
    type: IM_SET_SLIDER_VALUE,
    tag,
    value
  }
}

export function ingredientSetDropdownMatchValue(tag, value) {
  return {
    type: IM_SET_DROPDOWN_MATCH_VALUE,
    tag,
    value
  }
}

export function ingredientSetDropdownUnits(tag, units) {
  return {
    type: IM_SET_DROPDOWN_UNITS,
    tag,
    units
  }
}

export function ingredientSetDropdownUnitsValue(tag, units) {
  return {
    type: IM_SET_DROPDOWN_UNITS_VALUE,
    tag,
    units
  }
}

export function ingredientModelRemTag(tag) {
  return {
    type: IM_REM_INGREDIENT_TAG,
    tag
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
