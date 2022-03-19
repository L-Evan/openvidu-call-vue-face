<template>
  <!-- @externalConfig="externalConfig"  -->
  <!-- @ovSettings="ovSettings" -->

  <el-container style="height: 100%">
    <el-header v-show="joinedVidioRoom"
      ><openvidu-controler
        @toggleChat="
          () => {
            chatService.toggleChat()
          } "
        :ovSettings="ovSettings"
        :hasVideoDevices="hasVideoDevices"
        :hasAudioDevices="hasAudioDevices"
        :isAutoLayout="isAutoLayout"
        :isConnectionLost="isConnectionLost"
      ></openvidu-controler
    ></el-header>
    <el-container>
      <el-container>
        <el-main>
          <div style="width: 90%; margin: 55px auto">
            <card
              :ovSettings="ovSettings"
              v-if="showConfigRoomCard"
              @join="onConfigRoomJoin"
              @leaveSession="leaveSession()"
              @publisherCreated="emitPublisher($event)"
              ref="openvidu"
            ></card>
            <div v-if="joinedVidioRoom" class="sidenav-main">
              <div
                id="layout"
                class="bounds"
                :style="{
                  top: '0px',
                  bottom: '0px',
                }"
              >
              <!--ovSettings hasToolbar hasFooter -->
                <div class="OT_root OT_publisher custom-class"
                  id="localUser"
                  :key="index"
                  v-for="(localUser, index) in localUsers"
                  :class="['OT_root','OT_publisher','custom-class',!localUser.streamManager?.stream?.videoActive?'OV_small':''    ]"
                   
                >
                  <!-- Only webcam video will be shown if webcamera is available -->
                  <!-- <stream-component
                    [user]="localUser"
                    [videoSizeBig]="localUser.videoSizeBig"
                    (nicknameClicked)="onNicknameUpdate($event)"
                    (replaceScreenTrackClicked)="onReplaceScreenTrack($event)"
                    (toggleVideoSizeClicked)="onToggleVideoSize($event)"
                  ></stream-component> -->
                  <user-video :stream-manager="localUser" />
                </div>

                <div
                  :key="index"
                  v-for="(user, index) in remoteUsers"
                  :class="['OT_root','OT_publisher','custom-class',!user.streamManager?.stream?.videoActive?'OV_small':''    ]"
                  id="remoteUsers" 
                >
                  <!-- <stream-component
                    [user]="user"
                    [videoSizeBig]="user.videoSizeBig"
                    (toggleVideoSizeClicked)="onToggleVideoSize($event)"
                  ></stream-component> -->
                  <user-video :stream-manager="user" />
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

import UserVideo from "@/components/openvidu/UserVideo"
import { ExternalConfigModel } from "@/lib/utils/openvidu/openviduExternalConfig"
import { chatService } from "@/lib/utils/openvidu/openviduWechat"
import openviduControler from "@/components/openvidu/openviduControler"
import { mapGetters } from "vuex"
import { openViduWebRTCService } from "@/lib/utils/openvidu/openviduWrtc"
import { VideoType } from "@/lib/utils/openvidu/openviduType"
import { localUsersService } from "@/lib/utils/openvidu/openviduMainUser"
import { utils as utilsSrv } from "@/lib/utils/openvidu/openviduUtils"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"
import { OvSettingsModel } from "@/lib/utils/openvidu/openviduSetting"
import { remoteUsersService } from "@/lib/utils/openvidu/openviduRemoteUser"
import { devicesService as oVDevicesService } from "@/lib/utils/openvidu/device"
import card from "@/components/openvidu/openviduConfig"
import chat from "@/components/openvidu/openviduChat"
import CommonPage from "@/lib/utils/mixin/CommonPage"
export default {
  mixins: [CommonPage],
  ROUTER_NAME: "meettest",
  ROUTER_TITLE: "视频会议",
  name: "meettest",
  ROUTER_ICON: "el-icon-date",
  components: {
    card,
    chat,
    openviduControler,UserVideo
  },

  computed: {
    ...mapGetters(["localUsers", "toggleChat", "remoteUsers"]),
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
      OV: undefined,
      chatService,
      //------------------
      ovSettings: null, //OvSettingsModel,
      compact: false,
      sidenavMode: "side", // 'side' | 'over' =
      showConfigRoomCard: true,
      session: null, //Session,
      sessionScreen: null, //Session,
      participantsNameList: [],
      // 链接丢失
      isConnectionLost: false,
      // 音频开关
      isAutoLayout: true,
      hasVideoDevices: true,
      hasAudioDevices: true,
    }
  },
  // 父beforeCreate-> 父create -> 子beforeCreate-> 子created -> 子mounted -> 父mounted
  async created() {
    this.externalConfigInit()
    localUsersService.initialize()
    openViduWebRTCService.initialize()
    // setting
    this.ovSettings = new OvSettingsModel()
    // 代表现在有setting
    this.ovSettings._ovSettings(this.ovSettings)

    this.ovSettings.setScreenSharing(
      this.ovSettings.hasScreenSharing() && !utilsSrv.isMobile()
    )
  },
  mounted() {
    this.chatSidenav = this.$refs["chatSidenav"]
  },
  methods: {
    onConfigRoomJoin() {
      console.log("join")
      this.hasVideoDevices = oVDevicesService.hasVideoDeviceAvailable()
      this.hasAudioDevices = oVDevicesService.hasAudioDeviceAvailable()
      this.showConfigRoomCard = false
      // vuex
      // this.localUsers = localUsersService.OVUsers()
      this.remoteUsersSubscription = remoteUsersService.remoteUsers()
      this.remoteUserNameSubscription = remoteUsersService.remoteUserNameList()

      tokenService.initialize(this.ovSettings)

      setTimeout(() => {
        // this.oVLayout.initialize()
        // this.checkSizeComponent()
        this.joinToSession()
      }, 50)
    },
    // 加入会议预处理
    async joinToSession() {
      // 初始化session
      openViduWebRTCService.initSessions()
      this.session = openViduWebRTCService.getWebcamSession()
      // this._session.emit(this.session)
      this.sessionScreen = openViduWebRTCService.getScreenSession()
      // 初始化监听
      this.subscribeToConnectionCreatedAndDestroyed()
      this.subscribeToStreamCreated()
      this.subscribeToStreamDestroyed()
      this.subscribeToStreamPropertyChange()
      this.subscribeToNicknameChanged()
      //ref 聊天组件挂载到service  need toggle()
      this.chatService.setChatComponent(this.chatSidenav)
      // 监听chat事件
      this.chatService.subscribeToChat()
      // 延时么 获取关闭情况 还不是特别了解
      this.subscribeToChatComponent()
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
    // 核心：开始连接
    async connectToSession() {
      //1.  获取token Initialize tokens from externalConfig or create new ones
      await tokenService.initTokens(this.externalConfig)

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
      // this.oVLayout.update()
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
            (error?.error || error?.message)
        })
      }
    },
    // 更新界面时间？
    subscribeToChatComponent() {
      this.chatSubscription = this.chatService.toggleChatObs()
      // .subscribe(
      //   (opened) => {
      //     const timeout = this.externalConfig ? 300 : 0
      //     this.oVLayout.update(timeout)
      //   }
      // )
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
        // this.utilsSrv.closeDialog()
      })
      this.session.on("sessionDisconnected", (event) => {
        if (event.reason === "networkDisconnect") {
          // this.utilsSrv.closeDialog()
          this.leaveSession()
        }
      })
    },
    // 挂载 链接的 session Event
    subscribeToConnectionCreatedAndDestroyed() {
      this.session.on("connectionCreated", (event) => {
        if (
          openViduWebRTCService.isMyOwnConnection(event.connection.connectionId)
        ) {
          return
        }

        const nickname = utilsSrv.getNicknameFromConnectionData(
          event.connection.data
        )
        // 更新到 remoteUsersService，名字代表这个用户
        remoteUsersService.addUserName(event)
        // 屏幕名字特殊？
        // Adding participant when connection is created
        if (!nickname?.includes("_" + VideoType.SCREEN)) {
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
        // 改变了视频源？
        if (event.changedProperty === "videoActive") {
          remoteUsersService.updateUsers()
        }
      })
    },
    subscribeToNicknameChanged() {
      this.session.on("signal:nicknameChanged", (event) => {
        const connectionId = event.from.connectionId
        if (openViduWebRTCService.isMyOwnConnection(connectionId)) {
          return
        }
        const nickname = utilsSrv.getNicknameFromConnectionData(event.data)
        remoteUsersService.updateNickname(connectionId, nickname)
      })
    },
    leaveSession() {
      console.log("Leaving session...")
      // 断开链接？
      openViduWebRTCService.disconnect()
      // 回页面
      // this.router.navigate([""])
    },
    emitPublisher($event) {
      console.log("放入", $event)
    },
  },
}
</script>
<style src="@/styles/openvidu/openviduRoom.css" scoped></style>
