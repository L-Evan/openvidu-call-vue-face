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
        ><el-badge
          :value="faceData.expressCount"
          :hidden="faceData.expressCount === 0"
          :max="9"
          class="item"
        >
          <el-tag>{{ faceData.expressStr | toExpressStr }}</el-tag>
        </el-badge></el-col
      >
      <!-- type="circle" :width="40"  :status="focusStatus" :text-inside="true" format="专注度"   :stroke-width="26" -->
      <el-col :span="10"
        ><el-progress
          style="margin-top: 17px"
          :percentage="faceData.focusData"
        ></el-progress
      ></el-col>
      <el-col :span="6"
        ><el-tooltip
          style="margin-top: 13px"
          :content="'提醒功能开关: ' + showFocusLow"
          placement="top"
        >
          <el-switch
            v-model="showFocusLow"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="true"
            :inactive-value="false"
          >
          </el-switch> </el-tooltip
      >
    <!-- 调试用 -->
    <!-- 用来测试 -->
    <canvas id="myCanvas" v-show="showSwitch" class="canvas" />
    <el-tooltip :content="'识别情绪开关: ' + checkFaceStatus" placement="top">
      <el-switch
          style="margin-top: 17px"
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
      </el-col>
    </el-row>
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
      // 临时识别开启状态
      checkFaceStatus: true,
      // 提醒开关
      showFocusLow: true,
      showSwitch: true,
      currentFaces: [],
      monitSetTimeContain: null,
      uploadDataStatus: true,
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
    this.uploadDataStatus = false
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
    async monitSaveFaceToServer() {
      let i = 0
      const sessionName = tokenService.getSessionId()
      console.log("开始监听数据：", sessionName)
      const uploadDataFunc = async () => {
        console.log("数据监听中", i, this.currentFaces.length)
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
      }
      while (this.uploadDataStatus) {
        await uploadDataFunc()
        await this.sleep(1000)
      }
    },
    async monitCheckFace(cycleTime, monitor = false) {
      let checkStartTime = null
      let isCapture = true
      let captureImage = ""
      let checkCount = 0
      let beforeHaveFace = true
      // 会议id
      let startSesstionToken = tokenService.getWebcamToken()
      let currentFaces = []
      // 闭包
      const oneTimeFun = async () => {
        if (checkCount++ === 0) {
          // 第一次检测清空
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
          beforeHaveFace = true
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
        if (faceData && timed+1000>= cycleTime) {
          // 计算专注度
          const focusData = cycleComputer(
            currentFaces,
            parseInt(cycleTime / 1000)
          )
          // 页面显示数据监听
          this.faceData.focusData =parseInt((focusData.result*100).toFixed(0))
          // 功能提醒
          if (this.showFocusLow && this.faceData.focusData < 55) {
            this.$notify({
              title: "提醒",
              message: "加油!坚持就是胜利！",
              type: "warning",
            })
          }
          console.log(`此时专注度:${this.faceData.focusData} 次数： ${checkCount} 
          时间：${timed}
          成功： ${currentFaces.length}`)

          // 所有数据
          // 暂不存到缓存中 currentFaces
          const cycleData = {
            checkStartTime,
            checkEndTime: Date.now(),
            checkCount,
            focusData,
            currentFaces,
            captureImage,
          }
          // 更新到全局数据队列
          this.currentFaces.push(cycleData)
          faceService.addFaceVector(startSesstionToken, cycleData)
          checkCount = 0
          currentFaces = []
        // 1分钟检测不到人的话会给一个空值
        }else if(timed>15000&&beforeHaveFace){
          if(this.showFocusLow){
            this.$notify({
              title: "提醒",
              message: "OMG！检测不到人了！",
              type: "warning",
            })
          }
          const focusData = { closeEysCount:0,openMouthCount:0,checkTime:0,len:0,fatigue:0, headTurnDegree:0, mood:0, result:0 }
          console.log("识别不到人的情况：",focusData)
          const cycleData = {
            checkStartTime,
            checkEndTime: Date.now(),
            checkCount,
            focusData,
            currentFaces,
            captureImage: faceService.captureUserImage(),
          }
          // 更新到全局数据队列
          this.currentFaces.push(cycleData)
          faceService.addFaceVector(startSesstionToken, cycleData)
          checkCount = 0
          captureImage = ""
          currentFaces = []
          beforeHaveFace = false
        }
        // 当前页面控制状态
        if (timed >= cycleTime && (!monitor || !this.checkFaceStatus)) {
          if (!monitor) {
            this.checkFaceStatus = false
          }
          faceService.clear()
          return
        }
      }
      // 每秒检测一次
      while (faceService.start) {
        const start = Date.now()
        await oneTimeFun()
        const d = 1000 - (Date.now() - start)
        await this.sleep(d > 0 ? d : 0)
      }
    },
    sleep(time) {
      return new Promise((r) => {
        setTimeout(() => {
          r()
        }, time)
      })
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
        console.log("-----开始检测人脸-----")
        faceService.start = true
        // 定时检测
        if (faceService.setMonitorCheck) {
          this.monitCheckFace(5000, true)
          return
        }
        this.monitCheckFace(5000)
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
.canvas {
  position: absolute;
  z-index: 1000;
  width: 1056px;
  height: 966px;
  top: 67px;
}
</style>