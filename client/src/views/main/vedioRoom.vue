<template>
  <!-- @externalConfig="externalConfig"  -->
  <!-- @ovSettings="ovSettings" -->
  <el-container style="height: 100%" id="videoRoomNavBar">
    <el-header v-show="joinedVidioRoom"
      ><openvidu-controler v-if="joinedVidioRoom"
        :initialTokenStatus ="initialTokenStatus"
        @camButtonClicked="toggleCam"
        @micButtonClicked="toggleMic"
        @screenShareClicked="toggleScreenShare"
        @layoutButtonClicked="toggleSpeakerLayout"
        @leaveSessionButtonClicked="leaveSession"
        :ovSettings="ovSettings"
        :hasVideoDevices="hasVideoDevices"
        :hasAudioDevices="hasAudioDevices"
        :isAutoLayout="isAutoLayout"
        :isWebcamAudioEnabled="toolbarMicIconEnabled()"
        :isConnectionLost="isConnectionLost"
      ></openvidu-controler
    ></el-header>
    <el-container>
      <el-container>
        <el-main>
          <div style="width: 90%; margin: 55px auto; overflow-y: hidden">
            <openvidu-config
              v-if="showConfigRoomCard"
              :ovSettings="ovSettings"
              @join="onConfigRoomJoin"
              @leaveSession="leaveSession"
              @publisherCreated="emitPublisher($event)"
              ref="openvidu"
            ></openvidu-config>
            <div v-if="joinedVidioRoom" class="sidenav-main">
              <div
                id="layout"
                :style="{
                  top: '66px',
                  bottom: '25px',
                }"
                class="bounds"
              >
                <div
                  id="localUser"
                  v-for="(localUser, localindex) in localUsers"
                  :key="localindex"
                  :class="[
                    'OT_root',
                    'OT_publisher',
                    'custom-class',
                    isSmallVideo(localUser) ? 'OV_small' : '',
                  ]"
                >
                  <!-- ,!(localUser.streamManager?.stream?.videoActive)?'OV_small':'' -->
                  <vedio-stream
                    @replaceScreenTrackClicked="onReplaceScreenTrack($event)"
                    :videoSizeBig="localUser.videoSizeBig"
                    @toggleVideoSizeClicked="onToggleVideoSize($event)"
                    :user="localUser"
                  />
                </div>

                <div
                  v-for="(user, remoteindex) in remoteUsers"
                  :key="remoteindex + 100"
                  :class="[
                    'OT_root',
                    'OT_publisher',
                    'custom-class',
                    isSmallVideo(user) ? 'OV_small' : '',
                  ]"
                  id="remoteUsers"
                >
                  <vedio-stream
                    :videoSizeBig="user.videoSizeBig"
                    @toggleVideoSizeClicked="onToggleVideoSize($event)"
                    :user="user"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-main>
        <el-footer v-show="joinedVidioRoom">Footer</el-footer>
      </el-container>
      <transition name="el-zoom-in-center">
        <el-aside v-show="toggleChat" width="400px">
          <chat ref="chatSidenav"></chat>
        </el-aside>
      </transition>
    </el-container>
  </el-container>
</template>

<script>
import websocket from "@/lib/utils/openvidu/websocket"
import vedioStream from "@/components/openvidu/openviduStream"
// import UserVideo from "@/components/openvidu/UserVideo"
import { faceService } from "@/lib/utils/openvidu/faceService"

import { openViduLayoutService as oVLayout } from "@/lib/utils/openvidu/layout"
import { ExternalConfigModel } from "@/lib/utils/openvidu/openviduExternalConfig"
import { storageSrv } from "@/lib/utils/openvidu/newStory"
import { chatService } from "@/lib/utils/openvidu/openviduWechat"
import openviduControler from "@/components/openvidu/openviduControler"
import { mapGetters } from "vuex"
import { openViduWebRTCService } from "@/lib/utils/openvidu/openviduWrtc"
import {
  VideoType,
  LayoutType,
  ScreenType,
} from "@/lib/utils/openvidu/openviduType"
import { localUsersService } from "@/lib/utils/openvidu/openviduMainUser"
import { utils as utilsSrv } from "@/lib/utils/openvidu/openviduUtils"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"
import { OvSettingsModel } from "@/lib/utils/openvidu/openviduSetting"
import { remoteUsersService } from "@/lib/utils/openvidu/openviduRemoteUser"
import { devicesService as oVDevicesService } from "@/lib/utils/openvidu/device"
import openviduConfig from "@/components/openvidu/openviduConfig"
import chat from "@/components/openvidu/openviduChat"
import CommonPage from "@/lib/utils/mixin/CommonPage"
export default {
  mixins: [CommonPage],
  ROUTER_NAME: "meettest",
  ROUTER_TITLE: "config",
  name: "meettest",
  ROUTER_HIDDEN: true,
  ROUTER_ICON: "el-icon-date",
  components: {
    openviduConfig,
    chat,
    openviduControler,
    vedioStream,
  },
  watch: {
    websocketStatus(value) {
      if (this.initialTokenStatus && !value) {
        this.leaveSession()
      }
    },
  },
  computed: {
    ...mapGetters([
      "localUsers",
      "toggleChat",
      "remoteUsers",
      "websocketStatus",
    ]),
    joinedVidioRoom() {
      return (
        this.localUsers &&
        this.localUsers.length > 0 &&
        !this.showConfigRoomCard &&
        this.ovSettings
      )
    },
  },
  data() {
    return {
      // 挂载事件集合
      removeEmit: [],
      // 设置
      ovSettings: null, //OvSettingsModel
      showConfigRoomCard: true,
      // 个人会议
      // 屏幕
      session: null, //Session,
      sessionScreen: null, //Session
      // session链接状态
      isConnectionLost: false,
      // 播放音频开关
      isAutoLayout: true,
      // 设备是否拥有
      hasVideoDevices: true,
      hasAudioDevices: true,
      initialTokenStatus: false,
    }
  },
  // 父beforeCreate-> 父create -> 子beforeCreate-> 子created -> 子mounted -> 父mounted
  created() {
    // 加载人脸识别
    faceService.initialize()
  },
  mounted() {
    // 外部配置 传进来 此处做模拟
    this.externalConfigInit()

    localUsersService.initialize()
    openViduWebRTCService.initialize()
    // setting
    this.ovSettings = this.externalConfig
      ? this.externalConfig.getOvSettings()
      : new OvSettingsModel()

    // 代表现在有setting
    this.ovSettings._ovSettings(this.ovSettings)
    this.ovSettings.setScreenSharing(
      this.ovSettings.hasScreenSharing() && !utilsSrv.isMobile()
    )
    // 组件
    this.chatSidenav = this.$refs["chatSidenav"]

    // 事件监听【】
    this.removeEmit.push({ type: "resize", fun: this.updateLayout })
    this.removeEmit.push({ type: "beforeunload", fun: this.leaveSession })
    window.addEventListener("resize", this.updateLayout)
    window.addEventListener("beforeunload", this.leaveSession)
  },
  destroyed() {
    // Reconnecting session is received in Firefox
    // To avoid 'Connection lost' message uses session.off()
    // this.session?.off("reconnecting")
    remoteUsersService.clear()
    oVLayout.clear()
    localUsersService.clear()
    faceService.clear()
    this.session = null
    this.sessionScreen = null
    this.removeEmit.forEach((item) => {
      window.removeEventListener(item.type, item.fun, false)
    })
    websocket.wsDestroy()
  },
  methods: {
    // 检测窗口大小控制聊天框样子
    // checkSizeComponent =》sidenavMode
    /**
     * 更新布局
     */
    updateLayout() {
      oVLayout.update()
    },
    isSmallVideo(localUser) {
      return !localUser.streamManager?.stream?.videoActive
    },
    onConfigRoomJoin() {
      console.log("onConfigRoomJoin：加入会议")
      this.hasVideoDevices = oVDevicesService.hasVideoDeviceAvailable()
      this.hasAudioDevices = oVDevicesService.hasAudioDeviceAvailable()
      this.showConfigRoomCard = false

      tokenService.initialize(this.ovSettings)

      setTimeout(() => {
        // 初始化会议布局
        oVLayout.initialize()
        // 控制聊天框
        // this.checkSizeComponent()
        this.joinToSession()
      }, 50)
    },
    // 加入会议预处理
    async joinToSession() {
      // 初始化session 会议
      openViduWebRTCService.initSessions()
      this.session = openViduWebRTCService.getWebcamSession()
      // this._session.emit(this.session)
      this.sessionScreen = openViduWebRTCService.getScreenSession()
      // 初始化监听
      // 新连接
      this.subscribeToConnectionCreatedAndDestroyed()
      this.subscribeToStreamCreated()
      this.subscribeToStreamDestroyed()
      this.subscribeToStreamPropertyChange()
      this.subscribeToNicknameChanged()
      //ref 聊天组件挂载到service  need toggle()
      chatService.setChatComponent(this.chatSidenav)
      // 监听chat事件
      chatService.subscribeToChat()
      // 延时么 获取关闭情况 还不是特别了解  开关抽屉 需要更新布局
      // this.subscribeToChatComponent()
      // 监听 重新链接，更新链接情况：如丢失
      this.subscribeToReconnection()
      // 获取链接，并且会求下token
      await this.connectToSession()
      // Workaround, firefox does not have audio when publisher join with muted camera
      // 判断webrtc支持程度，如手机浏览器  微信支持  苹果的浏览器也支持？
      if (utilsSrv.isFirefox() && !localUsersService.hasWebcamVideoActive()) {
        openViduWebRTCService.publishWebcamVideo(true)
        openViduWebRTCService.publishWebcamAudio(false)
      }
    },
    // 初始化token信息，如果有的话
    externalConfigInit() {
      this.externalConfig = new ExternalConfigModel()
      // having token is can
      // if (this.externalConfig.canJoinToSession()) {
    },
    // 核心：开始连接会议
    async connectToSession() {
      //1.  获取token Initialize tokens from externalConfig or create new ones
      await tokenService.initTokens(this.externalConfig)
      // websocket
      websocket.start()
      this.initialTokenStatus = true
      if (localUsersService.areBothConnected()) {
        // 2. 链接
        await this.connectWebcamSession()
        await this.connectScreenSession()
        // 3. 发布
        await openViduWebRTCService.publishWebcamPublisher()
        await openViduWebRTCService.publishScreenPublisher()
      } else if (localUsersService.isOnlyScreenConnected()) {
        await this.connectScreenSession()
        await openViduWebRTCService.publishScreenPublisher()
        // 只有视频
      } else {
        await this.connectWebcamSession()
        await openViduWebRTCService.publishWebcamPublisher()
      }
      // !Deprecated
      // this._joinSession.emit()
      oVLayout.update()
    },
    // 链接
    async connectWebcamSession() {
      try {
        await openViduWebRTCService.connectWebcamSession(
          tokenService.getWebcamToken()
        )
      } catch (error) {
        console.log(
          "connectWebcamSession：There was an error connecting to the session:",
          error.code,
          error.message
        )
        this.$message({
          message:
            "connectWebcamSession：There was an error connecting to the session:" +
            (error?.error || error?.message),
        })
      }
    },
    async connectScreenSession() {
      try {
        await openViduWebRTCService.connectScreenSession(
          tokenService.getScreenToken()
        )
      } catch (error) {
        // this._error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
        console.log(
          "There was an error connecting to the session:",
          error.code,
          error.message
        )
        this.$message({
          message:
            "There was an error connecting to the session:" +
            (error?.error || error?.message),
        })
      }
    },
    // 重新链接状态控制,提醒
    subscribeToReconnection() {
      this.session.on("reconnecting", () => {
        console.log("Connection lost: Reconnecting")
        this.isConnectionLost = true
        this.$message({
          // "Connection Problem",
          text: "Oops! Trying to reconnect to the session ...",
        })
      })
      this.session.on("reconnected", () => {
        console.log("Connection lost: Reconnected")
        this.isConnectionLost = false
        // utilsSrv.closeDialog()
      })
      this.session.on("sessionDisconnected", (event) => {
        console.warn("本链接断开，" + event?.reason)
        if (
          event.reason === "networkDisconnect" ||
          event.reason === "sessionClosedByServer"
        ) {
          // utilsSrv.closeDialog()
          console.warn("本链接断开，" + event?.reason)
          this.leaveSession(event.reason)
        }
      })
    },
    // 挂载 链接的 session Event
    subscribeToConnectionCreatedAndDestroyed() {
      this.session.on("connectionCreated", (event) => {
        // 自己连接不处理
        if (
          openViduWebRTCService.isMyOwnConnection(event.connection.connectionId)
        ) {
          return
        }
        console.log("接受新连接", event)
        const nickname = utilsSrv.getNicknameFromConnectionData(
          event.connection.data
        )
        // 添加一个用户名
        remoteUsersService.addUserName(event)
        // 不是共享屏幕
        // Adding participant when connection is created
        if (!nickname?.includes("_" + VideoType.SCREEN)) {
          // 添加一个用户
          remoteUsersService.add(event, null)
          openViduWebRTCService.sendNicknameSignal(event.connection)
        }
      })

      this.session.on("connectionDestroyed", (event) => {
        if (
          openViduWebRTCService.isMyOwnConnection(event.connection.connectionId)
        ) {
          return
        }
        remoteUsersService.deleteUserName(event)
        const nickname = utilsSrv.getNicknameFromConnectionData(
          event.connection.data
        )
        // Deleting participant when connection is destroyed
        if (!nickname?.includes("_" + VideoType.SCREEN)) {
          remoteUsersService.removeUserByConnectionId(
            event.connection.connectionId
          )
        }
      })
    },
    //来了一个屏幕
    subscribeToStreamCreated() {
      this.session.on("streamCreated", (event) => {
        const connectionId = event.stream.connection.connectionId
        if (openViduWebRTCService.isMyOwnConnection(connectionId)) {
          return
        }
        const subscriber = this.session.subscribe(event.stream, undefined)
        remoteUsersService.add(event, subscriber)
        // this.oVSessionService.sendNicknameSignal(event.stream.connection);
      })
    },
    subscribeToStreamDestroyed() {
      this.session.on("streamDestroyed", (event) => {
        const connectionId = event.stream.connection.connectionId
        remoteUsersService.removeUserByConnectionId(connectionId)
        // event.preventDefault();
      })
    },
    subscribeToStreamPropertyChange() {
      this.session.on("streamPropertyChanged", (event) => {
        const connectionId = event.stream.connection.connectionId
        if (openViduWebRTCService.isMyOwnConnection(connectionId)) {
          return
        }
        // 改变了视频源 开启状态
        if (event.changedProperty === "videoActive") {
          // 更新页面
          remoteUsersService.updateUsers()
        }
      })
    },
    // 用户修改姓名(未优化)
    subscribeToNicknameChanged() {
      this.session.on("signal:nicknameChanged", (event) => {
        const connectionId = event.from.connectionId
        if (openViduWebRTCService.isMyOwnConnection(connectionId)) {
          return
        }
        console.log("用户修改姓名：", event)
        const nickname = utilsSrv.getNicknameFromConnectionData(event.data)
        remoteUsersService.updateNickname(connectionId, nickname)
      })
    },
    // 放到中间
    onToggleVideoSize(event) {
      console.log("改变大小", event)
      const element = event.element
      if (event.resetAll) {
        this.resetAllBigElements()
      }
      // 加class 让其变大 oVLayout会识别
      utilsSrv.toggleBigElementClass(element)
      // Has been mandatory change the user zoom property here because of
      // zoom icons and cannot handle publisherStartSpeaking event in other component
      if (event?.connectionId) {
        if (openViduWebRTCService.isMyOwnConnection(event.connectionId)) {
          localUsersService.toggleZoom(event.connectionId)
        } else {
          remoteUsersService.toggleUserZoom(event.connectionId)
        }
      }
      // 更新页面 dom改style模式
      oVLayout.update()
    },
    // 改变屏幕
    onReplaceScreenTrack(event) {
      console.log("改变屏幕", event)
      openViduWebRTCService.replaceScreenTrack()
    },
    
    async leaveSession() {
      console.log("Leaving session...")
      // 断开链接 session disconnect and stop stream
      openViduWebRTCService.disconnect()
      if (websocket.isSpeech) {
        this.$router.push({ name: "echars" })
        return
      }
      this.$router.push({ name: "meet" })
    },
    emitPublisher($event) {
      console.log("新public", $event)
    },
    // 控制功能区  大部分通过属性更改
    onNicknameUpdate(nickname) {
      localUsersService.updateUsersNickname(nickname)
      storageSrv.set(Storage.USER_NICKNAME, nickname)
      openViduWebRTCService.sendNicknameSignal()
    },
    // 改变麦
    toggleMic() {
      if (localUsersService.isWebCamEnabled()) {
        openViduWebRTCService.publishWebcamAudio(
          !localUsersService.hasWebcamAudioActive()
        )
        return
      }
      openViduWebRTCService.publishScreenAudio(
        !localUsersService.hasScreenAudioActive()
      )
    },

    async toggleCam() {
      const publishVideo = !localUsersService.hasWebcamVideoActive()

      // Disabling webcam
      if (localUsersService.areBothConnected()) {
        openViduWebRTCService.publishWebcamVideo(publishVideo)
        localUsersService.disableWebcamUser()
        openViduWebRTCService.unpublishWebcamPublisher()
        return
      }
      // Enabling webcam
      if (localUsersService.isOnlyScreenConnected()) {
        const hasAudio = localUsersService.hasScreenAudioActive()

        if (!openViduWebRTCService.isWebcamSessionConnected()) {
          await this.connectWebcamSession()
        }
        await openViduWebRTCService.publishWebcamPublisher()
        openViduWebRTCService.publishScreenAudio(false)
        openViduWebRTCService.publishWebcamAudio(hasAudio)
        localUsersService.enableWebcamUser()
      }
      // Muting/unmuting webcam
      openViduWebRTCService.publishWebcamVideo(publishVideo)
    },

    async toggleScreenShare() {
      // Disabling screenShare
      if (localUsersService.areBothConnected()) {
        this.removeScreen()
        return
      }

      // Enabling screenShare
      if (localUsersService.isOnlyWebcamConnected()) {
        const screenPublisher = this.initScreenPublisher()

        screenPublisher.once("accessAllowed", async (event) => {
          // Listen to event fired when native stop button is clicked
          screenPublisher.stream
            .getMediaStream()
            .getVideoTracks()[0]
            .addEventListener("ended", () => {
              console.log("Clicked native stop button. Stopping screen sharing")
              this.toggleScreenShare()
            })
          console.log("ACCESS ALOWED screenPublisher")
          // 保证不删视频（会导致重复的情况）
          localUsersService.enableScreenUser(screenPublisher)
          // 判断是否链接
          if (!openViduWebRTCService.isScreenSessionConnected()) {
            console.log("视乎链接过期")
            await this.connectScreenSession()
          }
          // 判断是否发布
          await openViduWebRTCService.publishScreenPublisher()
          // 判断名字是否改过
          openViduWebRTCService.sendNicknameSignal()
          // 看是否删掉视频
          if (!localUsersService.hasWebcamVideoActive()) {
            // Disabling webcam
            localUsersService.disableWebcamUser()
            openViduWebRTCService.unpublishWebcamPublisher()
          }
        })

        screenPublisher.once("accessDenied", (event) => {
          console.log("ScreenShare: Access Denied")
        })
        return
      }

      // Disabling screnShare and enabling webcam
      const hasAudio = localUsersService.hasScreenAudioActive()
      // 重新发布 ，保证其成为主
      console.log("关闭分享")
      await openViduWebRTCService.publishWebcamPublisher()
      openViduWebRTCService.publishScreenAudio(false)
      openViduWebRTCService.publishWebcamAudio(hasAudio)
      // 这里不知为啥 放2个。。。 后面又删掉有病
      // localUsersService.enableWebcamUser()
      this.removeScreen()
    },

    toggleSpeakerLayout() {
      if (!localUsersService.isScreenShareEnabled()) {
        this.isAutoLayout = !this.isAutoLayout

        console.log(
          "Automatic Layout ",
          this.isAutoLayout ? "Disabled" : "Enabled"
        )
        if (this.isAutoLayout) {
          this.subscribeToSpeechDetection()
          return
        }
        console.log("Unsubscribe to speech detection")
        // 关闭监听声音
        this.session.off("publisherStartSpeaking")
        this.resetAllBigElements()
        oVLayout.update()
        return
      }
      console.log("Screen is enabled. Speech detection has been rejected")
    },
    // 辅助
    removeScreen() {
      localUsersService.disableScreenUser()
      openViduWebRTCService.unpublishScreenPublisher()
    },
    // 重置大小
    resetAllBigElements() {
      utilsSrv.removeAllBigElementClass()
      remoteUsersService.resetUsersZoom()
      localUsersService.resetUsersZoom()
    },
    // 音频播放订阅声音（别人）
    subscribeToSpeechDetection() {
      console.log("Subscribe to speech detection", this.session)
      // Has been mandatory change the user zoom property here because of
      // zoom icons and cannot handle publisherStartSpeaking event in other component
      this.session.on("publisherStartSpeaking", (event) => {
        const someoneIsSharingScreen =
          remoteUsersService.someoneIsSharingScreen()
        if (
          !localUsersService.isScreenShareEnabled() &&
          !someoneIsSharingScreen
        ) {
          const elem = event.connection.stream.streamManager.videos[0].video
          const element = utilsSrv.getHTMLElementByClassName(
            elem,
            LayoutType.ROOT_CLASS
          )
          this.resetAllBigElements()
          remoteUsersService.setUserZoom(event.connection.connectionId, true)
          this.onToggleVideoSize({ element })
        }
      })
    },
    // 麦克风状态
    toolbarMicIconEnabled() {
      if (localUsersService.isWebCamEnabled()) {
        return localUsersService.hasWebcamAudioActive()
      }
      return localUsersService.hasScreenAudioActive()
    },
    initScreenPublisher() {
      const videoSource = ScreenType.SCREEN
      const audioSource = this.hasAudioDevices ? undefined : null
      const willThereBeWebcam =
        localUsersService.isWebCamEnabled() &&
        localUsersService.hasWebcamVideoActive()
      const hasAudio = willThereBeWebcam
        ? false
        : this.hasAudioDevices && localUsersService.hasWebcamAudioActive()
      const properties = openViduWebRTCService.createPublisherProperties(
        videoSource,
        audioSource,
        true,
        hasAudio,
        false
      )

      try {
        return openViduWebRTCService.initPublisher(undefined, properties)
      } catch (error) {
        console.log(error)
        this.$message(utilsSrv.handlerScreenShareError(error))
      }
    },
  },
}
</script>
<style src="@/styles/openvidu/openviduRoom.css" scoped></style>
