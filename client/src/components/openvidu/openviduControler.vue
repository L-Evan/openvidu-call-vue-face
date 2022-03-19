<template>
  <el-row>
    <el-col :span="4">
      <div>
        <div style="display: inline-block">
          <el-avatar
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          ></el-avatar>
        </div>
        <el-badge :value="12" class="item">
          <el-tag>悲伤</el-tag>
        </el-badge>
      </div>
    </el-col>
    <el-col :span="16" fxFlexOrder="2">
      <div align="center" class="buttonsContainer">
        <el-button-group>
          <el-button
            :style="{ color: isWebcamAudioEnabled ? 'inherit' : 'red' }"
            @click="$emit('toggleMicrophone')"
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
            :style="{ color: isWebcamVideoEnabled ? 'inherit' : 'red' }"
            id="navCameraButton"
            icon="el-icon-video-camera-solid"
            @click="$emit('toggleCamera')"
            :disabled="isConnectionLost"
            v-if="!ovSettings || (hasVideoDevices && ovSettings)"
          >
            <!-- <mat-icon v-if="isWebcamVideoEnabled" matTooltip="Mute your cam">videocam</mat-icon>
				<mat-icon v-if="!isWebcamVideoEnabled" color="warn" matTooltip="Unmute your cam">videocam_off</mat-icon> -->
          </el-button>

          <!-- Screenshare button -->
          <el-button
            :style="{ color: isScreenShareEnabled ? 'inherit' : 'red' }"
            @click="$emit('toggleScreenShare')"
            icon="el-icon-s-platform"
            :disabled="isConnectionLost"
            v-if="ovSettings | hasScreenSharing"
          >
          </el-button>

          <!-- Fullscreen button -->
          <el-button
            icon="el-icon-zoom-in"
            @click="$emit('toggleFullscreen')"
            :disabled="isConnectionLost"
            v-if="ovSettings"
          >
          </el-button>

          <!-- Automatic / grid layout button  hasLayoutSpeaking?-->
          <el-button
            :style="{ color: isAutoLayout ? 'inherit' : 'red' }"
            icon="el-icon-phone-outline"
            @click="$emit('toggleSpeakerLayout')"
            :disabled="isConnectionLost"
            v-if="ovSettings"
          >
          </el-button>

          <!-- Leave seassion button -->
          <el-button
            icon="el-icon-remove"
            style="color: red"
            @click="$emit('leaveSession')"
            v-if="ovSettings"
          >
          </el-button>
        </el-button-group>
      </div>
    </el-col>
    <el-col :span="4">
      <el-button style="position: absolute;right:0;"
        icon="el-icon-chat-line-square"
        @click="$emit('toggleChat')"
        :disabled="isConnectionLost"
        v-if="ovSettings"
      >
        <!-- icon chat -->
      </el-button>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from "vuex"
import { localUsersService } from "@/lib/utils/openvidu/openviduMainUser"
import { chatService } from "@/lib/utils/openvidu/openviduWechat"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"
import { OvSettingsModel } from "@/lib/utils/openvidu/openviduSetting"
export default {
  data() {
    return {
      // 配置项
      hasScreenSharing:true,
      

      tokenService,
      chatService,
      localUsersService,
      isWebcamVideoEnabled:false,
      isScreenShareEnabled:false,
    }
  },
  computed: {
    ...mapGetters(["screenShareState", "webcamVideoActive"]),
  },
  props: {
    isConnectionLost: Boolean,
    // lightTheme: Boolean,
    // compact: Boolean,
    // 貌似预留通知？
    // showNotification: Boolean,
    ovSettings: OvSettingsModel,
    // 视频流开关
    isWebcamAudioEnabled: Boolean,
    // 别人音频开关
    isAutoLayout: Boolean,
    hasVideoDevices: Boolean,
    hasAudioDevices: Boolean,
  },
  created() {
    this.mySessionId = this.tokenService.getSessionId()
    this.newMessagesNum =   this.chatService.messagesUnreadObs()
    this.isScreenShareEnabled = this.screenShareState
    this.isWebcamVideoEnabled = this.webcamVideoActive
  },
  methods: {},
}
</script>
 