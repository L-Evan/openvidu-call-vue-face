<template>
  <div id="main-container" class="container">
    <div id="join" v-if="!session">
      <div id="img-div">
        <img src="resources/images/openvidu_grey_bg_transp_cropped.png" />
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
import {headCheck,mouthStatusCheck,eyeStatusCheck} from "./utils/faceEvaluation";
import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import UserVideo from "./components/UserVideo";
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
} from "face-api.js";
axios.defaults.headers.post["Content-Type"] = "application/json";

const OPENVIDU_SERVER_URL = "https://" + location.hostname + ":4443";
const OPENVIDU_SERVER_SECRET = "MY_SECRET";
// 人脸识别
const SSD_MOBILENETV1 = "ssd_mobilenetv1";
// eslint-disable-next-line no-unused-vars
const TINY_FACE_DETECTOR = "tiny_face_detector";
// 人脸检测模型参数  getFaceDetectorOptions获取  由页面上设置过来
// ssd_mobilenetv1 options
let minConfidence = 0.5;

// tiny_face_detector options
let inputSize = 512;
let scoreThreshold = 0.5;
// -----

export default {
  name: "App",
  components: {
    UserVideo,
  },

  data() {
    return {
      shareScr: false,
      // 人脸识别 canvas
      width: 200,
      height: 200,
      // canvas: undefined,
      options: {},
      // 检测模式
      selectedFaceDetector: TINY_FACE_DETECTOR,

      OV: undefined,
      session: undefined,
      mainStreamManager: undefined,
      publisher: undefined,
      screenPublisher: undefined,
      subscribers: [],
      mySessionId: "SessionA",
      myUserName: "Participant" + Math.floor(Math.random() * 100),
    };
  },
  created() {},
  computed: {
    video() {
      if (this.publisher && this.publisher.videos.length > 0) {
        return this.publisher.videos[0].video;
      }
      return undefined;
    },
  },
  mounted() {
    this.init();
    // this.canvas = this.$refs["canvas"];
  },
  methods: {
    async init() {
      console.log("初始化");
      this.selectedFaceDetector = SSD_MOBILENETV1;
      // 加载火焰脸
      await this.getCurrentFaceDetectionNet().load("/models");
      // 脸部固定
      await nets.faceLandmark68Net.loadFromUri("/models");
      // 检测表情
      await loadFaceExpressionModel("/models");
      console.log("初始化完毕");
    },
    getCurrentFaceDetectionNet() {
      //  selectedFaceDetector 存储是哪种人脸模型
      if (this.selectedFaceDetector === SSD_MOBILENETV1) {
        return nets.ssdMobilenetv1;
      }
      if (this.selectedFaceDetector === TINY_FACE_DETECTOR) {
        return nets.tinyFaceDetector;
      }
    },
    isFaceDetectionModelLoaded() {
      return !!this.getCurrentFaceDetectionNet().params;
    },
    getFaceDetectorOptions() {
      return this.selectedFaceDetector === SSD_MOBILENETV1
        ? new SsdMobilenetv1Options({ minConfidence })
        : new TinyFaceDetectorOptions({ inputSize, scoreThreshold });
    },
    
    /** @name 人脸检测 */
    async detectFace() {
      //非常重要：防止卡死  按帧数来 一次
      // await new Promise((resolve) => requestAnimationFrame(resolve));

      // 判断模型加载
      if (!this.isFaceDetectionModelLoaded()) {
        console.log("检测1次");
        await this.getCurrentFaceDetectionNet().load("/models");
      }
      // 获取每个人脸模型的设置
      // const options=this.getFaceDetectorOptions();
      // const ts = Date.now();
      // 检测图像中具有最高置信度得分的脸部,估计option判断使用的方式
      // let result=await detectSingleFace(this.video, options);
      // console.log("检测2次");
      // if(!result)
      //   return this.detectFaceA();
      // console.log("我看看人脸怎样", result);
      // 匹配尺寸 小问题
      // const dims=matchDimensions(this.canvas, this.video, true);
      // 调整检测到的框的大小，以防显示的图像的大小与原始 小问题
      // const resizedResult=resizeResults(result, dims);
      // 人脸框位置
      // const box=resizedResult.box;
      // 检测框是否在取景框内
      // if(!this.checkInViewFinder(box))
      //   return this.detectFaceA();

      // 开始检测
      // result = await result.withFaceExpressions(); .withFaceLandmarks()
      const result = await detectSingleFace(this.video).withFaceExpressions();
      if (result) {
        console.log("我看看结果", result);
        // 疲劳值
        if (result.landmarks._positions) {
          const face68_ = result.landmarks._positions;
          eyeStatusCheck(face68_);
          mouthStatusCheck(face68_);
          headCheck(result);
        }

        // 情绪
        const { expressions } = result;
        let expressMax = 0;
        let faceStr = "";
        for (const face in expressions) {
          if (expressions[face] > expressMax) {
            expressMax = expressions[face];
            faceStr = face;
          }
        }
        console.log(faceStr);
      }
      // console.log("检测时间",Date.now()-ts);
      // 定时检测
      setTimeout(() => this.detectFaceA(), 0);
    },
    joinSession() {
      // --- Get an OpenVidu object ---
      this.OV = new OpenVidu();

      // --- Init a session ---
      this.session = this.OV.initSession();

      // --- Specify the actions when events take place in the session ---
      // On every new Stream received...
      this.session.on("streamCreated", ({ stream }) => {
        console.log(stream, "创建一个");
        const subscriber = this.session.subscribe(stream);
        this.subscribers.push(subscriber);
      });

      // On every Stream destroyed...
      this.session.on("streamDestroyed", ({ stream }) => {
        const index = this.subscribers.indexOf(stream.streamManager, 0);
        if (index >= 0) {
          this.subscribers.splice(index, 1);
        }
      });

      // On every asynchronous exception...
      this.session.on("exception", ({ exception }) => {
        console.warn(exception);
      });

      // --- Connect to the session with a valid user token ---
      // 'getToken' method is simulating what your server-side should do.
      // 'token' parameter should be retrieved and returned by your own backend
      this.getToken(this.mySessionId).then((token) => {
        // 第二个参数是每个用户将event.stream.connection.data在事件属性中收到的值
        this.session.connect(token, { clientData: this.myUserName })
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
            );

            this.mainStreamManager = publisher;

            this.publisher = publisher;

            // --- Publish your stream ---
            this.session.publish(this.publisher);
          })
          .catch((error) => {
            console.log(
              "There was an error connecting to the session:",
              error.code,
              error.message
            );
          });
      });

      window.addEventListener("beforeunload", this.leaveSession);
    },
    sharingScreen(){
        var OV = new OpenVidu(); 
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
                  alert("您的浏览器不支持屏幕分享");
                } else if (error.name == "SCREEN_EXTENSION_DISABLED") {
                  alert("您需要打开屏幕分享扩展插件");
                } else if (error.name == "SCREEN_CAPTURE_DENIED") {
                  alert("您需要选择分享的窗口或应用");
                }
              }
            );
            this.screenPublisher = screenPublisher;

            // --- Publish your stream ---
            this.session.publish(this.screenPublisher);
          
    },
    leaveSession() {
      // --- Leave the session by calling 'disconnect' method over the Session object ---
      if (this.session) this.session.disconnect();

      this.session = undefined;
      this.mainStreamManager = undefined;
      this.publisher = undefined;
      this.subscribers = [];
      this.OV = undefined;
      window.removeEventListener("beforeunload", this.leaveSession);
    },

    updateMainVideoStreamManager(stream) {
      
      if (this.mainStreamManager === stream) {
        this.joinNew();
        // this.detectFaceA();
        return;
      }

      this.mainStreamManager = stream;
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
      return this.createSession(mySessionId).then((sessionId) =>
        this.createToken(sessionId)
      );
    },

    // See https://docs.openvidu.io/en/stable/reference-docs/REST-API/#post-openviduapisessions
    createSession(sessionId) {
      return new Promise((resolve, reject) => {
        axios
          .post(
            `${OPENVIDU_SERVER_URL}/openvidu/api/sessions`,
            JSON.stringify({
              customSessionId: sessionId,
            }),
            {
              auth: {
                username: "OPENVIDUAPP",
                password: OPENVIDU_SERVER_SECRET,
              },
            }
          )
          .then((response) => response.data)
          .then((data) => resolve(data.id))
          .catch((error) => {
            if (error.response.status === 409) {
              resolve(sessionId);
            } else {
              console.warn(
                `No connection to OpenVidu Server. This may be a certificate error at ${OPENVIDU_SERVER_URL}`
              );
              if (
                window.confirm(
                  `No connection to OpenVidu Server. This may be a certificate error at ${OPENVIDU_SERVER_URL}\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server is up and running at "${OPENVIDU_SERVER_URL}"`
                )
              ) {
                location.assign(`${OPENVIDU_SERVER_URL}/accept-certificate`);
              }
              reject(error.response);
            }
          });
      });
    },

    // See https://docs.openvidu.io/en/stable/reference-docs/REST-API/#post-openviduapisessionsltsession_idgtconnection
    createToken(sessionId) {
      return new Promise((resolve, reject) => {
        axios
          .post(
            `${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${sessionId}/connection`,
            {},
            {
              auth: {
                username: "OPENVIDUAPP",
                password: OPENVIDU_SERVER_SECRET,
              },
            }
          )
          .then((response) => response.data)
          .then((data) => resolve(data.token))
          .catch((error) => reject(error.response));
      });
    },
  },
};
</script>
