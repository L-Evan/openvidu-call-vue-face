<template>
  <div> 
    <div style="display: inline-block">
      <el-avatar
        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
      ></el-avatar>
    </div>
    <el-badge :value="12" class="item">
      <el-tag>悲伤</el-tag>
    </el-badge>
    <el-button icon="el-icon-view" @click="checkStart"> </el-button>
  </div>
</template>

<script>
import { faceService } from "@/lib/utils/openvidu/faceService"
import { cycleComputer } from "@/utils/openvidu/faceEvaluation"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"
export default {
  data() {
    return {
      currentFaces: [],
    }
  },
  created() {
    faceService.initialize()
  },
  methods: {
    checkFaceByTime(cycleTime, monitor = false) {
      let checkStartTime = Date.now()
      // 会议id
      let startSesstionToken = tokenService.getWebcamToken()
      let currentFaces = []
      // 闭包
      const oneTimeFun = setTimeout.bind(
        null,
        async () => {
          const timed = Date.now() - checkStartTime
          // check
          const checkSesstionToken = tokenService.getWebcamToken()
          if (checkSesstionToken !== startSesstionToken) {
            console.warn(
              "异常会议号变化",
              startSesstionToken,
              checkSesstionToken
            )
            // 如果token变了，就不检测了
            faceService.clear()
            return
          }
          const faceData = await faceService.detectFace()
          // const { moodData, eyeData, mouthData, headData } = faceData
          if (faceData) {
            currentFaces.push(faceData)
          }
          if (faceData && timed >= cycleTime) {
            // 计算专注度
            const focusData = cycleComputer(
              currentFaces,
              parseInt(cycleTime / 1000)
            )
            // 所有数据
            const cycleData = { focusData, currentFaces, upload: false }
            // 更新到全局
            this.currentFaces.push(cycleData)
            faceService.addFaceVector(startSesstionToken, cycleData)
            // 清空
            checkStartTime = Date.now()
            currentFaces = []

            if (!monitor) {
              faceService.clear()
              return
            }
          }
          // next
          faceService.setTimeoutContainer = oneTimeFun()
        },
        0
      )
      faceService.setTimeoutContainer = oneTimeFun()
    },
    checkStart() {
      if (faceService.start) {
        faceService.clear()
      }
      faceService.initialize().then(() => {
        faceService.start = true
        // 定时检测
        if (faceService.setMonitorCheck) {
          this.checkFaceByTime(5000, true)
          return
        }
        this.checkFaceByTime(5000)
      })
    },
  },
}
</script>

<style>
</style>