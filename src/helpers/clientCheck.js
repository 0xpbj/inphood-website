import 'clientjs'
const client = new ClientJS()

export function isChrome() {
  return client.isChrome()
}

export function mobileCheck() {
  let flag = false
  if ( client.isMobile() ||
       client.isMobileMajor() ||
       client.isMobileAndroid() ||
       client.isMobileOpera() ||
       client.isMobileWindows() ||
       client.isMobileBlackBerry() ||
       client.isMobileIOS() ) 
  {
    flag = true
  }
  return flag
}