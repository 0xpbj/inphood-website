import {
  IG_UPLOAD_PHOTO,
  IG_SELECTED_PHOTO,
  IG_LOGIN_REQUEST,
  IG_LOGOUT_REQUEST,
  IG_REFRESH_REQUEST,
  AN_ADD_CAPTION,
  AN_UPLOAD_PHOTO,
  AN_SELECTED_PHOTO,
  AN_CLEAR_DATA,
  GET_LABEL_ID,
} from '../constants/ActionTypes'

export function igUploadPhoto() {
  return {
    type: IG_UPLOAD_PHOTO,
  }
}

export function igSelectedPhoto(photo) {
  return {
    type: IG_SELECTED_PHOTO,
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

export function anAddCaption(caption) {
  return {
    type: AN_ADD_CAPTION,
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

export function getLabelId(labelId) {
  return {
    type: GET_LABEL_ID,
    labelId
  }
}