class Utils {
  constructor () {}
  //是否是手机端
  isMobile () {
    return this.isAndroid() || this.isIos()
  }
  isAndroid () {
    return (
      /\b(\w*Android\w*)\b/.test(navigator.userAgent) &&
      /\b(\w*Mobile\w*)\b/.test(navigator.userAgent)
    )
  }
  isIos () {
    return (
      this.isIPhoneOrIPad(navigator?.userAgent) &&
      this.isIOSWithSafari(navigator?.userAgent)
    )
  }
  // 苹果
  isIPhoneOrIPad (userAgent) {
    const isIPad = /\b(\w*Macintosh\w*)\b/.test(userAgent)
    const isIPhone =
      /\b(\w*iPhone\w*)\b/.test(userAgent) &&
      /\b(\w*Mobile\w*)\b/.test(userAgent)
    // && /\b(\w*iPhone\w*)\b/.test(navigator.platform);
    const isTouchable = "ontouchend" in document

    return (isIPad || isIPhone) && isTouchable
  }
  // 处理共享屏幕错误
  handlerScreenShareError (error) {
    if (error && error.name === "SCREEN_SHARING_NOT_SUPPORTED") {
      return "Your browser does not support screen sharing"
    } else if (error && error.name === "SCREEN_EXTENSION_DISABLED") {
      return "You need to enable screen sharing extension"
    } else if (error && error.name === "SCREEN_CAPTURE_DENIED") {
      // alert('You need to choose a window or application to share');
    }
  }
  getNicknameFromConnectionData (data) {
    let nickname
    try {
      nickname = JSON.parse(data).clientData
    } catch (error) {
      nickname = "Unknown"
    }
    return nickname
  }
  isFirefox () {
    return /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)
  }
}
export const utils = new Utils()
