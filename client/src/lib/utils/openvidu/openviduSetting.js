import store from "@/store/index"
const _ovSettings = setting => store.commit("openvidu/SET_OvSettings", setting)
export class OvSettingsModel {
  constructor () {
    this._ovSettings = _ovSettings
    this.ovSettings = {
      // 聊天
      chat: true,
      // 取消config
      autopublish: false,
      // 顶部
      toolbar: true,
      // 底部
      footer: true,
      // 主题配置
      toolbarButtons: {
        video: true,
        audio: true,
        fullscreen: true,
        screenShare: true,
        layoutSpeaking: true,
        exit: true
      }
    }
  }

  set (ovSettings) {
    this.ovSettings = ovSettings
  }

  isAutoPublish () {
    return this.ovSettings.autopublish
  }

  hasVideo () {
    return this.ovSettings.toolbarButtons.video
  }

  hasScreenSharing () {
    return this.ovSettings.toolbarButtons.screenShare
  }

  hasLayoutSpeaking () {
    return this.ovSettings.toolbarButtons.layoutSpeaking
  }

  hasFullscreen () {
    return this.ovSettings.toolbarButtons.fullscreen
  }

  hasAudio () {
    return this.ovSettings.toolbarButtons.audio
  }

  hasChat () {
    return this.ovSettings.chat
  }
  hasExit () {
    return this.ovSettings.toolbarButtons.exit
  }

  setScreenSharing (screenShare) {
    this.ovSettings.toolbarButtons.screenShare = screenShare
  }

  hasFooter () {
    return this.ovSettings.footer
  }
  hasToolbar () {
    return this.ovSettings.toolbar
  }
}
