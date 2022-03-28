<template>
  <div id="main-container" class="container">
    <div id="join" v-if="!session">
      <div id="img-div">
        <img
          src="@/assets/resources/images/openvidu_grey_bg_transp_cropped.png"
        />
      </div>
      <div id="join-dialog" class="jumbotron vertical-center">
        <h1>Join a video session</h1>
        <div class="form-group">
          <p>
            <label>Participant</label>
            <input
              v-model="myUserName"
              class="form-control"
              type="text"
              required
            />
          </p>
          <p>
            <label>Session</label>
            <input
              v-model="mySessionId"
              class="form-control"
              type="text"
              required
            />
          </p>
          <p class="text-center">
            <button class="btn btn-lg btn-success" @click="joinSession()">
              Join!
            </button>
          </p>
        </div>
      </div>
    </div>

    <div id="session" v-if="session">
      <div id="session-header">
        <h1 id="session-title">{{ mySessionId }}</h1>
        <input
          class="btn btn-large btn-danger"
          type="button"
          id="buttonLeaveSession"
          @click="leaveSession"
          value="Leave session"
        />
      </div>
      <div id="main-video" class="col-md-6">
        <user-video
          :stream-manager="mainStreamManager"
          @click.native="updateMainVideoStreamManager(mainStreamManager)"
        />
        <!-- <canvas ref="canvas" width="{this.width}" height="{this.height}" /> -->
      </div>
      <div id="video-container" class="col-md-6">
        <user-video
          v-if="shareScr"
          :stream-manager="publisher"
          @click.native="updateMainVideoStreamManager(publisher)"
        />
        <user-video
          v-for="sub in subscribers"
          :key="sub.stream.connection.connectionId"
          :stream-manager="sub"
          @click.native="updateMainVideoStreamManager(sub)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CommonPage from "@/lib/utils/mixin/CommonPage"
import api from "@/api/openvidu/openvidu"
import {
  headCheck,
  mouthStatusCheck,
  eyeStatusCheck,
} from "@/utils/openvidu/faceEvaluation"
import axios from "axios"
import { OpenVidu } from "openvidu-browser"
import UserVideo from "@/components/openvidu/UserVideo"
import {
  SsdMobilenetv1Options,
  TinyFaceDetectorOptions,
  detectSingleFace,
  nets,
  loadFaceExpressionModel,
  // matchDimensions,
  // resizeResults,
  // draw,
  // Box,
} from "face-api.js"
axios.defaults.headers.post["Content-Type"] = "application/json"
// 人脸识别
const SSD_MOBILENETV1 = "ssd_mobilenetv1"
// eslint-disable-next-line no-unused-vars
const TINY_FACE_DETECTOR = "tiny_face_detector"
// 人脸检测模型参数  getFaceDetectorOptions获取  由页面上设置过来
// ssd_mobilenetv1 options
// 最小置信阈值  越高检测越精准
let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5
// -----

export default {
  ROUTER_NAME: "meet",
  ROUTER_TITLE: "openvidu测试",
  name: "openvidu",
  ROUTER_ICON: "el-icon-date",
  components: {
    UserVideo,
  },
  mixins: [CommonPage],
  data() {
    return {
      shareScr: false,
      // 人脸识别 canvas
      width: 200,
      height: 200,
      // canvas: undefined,
      options: {},
      // 检测模式
      selectedFaceDetector: SSD_MOBILENETV1,
      // 情绪判别
      emojiCount:{},
      chectCount:0,
      checkStartTime:0,
      closeEysCount:0,
      openMouthCount:0,
      // openvidu
      OV: undefined,
      session: undefined,
      mainStreamManager: undefined,
      publisher: undefined,
      screenPublisher: undefined,
      subscribers: [],
      mySessionId: "SessionA",
      myUserName: "Participant" + Math.floor(Math.random() * 100),
    }
  },
  async created() {
    await this.init()
  },
  computed: {
    video() {
      if (this.publisher && this.publisher.videos.length > 0) {
        return this.publisher.videos[0].video
      }
      return undefined
    },
  },
  mounted() {
    // this.canvas = this.$refs["canvas"];
  }, 
  methods: {
    computerMood(){
      const t = this.checkStartTime
      // perclos
      const m1 = this.closeEysCount/this.chectCount
      // 平均闭眼
      const m2 = t/this.closeEysCount
      // 打哈切频率
      const m3 = this.openMouthCount/this.chectCount
      return m1+0.8*m2+0.5*m3
    },
    /**
     * 初始化加载模型 models
     */
    async init() {
      // SSD 移动网络检测模型 // 微型人脸检测器模型  检测人脸区域
      await this.getCurrentFaceDetectionNet().loadFromUri("/models")
      // 脸部固定住 68火焰脸
      await nets.faceLandmark68Net.loadFromUri("/models")
      // 检测表情，可以不经过68
      await loadFaceExpressionModel("/models")
      console.log("初始化完毕")
    },
    /**
     * 获取现在的模型
     */
    getCurrentFaceDetectionNet() {
      //  selectedFaceDetector 人脸检测模型
      if (this.selectedFaceDetector === SSD_MOBILENETV1) {
        return nets.ssdMobilenetv1
      }
      if (this.selectedFaceDetector === TINY_FACE_DETECTOR) {
        return nets.tinyFaceDetector
      }
    },
    /**
     * 判断人脸区域检测模型加载情况
     */
    isFaceDetectionModelLoaded() {
      return !!this.getCurrentFaceDetectionNet().params
    },
    /**
     *  人脸模型option
     */
    getFaceDetectorOptions() {
      return this.selectedFaceDetector === SSD_MOBILENETV1
        ? new SsdMobilenetv1Options({ minConfidence })
        : new TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    },

    /** @name 人脸检测 */
    async detectFace() {
      // 判断模型加载
      if (!this.isFaceDetectionModelLoaded()) {
        console.log("开始加载数据")
        await this.getCurrentFaceDetectionNet().load("/models")
      }
      console.log("---------------检测中------------------")
      const startTime = Date.now()
      // 开始检测
      const result = await detectSingleFace(this.video)
        .withFaceLandmarks()
        .withFaceExpressions()
      if (result) { 
        console.log("结果:", result) 
        // 疲劳值
        if (result.landmarks._positions) {
          const face68_ = result.landmarks._positions
          eyeStatusCheck(face68_)
          mouthStatusCheck(face68_)
          headCheck(result)
        }

        // 情绪
        const { expressions } = result
        let expressMax = 0
        let faceStr = ""
        for (const face in expressions) {
          if (expressions[face] > expressMax) {
            expressMax = expressions[face]
            faceStr = face
          }
        }
        console.log("情绪："+faceStr)
        // 表情次数
        this.emojiCount[faceStr]++
        // 检测次数
        this.checkCount++
      }else{
        console.log("检测不到")
      }
      console.log("检测时间: " + (Date.now() - startTime))
      // 定时检测
      // setTimeout(() => this.detectFace(), 0)
    },
    joinSession() {
      // --- Connect to the session with a valid user token ---
      // 'getToken' method is simulating what your server-side should do.
      // 'token' parameter should be retrieved and returned by your own backend
      this.getToken(this.mySessionId).then(({ token }) => {
        // --- Get an OpenVidu object ---
        this.OV = new OpenVidu()

        // --- Init a session ---
        this.session = this.OV.initSession()
        this.token = token
        // --- Specify the actions when events take place in the session ---
        // On every new Stream received...
        this.session.on("streamCreated", ({ stream }) => {
          console.log(stream, "创建一个")
          const subscriber = this.session.subscribe(stream)
          this.subscribers.push(subscriber)
        })

        // On every Stream destroyed...
        this.session.on("streamDestroyed", ({ stream }) => {
          const index = this.subscribers.indexOf(stream.streamManager, 0)
          if (index >= 0) {
            this.subscribers.splice(index, 1)
          }
        })

        // On every asynchronous exception...
        this.session.on("exception", ({ exception }) => {
          console.warn(exception)
        })

        console.log("token ->", token, [token])
        // 第二个参数是每个用户将event.stream.connection.data在事件属性中收到的值
        this.session
          .connect(token, { clientData: this.myUserName })
          .then(() => {
            // --- Get your own camera stream with the desired properties ---
            let publisher = this.OV.initPublisher(
              undefined,
              {
                audioSource: undefined,
                videoSource: undefined,
                publishAudio: true,
                publishVideo: true,
                resolution: "640x480",
                frameRate: 30,
                insertMode: "APPEND",
                mirror: false, // Whether to mirror your local video or not
              },
              function (error) {
                console.log(error)
              }
            )

            this.mainStreamManager = publisher

            this.publisher = publisher

            // --- Publish your stream ---
            this.session.publish(this.publisher)
          })
          .catch((error) => {
            console.log(
              "There was an error connecting to the session:",
              error.code,
              error.message
            )
          })
      })

      window.addEventListener("beforeunload", this.leaveSession)
    },
    sharingScreen() {
      var OV = new OpenVidu()
      // --- Get your own camera stream with the desired properties ---
      let screenPublisher = OV.initPublisher(
        undefined,
        {
          audioSource: undefined,
          videoSource: "screen",
          publishAudio: true,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false, // Whether to mirror your local video or not
        },
        function (error) {
          if (error.name == "SCREEN_EXTENSION_NOT_INSTALLED") {
            // showWarning(error.message);
            // showWarning可以展示一个挑战到'error.message'下载地址的按钮
            // 用户就可以跳转去安装扩展插件，安装之后浏览器需要重启
          } else if (error.name == "SCREEN_SHARING_NOT_SUPPORTED") {
            alert("您的浏览器不支持屏幕分享")
          } else if (error.name == "SCREEN_EXTENSION_DISABLED") {
            alert("您需要打开屏幕分享扩展插件")
          } else if (error.name == "SCREEN_CAPTURE_DENIED") {
            alert("您需要选择分享的窗口或应用")
          }
        }
      )
      this.screenPublisher = screenPublisher

      // --- Publish your stream ---
      this.session.publish(this.screenPublisher)
    },
    removeUser() {
      api.removeToken({ sessionName: this.mySessionId, token: this.token })
    },
    leaveSession() {
      this.removeUser()
      // --- Leave the session by calling 'disconnect' method over the Session object ---
      if (this.session) this.session.disconnect()
      this.session = undefined
      this.mainStreamManager = undefined
      this.publisher = undefined
      this.subscribers = []
      this.OV = undefined
      window.removeEventListener("beforeunload", this.leaveSession)
    },
    startCheckFace(){
      console.log("start check face")
      this.checkStartTime = Date.now()
      this.detectFace()
    },
    updateMainVideoStreamManager(stream) {
      if (this.mainStreamManager === stream) {
        this.startCheckFace()
        return
      }

      this.mainStreamManager = stream
    },
    /**
     * --------------------------
     * SERVER-SIDE RESPONSIBILITY
     * --------------------------
     * These methods retrieve the mandatory user token from OpenVidu Server.
     * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
     * the API REST, openvidu-java-client or openvidu-node-client):
     *   1) Initialize a Session in OpenVidu Server	(POST /openvidu/api/sessions)
     *   2) Create a Connection in OpenVidu Server (POST /openvidu/api/sessions/<SESSION_ID>/connection)
     *   3) The Connection.token must be consumed in Session.connect() method
     */
    getToken(mySessionId) {
      // return this.createSession(mySessionId).then((sessionId) =>
      //   this.createToken(sessionId)
      // )
      return api.getToken({ sessionName: mySessionId })
    },
  },
}
</script>
