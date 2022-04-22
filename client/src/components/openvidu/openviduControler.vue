<template>
  <el-row>
    <el-col :span="8">
      <div>
        <face-info :initialTokenStatus="initialTokenStatus"></face-info>
      </div>
    </el-col>
    <el-col :span="8" fxFlexOrder="2">
      <div align="center" class="buttonsContainer">
        <el-button-group>
          <el-button
            :style="{ color: isWebcamAudioEnabled ? 'inherit' : 'red' }"
            @click="$emit('micButtonClicked')"
            :disabled="isConnectionLost"
            :icon="
              isWebcamAudioEnabled
                ? 'el-icon-microphone'
                : 'el-icon-turn-off-microphone'
            "
            v-if="hasAudioDevices && ovSettings"
          >
            <!-- <mat-icon v-if="isWebcamAudioEnabled" matTooltip="Mute your audio">mic</mat-icon>
				<mat-icon v-if="!isWebcamAudioEnabled" color="warn" matTooltip="Unmute your audio">mic_off</mat-icon> -->
          </el-button>

          <!-- Camera button -->
          <el-button
            :style="{ color: webcamVideoActive ? 'inherit' : 'red' }"
            id="navCameraButton"
            icon="el-icon-video-camera-solid"
            @click="$emit('camButtonClicked')"
            :disabled="isConnectionLost"
            v-if="!ovSettings || (hasVideoDevices && ovSettings)"
          >
            <!-- <mat-icon v-if="isWebcamVideoEnabled" matTooltip="Mute your cam">videocam</mat-icon>
				<mat-icon v-if="!isWebcamVideoEnabled" color="warn" matTooltip="Unmute your cam">videocam_off</mat-icon> -->
          </el-button>

          <!-- Screenshare button -->
          <el-button
            :style="{ color: screenShareState ? 'inherit' : 'red' }"
            @click="$emit('screenShareClicked')"
            icon="el-icon-s-platform"
            :disabled="isConnectionLost"
            v-if="ovSettings | hasScreenSharing"
          >
          </el-button>

          <!-- Fullscreen button -->
          <el-button
            :icon="fullscreenIcon"
            @click="toggleFullscreen"
            :disabled="isConnectionLost"
            v-if="ovSettings"
          >
          </el-button>

          <!-- Automatic / grid layout button  hasLayoutSpeaking?-->
          <el-button
            :style="{ color: isAutoLayout ? 'inherit' : 'red' }"
            icon="el-icon-phone-outline"
            @click="$emit('layoutButtonClicked')"
            :disabled="isConnectionLost"
            v-if="ovSettings"
          >
          </el-button>
          <!-- Leave seassion button -->
          <el-button
            icon="el-icon-remove"
            style="color: red"
            @click="leaveSessionButtonClicked"
            v-if="ovSettings"
          >
          </el-button>
        </el-button-group>
      </div>
    </el-col>
    <el-col :span="8">
      <!-- is-dot -->
      <el-badge :value="messagesUnread" :hidden="messagesUnread===0" :max="99" class="item">
        <el-button
          style="position: absolute; right: 0"
          icon="el-icon-chat-line-square"
          @click="toggleChat"
          :disabled="isConnectionLost"
          v-if="ovSettings"
        >
        </el-button>
      </el-badge>
    </el-col>
  </el-row>
</template>

<script>
import websocket from "@/lib/utils/openvidu/websocket"
import faceInfo from "@/components/openvidu/faceInfo"
import { mapGetters } from "vuex"
import { localUsersService } from "@/lib/utils/openvidu/openviduMainUser"
import { utils as utilsSrv } from "@/lib/utils/openvidu/openviduUtils"
import { VideoFullscreenIcon } from "@/lib/utils/openvidu/openviduType"
import { chatService } from "@/lib/utils/openvidu/openviduWechat"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"
import { OvSettingsModel } from "@/lib/utils/openvidu/openviduSetting"
export default {
  components: {
    faceInfo,
  },
  data() {
    return {
      // 配置项
      hasScreenSharing: true,
      fullscreenIcon: VideoFullscreenIcon.BIG,
      tokenService,
      chatService,
      localUsersService,
      // isWebcamVideoEnabled: false,
      // isScreenShareEnabled: false,
    }
  },
  computed: {
    ...mapGetters(["screenShareState", "webcamVideoActive","messagesUnread"]),
  },
  props: {
    initialTokenStatus: Boolean,
    isConnectionLost: Boolean,
    // lightTheme: Boolean,
    // 貌似预留通知？
    // showNotification: Boolean,
    ovSettings: OvSettingsModel,
    // 开关
    isWebcamAudioEnabled: Boolean,
    // 别人音频开关
    isAutoLayout: Boolean,
    hasVideoDevices: Boolean,
    hasAudioDevices: Boolean,
  },
  created() {
    this.mySessionId = this.tokenService.getSessionId()
    this.newMessagesNum = this.chatService.messagesUnreadObs()
    // this.isScreenShareEnabled = this.screenShareState
    // this.isWebcamVideoEnabled = this.webcamVideoActive
  },
  methods: {
    leaveSessionButtonClicked() {
      console.log(
        "退出leaveSessionButtonClicked||",websocket,"||",
        websocket.isSpeech,
        websocket.websocketStatus()
      )
      if (websocket.isSpeech && websocket.websocketStatus()) {
        websocket.meetOver()
        return
      }
      this.$emit("leaveSessionButtonClicked")
    },
    toggleChat() {
      this.chatService.toggleChat()
    },
    toggleFullscreen() {
      utilsSrv.toggleFullscreen(document.getElementById("videoRoomNavBar"))
      this.fullscreenIcon =
        this.fullscreenIcon === VideoFullscreenIcon.BIG
          ? VideoFullscreenIcon.NORMAL
          : VideoFullscreenIcon.BIG
    },
  },
}
</script>
 <style scoped>
 .item { 
  position: absolute;
    right: 0;
    top: 13px;
}</style>