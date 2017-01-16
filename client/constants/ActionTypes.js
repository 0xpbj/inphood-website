import { createAction } from 'redux-actions'


// Instagram Flow Actions
export const IG_LOGIN_REQUEST = 'IG_LOGIN_REQUEST'
export const IG_LOGOUT_REQUEST = 'IG_LOGOUT_REQUEST'
export const IG_REFRESH_REQUEST = 'IG_REFRESH_REQUEST'
export const IG_LOGIN_SUCCESS = 'IG_LOGIN_SUCCESS'
export const IG_LOGOUT_SUCCESS = 'IG_LOGOUT_SUCCESS'
export const IG_LOGIN_ERROR = 'IG_LOGIN_ERROR'
export const IG_LOGOUT_ERROR = 'IG_LOGOUT_ERROR'
export const IG_PHOTOS_SUCCESS = 'IG_PHOTOS_SUCCESS'
export const IG_PHOTOS_ERROR = 'IG_PHOTOS_ERROR'
export const IG_PROFILE_SUCCESS = 'IG_PROFILE_SUCCESS'
export const IG_PROFILE_ERROR = 'IG_PROFILE_ERROR'
export const IG_SELECTED_PHOTO = 'IG_SELECTED_PHOTO'
export const IG_UPLOAD_PHOTO = 'IG_UPLOAD_PHOTO'
export const IG_UPDATED_CAPTION = 'IG_UPDATED_CAPTION'


// Anonymous Flow Actions
export const AN_CLEAR_DATA = 'AN_CLEAR_DATA'
export const AN_ADD_CAPTION = 'AN_ADD_CAPTION'
export const AN_UPLOAD_PHOTO = 'AN_UPLOAD_PHOTO'
export const AN_SELECTED_PHOTO = 'AN_SELECTED_PHOTO'


// Results Actions
export const LABEL_DATA = 'LABEL_DATA'
export const RESULT_URL = 'RESULT_URL'
export const GET_LABEL_ID = 'GET_LABEL_ID'
export const POST_LABEL_ID = 'POST_LABEL_ID'
export const SEND_SERIALIZED_DATA = 'SEND_SERIALIZED_DATA'