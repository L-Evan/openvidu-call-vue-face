<template>
  <el-card
    v-show="showConfigCard"
    style="max-width: 1150px"
    class="modal-content cardContainer"
  >
    <div slot="header" class="clearfix">
      <span>配置会议信息</span>
      <el-button
        @click="close"
        style="float: right; padding: 4px"
        type="danger"
        icon="el-icon-close"
        circle
      ></el-button>
    </div>
    <div class="modal-body">
      <div class="row align-items-center">
        <div class="col-sm-6 col-md-6 col-lg-6 leftSection">
          <div class="videoContainer">
            <div
              v-for="(localUser, index) in localUsers"
              :key="index"
              class="ng-star-inserted"
            >
              <!-- Only webcam video will be shown if webcamera is available -->
              <ov-video
                v-if="
                  (localUser.isCamera() && hasVideoDevices) ||
                  localUser.isScreen()
                "
                :stream-manager="localUser.streamManager"
                :class="{
                  ovVideoSmall: localUsers.length > 1 && index === 0,
                  ovSrcBig: localUsers.length > 1 && index === 1,
                }"
              ></ov-video>
              <div
                class="cameraMessageContainer"
                v-if="localUser.isCamera() && !hasVideoDevices"
              >
                <span v-if="!hasVideoDevices && !hasAudioDevices"
                  >Oops! Camera and microphone are not available</span
                >
                <span v-if="!hasVideoDevices && hasAudioDevices"
                  >Oops! Camera is not available</span
                >
                <span v-if="hasVideoDevices && !hasAudioDevices"
                  >Oops! Microphone is not available</span
                >
              </div>
            </div>
            <!---->
          </div>
          <div class="avatarButton ng-star-inserted">
            <el-button
            v-if="hasVideoDevices"
              @click="captureAvatar"
              type="primary"
              icon="el-icon-camera"
              >拍照</el-button
            >
          </div>
          <!---->
        </div>
        <el-form
          :rules="rules"
          ref="form"
          :model="form"
          label-position="top"
          class="col-sm-6 col-md-6 col-lg-6 rightSection"
        >
          <div class="avatarContainer ng-star-inserted">
            <h3>Avatar</h3>
          </div>
          <div id="avatarSection">
            <div class="">
              <el-radio
                v-model="form.avatarType"
                :label="AvatarType.CAPTURED"
                id="avatarContainer"
              >
                <div id="imgText">
                  <span>Press Avatar</span>
                </div>
                <el-avatar :src="capturedAvatar" id="avatarImg" />
              </el-radio>
              <el-radio v-model="form.avatarType" :label="AvatarType.DEFAULT" id="avatarContainer">
                <img
                  id="avatarImg"
                  src="@/assets/resources/images/openvidu_globe_bg_transp_cropped.png"
                />
              </el-radio>
            </div>
          </div>
          <el-form-item prop="nickName" label="用户姓名">
            <span
              ><el-button icon="el-icon-user-solid" circle></el-button
            ></span>
            <el-input
             @keyup.enter="joinSession"
              @change="onNicknameUpdate"
              v-model="form.nickName"
            ></el-input>
          </el-form-item>
          <el-form-item label="选择音频" v-if=" hasAudioDevices">
            <!-- el-icon-turn-off-microphone -->
            <span
              ><el-button
                :style="{ color: switchAudio ? 'inherit' : 'red' }"
                @click="toggleMic"
                :icon="
                  switchAudio
                    ? 'el-icon-microphone'
                    : 'el-icon-turn-off-microphone'
                "
                circle
              ></el-button
            ></span>
            <el-select
              @change="onMicrophoneSelected"
              v-model="form.micSelectedDevice"
              placeholder="请选择音频"
            >
              <el-option
                v-for="(item, index) in microphones"
                :key="index"
                :label="item.label"
                :value="item.device"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="hasVideoDevices" label="网络摄像">
            <span
              ><el-button
                :style="{ color: switchVideo ? 'inherit' : 'red' }"
                @click="toggleCam"
                icon="el-icon-video-camera-solid"
                circle
              ></el-button
            ></span>
            <el-select
              @change="onCameraSelected"
              v-model="form.camSelectedDevice"
              placeholder="请选择摄像头"
            >
              <el-option
                v-for="(item, index) in cameras"
                :key="index"
                :label="item.label"
                :value="item.device"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="共享屏幕">
            <span
              ><el-button
                :style="{ color: screenShareState ? 'inherit' : 'red' }"
                @click="toggleScreenShare"
                icon="el-icon-s-platform"
                circle
              ></el-button
            ></span>
            <el-input
              disabled
              :value="screenShareState ? 'screen' : 'None'"
            ></el-input>
          </el-form-item>
          <!---->
        </el-form>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <el-button
        style="margin: 15px; width: 80%"
        @click="joinSession"
        type="warning"
        >进入会议</el-button
      >
    </div>
  </el-card>
</template>

<script>
import { AvatarType } from "@/lib/utils/openvidu/openviduType"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"
import { devicesService } from "@/lib/utils/openvidu/device"
import { localUsersService } from "@/lib/utils/openvidu/openviduMainUser"
import { avatarService } from "@/lib/utils/openvidu/avatar"
import { storageSrv } from "@/lib/utils/openvidu/newStory"
import { OvSettingsModel } from "@/lib/utils/openvidu/openviduSetting"
import { OpenViduErrorName } from "openvidu-browser/lib/OpenViduInternal/Enums/OpenViduError"
import CommonPage from "@/lib/utils/mixin/CommonPage"
import { openViduWebRTCService } from "@/lib/utils/openvidu/openviduWrtc"
import { utils } from "@/lib/utils/openvidu/openviduUtils"
import ovVideo from "./OvVideo"
import {
  CameraType,
  ScreenType,
  Storage,
} from "@/lib/utils/openvidu/openviduType"
import { mapGetters } from "vuex"
export default {
  components: {
    ovVideo,
  },
  extends: CommonPage,

  data() {
    return {
      AvatarType,
      // 所有用户
      avatarService: null,
      // 是否显示卡片  等待权限获取成功再显示
      showConfigCard: false,
      // 头像base64
      capturedAvatar: "",
      // 是否有
      hasVideoDevices: false,
      hasAudioDevices: false,
      // 无设备自动直接进入 属于配置属性
      isAutoPublish: false,
      // 是否使用设备
      isAudioActive: false,
      // 共享屏幕
      screenStr: "",
      microphones: [],
      cameras: [],
      camSelected: {},
      micSelected: {},
      form: {
        nickName: "",
        micSelectedDevice: "",
        camSelectedDevice: "",
        avatarType: AvatarType.DEFAULT,
      },
      rules: {
        nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
      },
    }
  },
  props: { ovSettings: OvSettingsModel },
  watch: {
    camSelected(value) {
      if (value?.device) this.form.camSelectedDevice = value.device
    },
    micSelected(value) {
      if (value?.device) this.form.micSelectedDevice = value.device
    },
  },
  computed: {
    ...mapGetters(["localUsers", "devices", "screenShareState","webcamVideoActive"]),
    switchAudio() {
      return this.isAudioActive && this.hasAudioDevices
    },
    switchVideo() {
      return this.webcamVideoActive && this.hasVideoDevices
    },
  },
  created() {},
  async mounted() {
    this.setSessionName()
    await devicesService.initDevices()
    console.log("第一次设备初始化完毕", devicesService)
    this.start()
  },
  methods: {
    // 父组件调用开始 store.getters
    async start() {
      // 设备属性同步到此组件
      console.log("config start", devicesService)
      this.setDevicesInfo(devicesService)
      if (this.hasAudioDevices || this.hasVideoDevices) {
        await this.initwebcamPublisher()
        console.log("第二次设备初始化完毕", devicesService)
      } else {
        console.log("没有设备")
        // 用户没有设备  作为观察者 Publisher is null
        // emitPublisher通知上层 多了发布者
        // Emit publisher to webcomponent and angular-library
        this.emitPublisher(null)
        this.showConfigCard = true
      }
    },
    // 选择一个摄像头
    async onCameraSelected() {
      const videoSource = this.form.camSelectedDevice
      if (videoSource) {
        // Is New deviceId different from the old one?
        // 需要改变的话  需要重新订阅
        if (devicesService.needUpdateVideoTrack(videoSource)) {
          const mirror = devicesService.cameraNeedsMirror(videoSource)
          await openViduWebRTCService.replaceTrack(videoSource, null, mirror)
          devicesService.setCamSelected(videoSource)
          this.camSelected = devicesService.getCamSelected()
        }
        // Publish Webcam
        openViduWebRTCService.publishWebcamVideo(true)
        // this.isVideoActive = true
        return
      }
      // Unpublish webcam
      openViduWebRTCService.publishWebcamVideo(false)
      // this.isVideoActive = false
    },
    onNicknameUpdate() {
      localUsersService.updateUsersNickname(this.form.nickName)
      storageSrv.set(Storage.USER_NICKNAME, this.form.nickName)
    },
    // 音乐联通
    toggleMic() {
      this.isAudioActive = !this.isAudioActive
      // wrtc
      this.publishAudio(this.isAudioActive)
    },
    // 发布声音
    publishAudio(audio) {
      localUsersService.isWebCamEnabled()
        ? openViduWebRTCService.publishWebcamAudio(audio)
        : openViduWebRTCService.publishScreenAudio(audio)
    },
    // 点击开启视频
    toggleCam() {
      const isVideoActive = !this.webcamVideoActive
      // 发布视频  并且 更新webrt发布状态
      openViduWebRTCService.publishWebcamVideo(isVideoActive)
      // 2个代表关闭视频
      if (localUsersService.areBothConnected()) {
        localUsersService.disableWebcamUser()
        // 麦克风处理，webrt的
        openViduWebRTCService.publishScreenAudio(this.isAudioActive)
        // !this.subscribeToVolumeChange(<Publisher>this.localUsers[0].getStreamManager());
        // 只有屏幕
      } else if (localUsersService.isOnlyScreenConnected()) {
        // (<Publisher>this.localUsers[0].getStreamManager()).off('streamAudioVolumeChange');
        // 2个都放
        localUsersService.enableWebcamUser()
      }
    },
    // 选择音频
    async onMicrophoneSelected() {
      // device
      const audioSource = this.form.micSelectedDevice
      if (audioSource) {
        // Is New deviceId different than older?
        if (devicesService.needUpdateAudioTrack(audioSource)) {
          console.log(this.camSelected)
          // 看看是不是前置摄像头，传给他人的时候判断是否需要镜像处理？
          const mirror = devicesService.cameraNeedsMirror(
            this.camSelected.device
          )
          // 重新发布webrtc
          await openViduWebRTCService.replaceTrack(null, audioSource, mirror)
          devicesService.setMicSelected(audioSource)
          this.micSelected = devicesService.getMicSelected()
        }
        // Publish microphone
        this.publishAudio(true)
        this.isAudioActive = true
        return
      }
      // Unpublish microhpone
      this.publishAudio(false)
      this.isAudioActive = false
    },
    async initwebcamPublisher() {
      const micStorageDevice = this.micSelected?.device || undefined
      const camStorageDevice = this.camSelected?.device || undefined

      const videoSource = this.hasVideoDevices ? camStorageDevice : false
      const audioSource = this.hasAudioDevices ? micStorageDevice : false
      const publishAudio = this.hasAudioDevices ? this.isAudioActive : false
      const publishVideo = this.hasVideoDevices ? this.webcamVideoActive : false
      const mirror =
        this.camSelected && this.camSelected.type === CameraType.FRONT
      const properties = {
        videoSource,
        audioSource,
        publishVideo,
        publishAudio,
        mirror,
      }
      if (this.hasAudioDevices || this.hasVideoDevices) {
        // 创建一个publisher
        const publisher = openViduWebRTCService.initPublisher(
          undefined,
          properties
        )
        // 初始化视频流
        localUsersService.setWebcamPublisher(publisher)
        this.handlePublisherSuccess(publisher)
        this.handlePublisherError(publisher)
      } else {
        // 2个都没有的话，采用选择 自动进入会议室 或者 显示卡片 让其选择共享屏幕与否？
        localUsersService.setWebcamPublisher(null)
        // Emit publisher to webcomponent and angular-library
        // this.ovSettings.isAutoPublish() -> true
        if (this.isAutoPublish) {
          this.joinSession()
          return
        }
        this.showConfigCard = true
      }
    },
    /** 保存头像
     *  */

    captureAvatar() {
      this.capturedAvatar = avatarService.createCapture()
    },
    // 进入下个页面
    joinSession() {
      console.log("join Session")
      // 校验 this.nicknameFormControl.valid
      this.$refs["form"].validate((valid) => {
        if (valid) {
          avatarService.setFinalAvatar(this.form.avatarType)
          this.$emit("join")
          return true
        } else {
          console.log("error submit!!")
          return false
        }
      })
      // 隐藏着car
      // this.scrollToBottom()
    },
    // 点击共享屏幕
    toggleScreenShare() {
      // Disabling screenShare
      // 2个  代表是想关屏幕
      if (this.localUsers.length === 2) {
        localUsersService.disableScreenUser()
        return
      }
      // Enabling screenShare  只有一个相机
      if (localUsersService.isOnlyWebcamConnected()) {
        const screenPublisher = this.initScreenPublisher()
        // 授权
        screenPublisher.on("accessAllowed", () => {
          screenPublisher.stream
            .getMediaStream()
            .getVideoTracks()[0]
            .addEventListener("ended", () => {
              // 主动点击取消授权 在浏览器上？吗
              console.log("Clicked native stop button. Stopping screen sharing")
              this.toggleScreenShare()
            })
          localUsersService.enableScreenUser(screenPublisher)
          // 不给视频  就去掉视频
          if (!localUsersService.hasWebcamVideoActive()) {
            localUsersService.disableWebcamUser()
          }
        })
        screenPublisher.on("accessDenied", () => {
          console.log("ScreenShare: Access Denied")
        })
        return
      }
      // 只有屏幕的情况，那就是先触发放进去用户，再把屏幕关了
      console.log("？有必要么  直接关了不能？")
      // Disabling screnShare and enabling webcam
      localUsersService.enableWebcamUser()
      localUsersService.disableScreenUser()
    },
    // 发布一个屏幕流
    initScreenPublisher() {
      const videoSource = ScreenType.SCREEN
      const audioSource = this.hasAudioDevices ? undefined : null
      // 可以加共享
      const willThereBeWebcam =
        localUsersService.isWebCamEnabled() &&
        localUsersService.hasWebcamVideoActive()
      // 有视频流么，有肯定无需声音
      const hasAudio = willThereBeWebcam
        ? false
        : this.hasAudioDevices && this.isAudioActive
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
        this.$message({
          text: utils.handlerScreenShareError(error),
          type: "error",
        })
      }
    },
    handlePublisherSuccess(publisher) {
      // 授权 成功事件
      publisher.once("accessAllowed", async () => {
        // Emit publisher to webcomponent and angular-library
        this.emitPublisher(publisher)
        // 自动进入
        if (this.isAutoPublish) {
          this.joinSession()
          return
        }

        if (devicesService.areEmptyLabels()) {
          // 重新初始化可以获取字符串名字
          await devicesService.initDevices()
          if (this.hasAudioDevices) {
            const audioLabel = publisher?.stream
              ?.getMediaStream()
              ?.getAudioTracks()[0]?.label
            devicesService.setMicSelected(audioLabel)
          }

          if (this.hasVideoDevices) {
            const videoLabel = publisher?.stream
              ?.getMediaStream()
              ?.getVideoTracks()[0]?.label
            devicesService.setCamSelected(videoLabel)
          }
          this.setDevicesInfo(devicesService)
        }

        this.showConfigCard = true
      })
    },
    handlePublisherError(publisher) {
      // 拒绝获取权限
      publisher.once("accessDenied", (e) => {
        let message
        if (e.name === OpenViduErrorName.DEVICE_ALREADY_IN_USE) {
          console.log("Video device already in use. Disabling video device...")
          // Allow access to the room with only mic if camera device is already in use
          this.hasVideoDevices = false
          devicesService.disableVideoDevices()
          return this.initwebcamPublisher()
        }
        if (e.name === OpenViduErrorName.DEVICE_ACCESS_DENIED) {
          message = "Access to media devices was not allowed."
          this.hasVideoDevices = false
          this.hasAudioDevices = false
          devicesService.disableVideoDevices()
          devicesService.disableAudioDevices()
          return this.initwebcamPublisher()
        } else if (e.name === OpenViduErrorName.NO_INPUT_SOURCE_SET) {
          message =
            "No video or audio devices have been found. Please, connect at least one."
        }
        this.$message({
          message: e.name + "_" + message,
          type: "error",
        })
        console.log(e.message)
      })
    },
    // 不太理解，暂时理解是传递给下个组件
    emitPublisher(publisher) {
      this.$emit("publisherCreated", publisher)
    },
    switchSatus(type) {
      if (!this.switchs[type]) {
        this.form[type] = ""
        return
      }
    },
    // 初始化屏幕
    setDevicesInfo() {
      this.hasVideoDevices = devicesService.hasVideoDeviceAvailable()
      this.hasAudioDevices = devicesService.hasAudioDeviceAvailable()
      this.microphones = devicesService.getMicrophones()
      this.cameras = devicesService.getCameras()
      this.camSelected = devicesService.getCamSelected() //
      this.micSelected = devicesService.getMicSelected()
    },
    // 暂时固定session Name
    setSessionName() {
      this.mySessionId = this.$route.params.sessionName || "aa"
      tokenService.setSessionId(this.mySessionId)
    },
    close() {
      this.$emit("leaveSession")
      this.showConfigCard = false
    },
  },
  destroyed() {
    devicesService.clear()
  },
}
</script>

<style src="@/styles/openvidu/openviduConfig.css" scoped></style>
<style scoped>
/* 控制头像属性 */
.el-avatar {
  background: initial;
}
.el-radio >>> .el-radio__inner {
  opacity: 0;
}
.is-checked {
  background-color: #67c23a;
}
.is-checked #imgText {
  color: white;
}

/* 卡片居中 */
.cardContainer {
  margin: 0 auto;
}
.el-form-item >>> label {
  width: 80%;
  padding: 0;
  margin-left: 20%;
}
.el-input >>> {
  display: inline-block;
  max-width: 80%;
}
.el-form-item >>> {
  margin-bottom: 0px;
}
.el-form-item >>> span {
  width: 20%;
  display: inline-block;
}
.el-select >>> {
  width: 80%;
}
</style>
