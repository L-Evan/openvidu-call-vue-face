import { OvSettingsModel } from "./openviduSetting"
export class ExternalConfigModel {
  constructor () {
    this.ovSettings = new OvSettingsModel()
  }
 

  getOvSettings () {
    return this.ovSettings
  }
  getSessionName () {
    return this.sessionName
  }
  getOvServerUrl () {
    return this.ovServerUrl
  }
  getOvSecret () {
    return this.ovSecret
  }
  getNickname () {
    return this.nickname
  }
  getTokens () {
    return this.tokens
  }

  getScreenToken () {
    return this.tokens[1]
  }
  getWebcamToken () {
    return this.tokens[0]
  }

  setOvSettings (ovSettings) {
    if (ovSettings) {
      this.ovSettings.set(ovSettings)
    }
  }
  setSessionName (sessionName) {
    this.sessionName = sessionName
  }
  setOvServerUrl (url) {
    this.ovServerUrl = url
  }
  setOvSecret (secret) {
    this.ovSecret = secret
  }
  setNickname (nickname) {
    this.nickname = nickname
  }
  // 
  setTokens (tokens) {
    if (tokens) {
      this.ovSettings.setScreenSharing(
        this.ovSettings.hasScreenSharing() && tokens?.length > 1
      )
      this.tokens = tokens
    }
  }

  canJoinToSession () {
    return this.canOVCallGenerateToken() || this.hasReceivedToken()
  }

  hasTokens () {
    return this.tokens?.length > 0
  }

  canOVCallGenerateToken () {
    return (
      this.sessionName && this.ovServerUrl && this.ovSecret && this.nickname
    )
  }
  hasReceivedToken () {
    return this.tokens && this.tokens.length > 0 && this.nickname
  }
}
