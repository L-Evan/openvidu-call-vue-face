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
    <el-tooltip :content="'识别情绪开关: ' + checkFaceStatus" placement="top">
      <el-switch
        v-model="checkFaceStatus"
        active-color="#13ce66"
        inactive-color="#ff4949"
        :active-value="true"
        :inactive-value="false"
        @change="checkStart"
      >
      </el-switch>
    </el-tooltip>
    <!-- socket --> 
    <!-- <el-button icon="el-icon-view" @click="checkStart"> </el-button> -->
  </div>
</template>

<script>
import websocket from "@/lib/utils/openvidu/websocket"

import { faceService } from "@/lib/utils/openvidu/faceService"
import { cycleComputer } from "@/utils/openvidu/faceEvaluation"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"
export default {
  data() {
    return {
      sessionName: "",
      // 识别开启状态
      checkFaceStatus: false,
      currentFaces: [],
      monitSetTimeContain: null,
    }
  },
  created() {
    faceService.initialize()
  },
  mounted() {
    // this.checkStart()
    this.monitSaveFaceToServer()
  },
  destroyed() {
    this.monitSetTimeContain && clearTimeout(this.monitSetTimeContain)
  },
  props: {
    initialTokenStatus: Boolean,
    // isConnectionLost: Boolean,
  },
  methods: {
    monitSaveFaceToServer() {
      let i = 0
      const sessionName = tokenService.getSessionId()
      console.log("开始监听数据：", sessionName)

      const uploadDataFunc = setTimeout.bind(
        null,
        async () => {
          console.log("监听中", i, this.currentFaces.length)
          if (i < this.currentFaces.length) {
            console.log("发送数据" + i, sessionName)
            try {
              websocket.sendDataToServer(
                "saveFace",JSON.stringify(this.currentFaces.slice(i))
              )
              i = this.currentFaces.length
            } catch (e) {
              console.log("发送数据失败", e)
            }
          }
          this.monitSetTimeContain = uploadDataFunc()
        },
        1000
      )
      this.monitSetTimeContain = uploadDataFunc()
    },
    checkFaceByTime(cycleTime, monitor = false) {
      let checkStartTime = null
      let isCapture = true
      let captureImage = ""
      let checkCount = 0
      // 会议id
      let startSesstionToken = tokenService.getWebcamToken()
      let currentFaces = []
      // 闭包
      const oneTimeFun = setTimeout.bind(
        null,
        async () => {
          if (checkCount++ === 0) {
            checkStartTime = Date.now()
            isCapture= true
          }
          const timed = Date.now() - checkStartTime
          console.log("周期检测时间差：" + timed)
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
          const checkPointTime = Date.now()
          const faceData = await faceService.detectFace(isCapture)
          console.log("单次检测差：" + (Date.now() - checkPointTime))
          // const { moodData, eyeData, mouthData, headData } = faceData
          if (faceData) {
            if(faceData.capturedAvatar){
              isCapture=false
              captureImage = faceData.capturedAvatar
              // 暂时只传一张图片
              faceData.capturedAvatar = ""
            }
            currentFaces.push(faceData)
          }
          if (faceData && timed >= cycleTime) {
            // 计算专注度
            const focusData = cycleComputer(
              currentFaces,
              parseInt(cycleTime / 1000)
            )
            // 所有数据
            // ,暂不存到缓存中 currentFaces
            const cycleData = {
              checkStartTime,
              checkEndTime: Date.now(),
              checkCount,
              focusData,
              currentFaces,
              captureImage
            }
            // 更新到全局
            this.currentFaces.push(cycleData)
            faceService.addFaceVector(startSesstionToken, cycleData)
            checkCount = 0
            currentFaces = []
          }
          // 当前页面控制状态 checkFaceStatus
          if (timed >= cycleTime && (!monitor || !this.checkFaceStatus)) {
            if (!monitor) {
              this.checkFaceStatus = false
            }
            faceService.clear()
            return
          }
          // next
          faceService.setTimeoutContainer = oneTimeFun()
        },
        700
      )
      faceService.setTimeoutContainer = oneTimeFun()
    },
    /**
     * faceService.setMonitorCheck 控制是否每次只检测一次
     * checkFaceStatus 控制是否识别
     */
    checkStart() {
      // 当前页面控制
      if (!this.checkFaceStatus) {
        return
      }
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