<template>
  <div
    ref="streams"
    v-if="user"
    class="OT_widget-container"
    @dblclick="toggleVideoSize"
    :id="
      user.streamManager && user.streamManager.stream
        ? user.streamManager.stream.streamId
        : ''
    "
  >
    <!-- toggleNicknameForm 名字修改 我觉得没必要 -->
    <div class="nickname" :class="{ fullscreen: isFullscreen }">
      <div
        class="nicknameContainer"
        v-if="!toggleNickname"
        @click="toggleNicknameForm()"
      >
        <span id="nickname">{{ user.nickname }}</span>
        <!-- 不修改远程的名字 -->
        <span
          v-if="
            user.local ||
            (user.streamManager &&
              !(user.streamManager && user.streamManager.remote))
          "
        >
          (edit)</span
        >
      </div>
      <div
        v-if="toggleNickname && !isRemote"
        :class="{ fullscreen: isFullscreen }"
        id="dialogNickname"
      >
        <button @click="toggleNicknameForm()" id="closeButton">
          <!-- <mat-icon matTooltip="Close">highlight_off</mat-icon> -->
        </button>
        <el-form id="nicknameForm">
          <el-form-item color="primary">
            <el-input :placeholder="user.nickname" autocomplete="off" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- [mutedSound]="mutedSound" -->
    <ov-video
      :mutedSound="mutedSound"
      :stream-manager="user.streamManager"
      @toggleVideoSizeEvent="toggleVideoSize($event)"
    ></ov-video>
    <!-- 喇叭状态 -->
    <div class="statusIcons">
      <div id="statusMic" v-if="!audioActive">
        <i class="el-icon-turn-off-microphone"></i>
      </div>
    </div>

    <div class="videoButtons" v-if="videoButtonStatus">
      <el-dropdown trigger="click">
        <!-- 文字提示 -->
        <el-tooltip
          class="item"
          effect="dark"
          content="设置"
          placement="top-start"
        >
          <!-- @click="toggleVideoMenu($event)" -->
          <el-button circle size="small " icon="el-icon-more"> </el-button>
        </el-tooltip>
        <el-dropdown-menu slot="dropdown">
          <!-- 视频in out -->
          <el-dropdown-item
            v-if="videoActive"
            id="videoZoomButton"
            @click.native="toggleVideoSize()"
            :icon="this.videoSizeIcon"
          >
            <!-- 不同icon -->
            <span v-if="videoSizeIcon === videoSizeIconEnum.NORMAL"
              >放大</span
            >
            <span v-if="videoSizeIcon === videoSizeIconEnum.BIG">放小</span>
          </el-dropdown-item>
          <!-- 控制他人音频播放 不影响左下角 -->
          <el-dropdown-item
            id="volumeButton"
            v-if="isRemote"
            @click.native="toggleSound()"
            :icon="mutedSound ? 'el-icon-phone' : 'el-icon-phone-outline'"
          >
            <span v-if="!mutedSound">视频静音</span>
            <span v-if="mutedSound">取消静音</span>
          </el-dropdown-item>
          <!-- 全屏 -->
          <el-dropdown-item
            v-if="videoActive"
            id="fullscreenButton"
            @click.native="toggleFullscreen()"
            :icon="this.fullscreenIcon"
          >
            <span v-if="fullscreenIcon === videoFullscreenIconEnum.NORMAL"
              >退出全屏</span
            >
            <span v-if="fullscreenIcon === videoFullscreenIconEnum.BIG"
              >视频全屏</span
            >
          </el-dropdown-item>

          <el-dropdown-item
            @click.native="$emit('replaceScreenTrackClicked')"
            icon="el-icon-copy-document"
            id="changeScreenButton"
            v-if="!isRemote && isScreen"
          >
            <span>更换共享</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import OvVideo from "@/components/openvidu/OvVideo"

import { utils as utilsSrv } from "@/lib/utils/openvidu/openviduUtils"
import { UserModel } from "@/lib/utils/openvidu/openviduUser"
import {
  VideoSizeIcon,
  LayoutType,
  VideoType as videoTypeEnum,
  VideoFullscreenIcon,
} from "@/lib/utils/openvidu/openviduType"
export default {
  components: {
    OvVideo,
  },
  data() {
    return {
      videoSizeIconEnum: VideoSizeIcon,
      videoFullscreenIconEnum: VideoFullscreenIcon,
      videoTypeEnum,
      //   videoSizeIcon: VideoFullscreenIcon.BIG,
      fullscreenIcon: VideoFullscreenIcon.BIG,
      // 是否禁他音
      mutedSound: false,
      // 改名字 是否展开
      toggleNickname: false,
      // 全屏
      isFullscreen: false,

      nicknameFormControl: {},
      matcher: {},
    }
  },
  computed: {
    videoSizeIcon() {
      return this.videoSizeBig ? VideoSizeIcon.NORMAL : VideoSizeIcon.BIG
    },
    videoButtonStatus() {
      return (
        (this.user.local && this.videoActive) ||
        (!this.user.local && (this.videoActive || this.audioActive))
      )
    },

    videoActive() {
      return this.user.streamManager?.stream?.videoActive
    },
    audioActive() {
      return this.user.streamManager?.stream?.audioActive
    },
    // 监听失效  待分析
    container_id() {
      console.log(
        "更新id:",
        "container-" + this.user.streamManager?.stream?.streamId
      )
      return "container-" + this.user.streamManager?.stream?.streamId
    },
    isRemote() {
      return this.user.streamManager?.remote
    },
    isScreen() {
      return (
        this.user.streamManager?.stream?.typeOfVideo === videoTypeEnum.SCREEN
      )
    },
  },
  watch: {
    // "user.streamManager.stream": {
    //   handler: function (stream) {
    //     this.container_id = "container-" +stream?.streamId
    //     console.log(this.container_id,stream.streamId, "变化")
    //   },
    //   immediate: false
    // },
  },
  props: {
    videoSizeBig: Boolean,
    user: UserModel,
  },
  created() {},
  methods: {
    //   cdkSrv不知道干嘛
    toggleFullscreenIcon() {
      this.fullscreenIcon =
        this.fullscreenIcon === VideoFullscreenIcon.BIG
          ? VideoFullscreenIcon.NORMAL
          : VideoFullscreenIcon.BIG
    },
    // 放大
    toggleVideoSize(resetAll = false) {
      // streamComponent.element.nativeElement,
      // 拿出其父组件 包含 ROOT_CLASS
      const element = utilsSrv.getHTMLElementByClassName(
        this.$refs["streams"],
        LayoutType.ROOT_CLASS
      )
      this.$emit("toggleVideoSizeClicked", {
        element,
        connectionId: this.user.getConnectionId(),
        resetAll,
      })
    },
    // 改全屏
    toggleFullscreen() {
      utilsSrv.toggleFullscreen(this.$refs["streams"])
    },
    toggleSound() {
      this.mutedSound = !this.mutedSound
    },
    // 改名字  暂时不管
    eventKeyPress(event) {
      // if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
      // nicknameClicked 改名字事件
      // 	this.nicknameClicked.emit(this.nicknameFormControl.value);
      // 关闭
      // 	this.toggleNicknameForm();
      // }
    },
    toggleNicknameForm() {
      if (this.user.isLocal()) {
        this.toggleNickname = !this.toggleNickname
      }
    },
  },
}
</script>

<style src="@/styles/openvidu/openviduStream.css" scoped></style>

<style scoped>
.OT_widget-container >>> .el-icon-turn-off-microphone {
  margin-top: 6px;
}
</style>