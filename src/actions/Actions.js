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
  SEND_SERIALIZED_DATA
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