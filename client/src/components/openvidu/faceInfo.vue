<template>
  <div style="background-color: white; border-radius: 7px">
    <el-row :gutter="20">
      <el-col :span="4">
        <el-avatar
          :size="50"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        ></el-avatar>
      </el-col>
      <el-col :span="4"
        ><el-badge :value="faceData.expressCount" class="item">
          <el-tag>{{ faceData.expressStr | toExpressStr }}</el-tag>
        </el-badge></el-col
      >
      <!-- type="circle" :width="40"  :status="focusStatus" :text-inside="true" format="专注度"   :stroke-width="26" -->
      <el-col :span="10"
        ><el-progress
          style="margin-top: 10px"
          :percentage="faceData.focusData"
        ></el-progress
      ></el-col>
      <el-col :span="6"
        ><el-tooltip :content="'提醒功能开关: ' + showFocusLow" placement="top">
          <el-switch
            v-model="showFocusLow"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="true"
            :inactive-value="false"
          >
          </el-switch> </el-tooltip
      ></el-col>
    </el-row>

    <el-tooltip :content="'识别情绪开关: ' + checkFaceStatus" placement="top">
      <el-switch
        v-show="showSwitch"
        v-model="checkFaceStatus"
        active-color="#13ce66"
        inactive-color="#ff4949"
        :active-value="true"
        :inactive-value="false"
        @change="checkStart"
      >
      </el-switch>
    </el-tooltip>
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
      faceData: {
        expressCount: 0,
        expressStr: "none",
        focusData: 100,
      },
      sessionName: "",
      // 识别开启状态
      checkFaceStatus: true,
      // 提醒开关
      showFocusLow: true,
      showSwitch: false,
      currentFaces: [],
      monitSetTimeContain: null,
    }
  },
  // 不能用this
  filters: {
    toExpressStr(value) {
      const expressEToC = {
        neutral: "正常",
        happy: "开心",
        sad: "伤心",
        angry: "生气",
        surprised: "惊讶",
        disgusted: "厌恶",
        fearful: "恐惧",
        none: "无",
      }
      return expressEToC[value]
    },
  },
  created() {
    faceService.initialize()
  },
  mounted() {
    this.monitSaveFaceToServer()
  },
  destroyed() {
    faceService.clear()
    clearTimeout(this.uploadMonitSetTimeContain)
  },
  watch: {
    initialTokenStatus(value) {
      if (value && this.checkFaceStatus) {
        this.checkStart()
      }
    },
  },
  props: {
    initialTokenStatus: Boolean,
    // isConnectionLost: Boolean,
  },
  computed: {
    focusStatus() {
      if (this.faceData.focusData >= 60) {
        return "success"
      } else if (this.faceData.focusData >= 30) {
        return "warning"
      } else {
        return "exception"
      }
    },
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
                "saveFace",
                JSON.stringify(this.currentFaces.slice(i))
              )
              i = this.currentFaces.length
            } catch (e) {
              console.log("发送数据失败", e)
            }
          }
          this.uploadMonitSetTimeContain = uploadDataFunc()
        },
        1000
      )
      this.uploadMonitSetTimeContain = uploadDataFunc()
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
            isCapture = true
          }
          const timed = Date.now() - checkStartTime
          console.log("周期检测时间差：" + timed)
          // check
          const checkSesstionToken = tokenService.getWebcamToken()
          if (checkSesstionToken !== startSesstionToken) {
            console.error(
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
          // 完成一次检测并且有数据
          if (faceData) {
            // const { moodData, eyeData, mouthData, headData } = faceData
            // 更新检测图片
            if (faceData.capturedAvatar) {
              isCapture = false
              captureImage = faceData.capturedAvatar
              // 暂时只传一张图片
              faceData.capturedAvatar = ""
            }
            // express变化监听
            const nowExpressStr = faceData.moodData.faceStr
            if (this.faceData.expressStr == nowExpressStr) {
              this.faceData.expressCount++
            } else {
              this.faceData.expressCount = 0
            }
            this.faceData.expressStr = nowExpressStr || "none"
            //添加
            currentFaces.push(faceData)
          }
          // 完成一个周期
          if (faceData && timed >= cycleTime) {
            // 计算专注度
            const focusData = cycleComputer(
              currentFaces,
              Math.min(parseInt(cycleTime / 1000), currentFaces.length)
            )
            // 页面显示数据监听
            this.faceData.focusData = focusData.result * 100
            // 功能提醒
            if (this.showFocusLow && this.faceData.focusData < 30) {
              this.$notify({
                title: "提醒",
                message: "加油!坚持就是胜利！",
                type: "warning",
              })
            }
            console.log("现在的专注度" + focusData.result)

            // 所有数据
            // ,暂不存到缓存中 currentFaces
            const cycleData = {
              checkStartTime,
              checkEndTime: Date.now(),
              checkCount,
              focusData,
              currentFaces,
              captureImage,
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
      // 页面控制
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

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}
</style>