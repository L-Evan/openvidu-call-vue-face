import { networkService as networkSrv } from "./openviduNetwork"

class TokenService {
  constructor () {
    this.ovSettings = undefined
    this.webcamToken = ""
    this.screenToken = ""
    this.sessionId = ""
    this.networkSrv = networkSrv
  }

  initialize (ovSettings) {
    this.ovSettings = ovSettings
  }

  setSessionId (sessionId) {
    this.sessionId = sessionId
  }

  getSessionId () {
    return this.sessionId
  }

  async initTokens (externalConfig) {
    // WebComponent or Angular library //  not
    if (externalConfig && externalConfig.hasTokens()) {
      console.log(
        "Received external tokens from " + externalConfig.getComponentName()
      )
      this.webcamToken = externalConfig.getWebcamToken()
      // Only connect screen if screen sharing feature is available
      this.screenToken = this.ovSettings?.hasScreenSharing()
        ? externalConfig.getScreenToken()
        : undefined
      return
    }
    console.log("No external tokens received. Generating token on back...")
    await this.generateWebcamToken(this.sessionId)
    // TODO: create screenToken only when user initialize the screen
    if (this.ovSettings?.hasScreenSharing()) {
      await this.generateScreenToken(this.sessionId)
    }
  }
  async generateScreenToken (sessionId) {
    console.log("Generating screen token...")
    this.screenToken = await this.networkSrv.getToken(
      sessionId)
  }
  async generateWebcamToken (sessionId) {
    console.log("Generating webcam token...")
    this.webcamToken = await this.networkSrv.getToken(sessionId)
  }

  getWebcamToken () {
    return this.webcamToken
  }

  getScreenToken () {
    return this.screenToken
  }
}
export const tokenService = new TokenService()
