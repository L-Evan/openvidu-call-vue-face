<template>
  <video ref="video" :id="id" :muted="mutedSound" autoplay />
</template>

<script>
import { VideoType } from "@/lib/utils/openvidu/openviduType"
export default {
  name: "OvVideo",
  watch: {
    streamManager(streamManager) {
      if (streamManager?.addVideoElement) {
        console.log("watch: 出现视频流", streamManager)
      }
      setTimeout(() => {
        if (this._videoElement && streamManager) {
          // 视频变大
          if (streamManager.stream.typeOfVideo === VideoType.SCREEN) {
            this._videoElement.style.objectFit = "contain"
            this._videoElement.style.background = "#272727"
            this.enableVideoSizeBig()
          } else {
            this._videoElement.style.objectFit = "cover"
          }
          // 添加到流
          streamManager?.addVideoElement(this._videoElement)
        }
      })
    },
  },
  props: {
    streamManager: Object,
    mutedSound: Boolean,
    isRoom: {
      type: Boolean,
      default: false,
    }, 
  }, 
  computed: {
    id() {
      let id = this.isRoom ? "room-" : ""
      id+= this.streamManager?.stream?.streamId
        ? "video-" + this.streamManager.stream.streamId
        : "video-undefined"
      return  id
    },
  },
  mounted() {
    // this.streamManager.addVideoElement
    this._videoElement = this.$refs["video"]
    //  el获取 video,更新视频流
    this.streamManager?.addVideoElement(this._videoElement)
  },
  methods: {
    enableVideoSizeBig() {
      // Doing video size bigger.
      // Timeout because of connectionId is null and icon does not change
      setTimeout(() => {
        this.$emit("toggleVideoSizeEvent", true)
      }, 590)
    },
  },
}
</script>
<style src="@/styles/openvidu/openviduStream.css" scoped></style>

<style>