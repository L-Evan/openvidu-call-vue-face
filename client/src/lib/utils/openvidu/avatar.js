import { AvatarType } from "./openviduType"
import {localUsersService} from "./openviduMainUser"
class AvatarService {
  constructor () {
    this.openviduAvatar = "/images/6ec7aa08646eb54d803b.png"
    this.capturedAvatar = ""
    this.localUsersService = localUsersService
  }

  setCaputedAvatar (avatar) {
    this.capturedAvatar = avatar
  }

  setFinalAvatar (type) {
    if (type === AvatarType.CAPTURED) {
      this.localUsersService.setAvatar(this.capturedAvatar)
      return
    }

    this.localUsersService.setAvatar(this.openviduAvatar)
  }

  getOpenViduAvatar () {
    return this.openviduAvatar
  }
  getCapturedAvatar () {
    return this.capturedAvatar
  }

  createCapture () {
    console.log("Capturing avatar ...")
    const avatar = document.createElement("canvas")
    const video = this.localUsersService.getWebcamPublisher().videos[0].video

    avatar.className = "user-img"
    avatar.width = 100
    avatar.height = 100

    if (video) {
      const avatarContext = avatar.getContext("2d")
      avatarContext.drawImage(video, 200, 120, 285, 285, 0, 0, 100, 100)
      this.capturedAvatar = avatar.toDataURL()
    }
    return this.capturedAvatar
  }

  getAvatarFromConnectionData (data) {
    let avatar
    try {
      avatar = JSON.parse(data).avatar
    } catch (error) {
      avatar = this.getOpenViduAvatar()
    }
    return avatar
  }

  clear () {
    this.capturedAvatar = ""
  }
}
export const avatarService = new AvatarService()