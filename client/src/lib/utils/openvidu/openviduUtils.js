import { LayoutClass } from "./openviduType"
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
  // 全屏 某个视频
  toggleFullscreen (element) {
    const document = window.document
    const fs = element
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (fs.requestFullscreen) {
        fs.requestFullscreen()
      } else if (fs.msRequestFullscreen) {
        fs.msRequestFullscreen()
      } else if (fs.mozRequestFullScreen) {
        fs.mozRequestFullScreen()
      } else if (fs.webkitRequestFullscreen) {
        fs.webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    }
  }
  // 向上找出要的
  getHTMLElementByClassName (element, className) {
    while (!!element && element !== document.body) {
      if (element.className.includes(className)) {
        return element
      }
      element = element.parentElement
    }
    return null
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
    console.log("提取用户名",data)
    let nickname
    try {
      nickname = JSON.parse(data?.split("%/%")[0]).clientData
    } catch (error) {
      nickname = "Unknown"
    }
    return nickname
  }
  isFirefox () {
    return /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)
  }
  // ui相关
  toggleBigElementClass (element) {
    if (element?.className.includes(LayoutClass.BIG_ELEMENT)) {
      this.removeBigElementClass(element)
    } else {
      element.classList.add(LayoutClass.BIG_ELEMENT)
    }
  }
  removeBigElementClass (element) {
    element?.classList.remove(LayoutClass.BIG_ELEMENT)
  }

  removeAllBigElementClass () {
    const elements = document.getElementsByClassName(LayoutClass.BIG_ELEMENT)
    while (elements.length > 0) {
      this.removeBigElementClass(elements[0])
    }
  }
}
export const utils = new Utils()
