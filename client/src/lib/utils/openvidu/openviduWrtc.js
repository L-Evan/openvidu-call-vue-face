import { OpenVidu } from "openvidu-browser"
import { localUsersService as localUsersSrv } from "./openviduMainUser"
import { environment } from "./openviduType"
import { ScreenType } from "./openviduType"
class OpenViduWebrtcService {
  constructor () {
    this.localUsersSrv = localUsersSrv
  }
  initPublisher (targetElement, properties) {
    console.log("Initializing publisher with properties: ", properties)
    const publisher = this.OV.initPublisher(targetElement, properties)
    // this.localUsersSrv.setWebcamPublisher(publisher);
    // Publisher 流第一次开始播放
    publisher.once("streamPlaying", () => {
      // 还不太理解  媒体播放后删除class？比如吧黑屏关掉？
      console.log("streamPlaying remove custom-class?")
      publisher.videos[0].video.parentElement.classList.remove("custom-class")
    })
    return publisher
  }
  getSessionOfUserConnected () {
    return localUsersSrv.isWebCamEnabled()
      ? this.webcamSession
      : this.screenSession
  }
  createPublisherProperties (
    videoSource,
    audioSource,
    publishVideo,
    publishAudio,
    mirror
  ) {
    return {
      videoSource,
      audioSource,
      publishVideo,
      publishAudio,
      mirror
    }
  }
  // 选择音频后重新发布
  replaceTrack (videoSource, audioSource, mirror = true) {
    return new Promise((resolve, reject) => {
      // 替换属性
      if (videoSource) {
        console.log("Replacing video track " + videoSource)
        this.videoSource = videoSource
        // this.stopVideoTracks(this.webcamUser.getStreamManager().stream.getMediaStream());
      }
      if (audioSource) {
        console.log("Replacing audio track " + audioSource)
        this.audioSource = audioSource
        // this.stopAudioTracks(this.webcamUser.getStreamManager().stream.getMediaStream());
      }
      // 销毁发布 准备重新发布
      this.destroyWebcamPublisher()
      const properties = this.createPublisherProperties(
        this.videoSource,
        this.audioSource,
        this.localUsersSrv.hasWebcamVideoActive(),
        this.localUsersSrv.hasWebcamAudioActive(),
        mirror
      )

      const publisher = this.initPublisher(undefined, properties)
      this.localUsersSrv.setWebcamPublisher(publisher)

      publisher.once("streamPlaying", () => {
        this.localUsersSrv.setWebcamPublisher(publisher)
        resolve()
      })

      publisher.once("accessDenied", () => {
        reject()
      })

      // Reeplace track method  通过
      // this.webcamMediaStream = await this.OV.getUserMedia(properties);
      // const track: MediaStreamTrack = !!videoSource
      // 	? this.webcamMediaStream.getVideoTracks()[0]
      // 	: this.webcamMediaStream.getAudioTracks()[0];

      // try {
      // 	await (<Publisher>this.webcamUser.getStreamManager()).replaceTrack(track);
      // } catch (error) {
      // 	this.log.e('Error replacing track ', error);
      // }
    })
  }
  // 音乐移植到屏幕
  publishScreenAudio (active) {
    const publisher = this.localUsersSrv.getScreenPublisher()
    if (publisher) {
      publisher.publishAudio(active)
    }
  }
  // 移植到播放
  publishWebcamAudio (active) {
    const publisher = this.localUsersSrv.getWebcamPublisher()
    if (publisher) {
      publisher.publishAudio(active)
    }
  }
  // 多次调用可以代表更新webrtc配置和流
  publishWebcamVideo (active) {
    // publishVideo //是否开启视频
    this.localUsersSrv.getWebcamPublisher().publishVideo(active)
    // Send event to subscribers because of video has changed and view must update
    // webrtc 向订阅者更新？  只是更新了下状态
    this.localUsersSrv.updateUsersStatus()
  }
  // TODO: replace function by sendSignal
  // rtc发送 修改姓名 也就是对应的connect
  sendNicknameSignal (connection) {
    // 是否需要改名,新连接还不知道本地改名字
    if (this.needSendNicknameSignal()) {
      const signalOptions = {
        data: JSON.stringify({
          clientData: this.localUsersSrv.getWebcamUserName()
        }),
        type: "nicknameChanged",
        to: connection ? [connection] : undefined
      }
      this.getWebcamSession()?.signal(signalOptions)
      signalOptions.data = JSON.stringify({
        clientData: this.localUsersSrv.getScreenUserName()
      })
      this.getScreenSession()?.signal(signalOptions)
    }
  }
  // 新连接才可以使用
  getClientConnectionJson () {
    console.log("此时来的名字",this.webcamSession.connection.data)
    return this.webcamSession.connection.data?.split("%/%")[0]
  }

  needSendNicknameSignal () {
    const oldNickname = JSON.parse(this.getClientConnectionJson()).clientData
    return oldNickname !== this.localUsersSrv.getWebcamUserName()
  }
  initialize () {
    this.OV = new OpenVidu()
    this.OVScreen = new OpenVidu()
    // 判断是否生环境
    if (environment.production) {
      // Disable all logging except error level
      this.OV.enableProdMode()
      this.OVScreen.enableProdMode()
    }
  }
  // 获取流
  initSessions () {
    this.initializeWebcamSession()
    this.initializeScreenSession()
  }
  initializeWebcamSession () {
    this.webcamSession = this.OV.initSession()
  }
  initializeScreenSession () {
    this.screenSession = this.OVScreen.initSession()
  }
  getWebcamSession () {
    return this.webcamSession
  }
  getScreenSession () {
    return this.screenSession
  }
  // 判断下是不是自己发布的
  isMyOwnConnection (connectionId) {
    return (
      this.webcamSession?.connection?.connectionId === connectionId ||
      this.screenSession?.connection?.connectionId === connectionId
    )
  }
  // 链接（未发布）
  async connectScreenSession (token) {
    if (token) {
      console.log("Connecting screen session")
      const screenUsername = localUsersSrv.getScreenUserName()
      const webcamAvatar = localUsersSrv.getAvatar()
      await this.screenSession.connect(token, {
        clientData: screenUsername,
        avatar: webcamAvatar
      })
    }
  }
  async connectWebcamSession (token) {
    if (token) {
      console.log("Connecting webcam session", token)
      const webcamUsername = this.localUsersSrv.getWebcamUserName()
      const webcamAvatar = this.localUsersSrv.getAvatar()
      // console.log("带着数据连接",{
      //   clientData: webcamUsername,
      //   avatar: webcamAvatar
      // })
      await this.webcamSession.connect(token, {
        clientData: webcamUsername,
        avatar: webcamAvatar
      })
    }
  }
  // 发布 与不发布  （不断连）
  async publishWebcamPublisher () {
    // 连接后发布，是否有发布能力
    if (this.webcamSession?.capabilities?.publish) {
      const publisher = localUsersSrv.getWebcamPublisher()
      if (publisher) {
        return await this.webcamSession.publish(publisher)
      }
    }
    console.log("Webcam publisher cannot be published")
  }
  unpublishWebcamPublisher () {
    const publisher = localUsersSrv.getWebcamPublisher()
    if (publisher) {
      this.publishScreenAudio(localUsersSrv.hasWebcamAudioActive())
      this.webcamSession.unpublish(publisher)
    }
  }
  async publishScreenPublisher () {
    if (this.screenSession?.capabilities?.publish) {
      const publisher = localUsersSrv.getScreenPublisher()
      if (publisher) {
        return await this.screenSession.publish(publisher)
      }
    }
    console.log("Screen publisher cannot be published")
  }

  unpublishScreenPublisher () {
    const publisher = localUsersSrv.getScreenPublisher()
    if (publisher) {
      this.screenSession.unpublish(publisher)
    }
  }
  // 离开
  disconnectWebcamSession () {
    if (this.webcamSession) {
      console.log("Disconnecting webcam session")
      this.webcamSession.disconnect()
      this.webcamSession = null
    }
  }
  disconnectScreenSession () {
    if (this.screenSession) {
      console.log("Disconnecting screen session")
      this.screenSession.disconnect()
      this.screenSession = null
    }
  }
  // 貌似是停止
  stopVideoTracks (mediaStream) {
    mediaStream?.getVideoTracks().forEach(track => {
      track.stop()
    })
  }
  stopAudioTracks (mediaStream) {
    // 轨道
    mediaStream?.getAudioTracks().forEach(track => {
      track.stop()

      track.enabled = false
    })
    // this.webcamMediaStream?.getAudioTracks().forEach(track => {
    //   track.stop()
    // })
  }
  disconnect () {
    this.disconnectWebcamSession()
    this.disconnectScreenSession()
    this.videoSource = undefined
    this.audioSource = undefined
    // 关视频流
    this.stopVideoTracks(
      this.localUsersSrv.getWebcamPublisher()?.stream?.getMediaStream()
    )
    this.stopVideoTracks(
      this.localUsersSrv.getScreenPublisher()?.stream?.getMediaStream()
    )
    // 关声音流
    this.stopAudioTracks(
      this.localUsersSrv.getWebcamPublisher()?.stream?.getMediaStream()
    )
    this.stopAudioTracks(
      this.localUsersSrv.getScreenPublisher()?.stream?.getMediaStream()
    )
  }
  // 切换共享屏幕
  async replaceScreenTrack () {
    const videoSource = ScreenType.SCREEN
    const hasAudio = !this.localUsersSrv.isWebCamEnabled()
    // 新的
    const properties = this.createPublisherProperties(
      videoSource,
      undefined,
      true,
      hasAudio,
      false
    )
    // 去掉之前的
    this.stopScreenTracks()
    this.screenMediaStream = await this.OVScreen.getUserMedia(properties)
    // 屏幕更新到实际对象 openvidu提供流跟换
    await this.localUsersSrv
      .getScreenPublisher()
      .replaceTrack(this.screenMediaStream.getVideoTracks()[0])
  }
  stopScreenTracks () {
    if (this.screenMediaStream) {
      this.stopAudioTracks(this.screenMediaStream)
      this.stopVideoTracks(this.screenMediaStream)
    }
  }
  // 功能区时
  isWebcamSessionConnected () {
    return !!this.webcamSession.capabilities
  }
  // 证明已经连接过
  isScreenSessionConnected () {
    return !!this.screenSession.capabilities
  }
}
export const openViduWebRTCService = new OpenViduWebrtcService()
