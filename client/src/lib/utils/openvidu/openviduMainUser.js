// import { OpenVidu } from "openvidu-browser"
import { UserModel } from "./openviduUser"
import store from "@/store/index"
// import { computed } from 'vue'
class LocalUsersService {
  initialize () {
    this.webcamUser = new UserModel()
    // Used when the streamManager is null (users without devices)
    // local代表还没有流？
    this.webcamUser.setLocal(true)
    // 更新组件的数值
    // 默认都会放一个用户的，只是没视频
    this._OVUsers([this.webcamUser])
  }
  // 获取流
  getScreenPublisher () {
    return this.screenUser?.getStreamManager()
  }
  isOnlyScreenConnected () {
    return this.OVUsers()[0].isScreen()
  }
  enableWebcamUser () {
    console.log("放屏幕和视频",[this.webcamUser, this.screenUser])
    this._OVUsers([this.webcamUser, this.screenUser])
  }
  getWebcamPublisher () {
    return this.webcamUser?.getStreamManager()
  }
  setAvatar (avatar) {
    this.webcamUser?.setAvatar(avatar)
    // 有的话
    this.screenUser?.setAvatar(avatar)
  }
  constructor () {
    this._OVUsers = users => store.commit("openvidu/SET_LocalUsers", users)
    this.OVUsers = () => store.getters.localUsers
    // 共享屏幕状态 按钮
    this._screenShareState = screenShareState =>
      store.commit("openvidu/SET_ScreenShareState", screenShareState)
    // 视频状态 按钮
    this._webcamVideoActive = webcamVideoActive =>
      store.commit("openvidu/SET_WebcamVideoActive", webcamVideoActive)
    this.webcamUser = null
  }
  // 当前用户有无视频
  hasWebcamVideoActive () {
    return this.webcamUser.isVideoActive()
  }
  setWebcamPublisher (publisher) {
    this.webcamUser.setStreamManager(publisher)
  }
  // ScreenUser 放到local
  enableScreenUser (screenPublisher) {
    console.log("Enabling screen publisher")

    const connectionId = screenPublisher?.session?.connection?.connectionId
    this.screenUser = new UserModel(
      connectionId,
      screenPublisher,
      this.getScreenUserName()
    )
    this.screenUser.setAvatar(this.webcamUser.getAvatar())
    //确定成功
    this._screenShareState(true)

    if (this.isWebCamEnabled()) {
      this._OVUsers([this.webcamUser, this.screenUser])
      return
    }
    console.log("只放屏幕")
    // 不给屏幕权限的情况
    this._OVUsers([this.screenUser])
  }
  getScreenUserName () {
    return this.getWebcamUserName() + "_SCREEN"
  }
  getWebcamUserName () {
    return this.webcamUser.getNickname()
  }
  // 去掉 还会设置为关
  disableScreenUser () {
    // this.destryoScreenUser();
    this._OVUsers([this.webcamUser])
    this._screenShareState(false)
  }
  // 去掉用户 有屏幕才可以调用???
  disableWebcamUser () {
    // this.destryowebcamUser();
    this._OVUsers([this.screenUser])
  }
  isWebCamEnabled () {
    const users = this.OVUsers()
    return users.length&&users[0].isCamera()
  }
  isOnlyWebcamConnected () {
    return this.isWebCamEnabled() && !this.areBothConnected()
  }
  areBothConnected () {
    return this.OVUsers().length === 2
  }
  updateUsersStatus () {
    this._webcamVideoActive(this.webcamUser.isVideoActive())
  }
  updateUsersNickname (nickname) {
    this.webcamUser?.setNickname(nickname)
    this.screenUser?.setNickname(this.getScreenUserName())
  }
  getAvatar () {
    return this.webcamUser.getAvatar()
  }
  // ui相关
  // 改变大小属性
  toggleZoom (connectionId) {
    if (this.webcamUser.getConnectionId() === connectionId) {
      this.webcamUser.setVideoSizeBig(!this.webcamUser.isVideoSizeBig())
      return
    }
    this.screenUser.setVideoSizeBig(!this.screenUser.isVideoSizeBig())
  }
  resetUsersZoom () {
    this.webcamUser?.setVideoSizeBig(false)
    this.screenUser?.setVideoSizeBig(false)
  }

  clear () {
    this.screenUser = null
    this.webcamUser = new UserModel()
    this.disableScreenUser()
  }
  hasWebcamAudioActive () {
    return this.webcamUser?.isAudioActive()
  }
  hasScreenAudioActive () {
    return this.screenUser?.isAudioActive()
  }

  isScreenShareEnabled () {
    return this.areBothConnected() || this.isOnlyScreenConnected()
  }
}

export const localUsersService = new LocalUsersService()
