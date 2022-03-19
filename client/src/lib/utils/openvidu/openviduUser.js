import { VideoType } from "./openviduType"
export class UserModel {
  /**
   * @hidden
   */
  constructor (connectionId, streamManager, nickname) {
    this.connectionId = connectionId || ""
    this.nickname = nickname || "OpenVidu"
    this.streamManager = streamManager || null
    /**
     * @hidden
     */
    this.avatar = ""
    /**
     * @hidden
     */
    this.local = false
    /**
     * @hidden
     */
    // private randomAvatar  ;
    /**
     * @hidden
     */
    this.videoSizeBig = false
  }

  /**
   * Return `true` if audio track is active and `false` if audio track is muted
   */
  isAudioActive () {
    // console.log("isAudioActive");
    return this.streamManager?.stream?.audioActive
  }

  /**
   * Return `true` if video track is active and `false` if video track is muted
   */
  isVideoActive () {
    // console.log("isVideoActive");
    return this.streamManager?.stream?.videoActive
  }

  /**
   * Return the connection ID
   */
  getConnectionId () {
    return (
      this.streamManager?.stream?.connection?.connectionId || this.connectionId
    )
  }

  /**
   * Return the user nickname
   */
  getNickname () {
    return this.nickname
  }

  /**
   * Return the [[streamManger]] object
   */
  getStreamManager () {
    return this.streamManager
  }

  /**
   * Return the user avatar
   */
  getAvatar () {
    return this.avatar
  }

  setAvatar (avatar) {
    this.avatar = avatar
  }

  /**
   * Return `true` if user has a local role and `false` if not
   */
  isLocal () {
    return this.local
  }

  /**
   * Return `true` if user has a remote role and `false` if not
   */
  isRemote () {
    return this.streamManager?.remote
  }

  /**
   * Return `true` if user has a screen role and `false` if not
   */
  isScreen () {
    // console.log("isScreen");
    return this.streamManager?.stream?.typeOfVideo === VideoType.SCREEN
  }

  /**
   * Return `true` if user has a camera role and `false` if not
   */
  isCamera () {
    // console.log("CCC");
    return (
      this.streamManager?.stream?.typeOfVideo === VideoType.CAMERA ||
      (this.isLocal() && !this.isScreen())
    )
  }

  /**
   * Set the streamManager value object
   * @param streamManager value of streamManager
   */
  setStreamManager (streamManager) {
    this.streamManager = streamManager
  }

  /**
   * Set the user nickname value
   * @param nickname value of user nickname
   */
  setNickname (nickname) {
    this.nickname = nickname
  }

  isVideoSizeBig () {
    return this.videoSizeBig
  }

  /**
   * @hidden
   */
  setVideoSizeBig (big) {
    this.videoSizeBig = big
  }

  /**
   * @hidden
   */
  // Used when the streamManager is null (users without devices)
  setLocal (local) {
    this.local = local
  }
}
