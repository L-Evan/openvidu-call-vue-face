import { localUsersService } from "./openviduMainUser"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"
import {
  headCheck,
  mouthStatusCheck,
  eyeStatusCheck,
  cycleComputer
} from "@/utils/openvidu/faceEvaluation"
import {
  SsdMobilenetv1Options,
  TinyFaceDetectorOptions,
  detectSingleFace,
  nets,
  loadFaceExpressionModel
  // matchDimensions,
  // resizeResults,
  // draw,
  // Box,
} from "face-api.js"
const SSD_MOBILENETV1 = "ssd_mobilenetv1"
// eslint-disable-next-line no-unused-vars
const TINY_FACE_DETECTOR = "tiny_face_detector"
// ssd_mobilenetv1 options
// 最小置信阈值  越高检测越精准
const minConfidence = 0.5
// tiny_face_detector options
const inputSize = 512
const scoreThreshold = 0.5
const checkCycle = 5

class FaceService {
  /**
   * @param {string} url
   * @param {string} apiKey
   * @param {string} secret
   * @param {string} sessionId
   * @param {string} streamId
   * @param {string} [userId]
   * @param {boolean} [debug=false]
   */
  constructor () {
    this.faces = {}
    this.loadStatuc = false
    this.setTimeCheck = false
    this.start = false
    this.checkSessionFaces = []
    // 选用模型
    this.selectedFaceDetector = SSD_MOBILENETV1
  }
  async initialize () {
    // 判断模型加载
    // if (!this.isFaceDetectionModelLoaded()) {
    //   console.log("未加载数据，正在加载")
    //   await this.initialize()
    // }
    if (!this.loadStatuc) await this.initializeLoadding()
    console.log("start check face")
    // 开始检测时间
    this.checkStartTime = Date.now()
    this.closeEysCount = 0
    this.openMouthCount = 0
    this.checkCount = 0
    // 情绪判别
    this.emojiCount = {}
    // this.detectFace()
  }
  async initializeLoadding () {
    // SSD 移动网络检测模型 // 微型人脸检测器模型  检测人脸区域
    await this.getCurrentFaceDetectionNet().loadFromUri("/models")
    // 脸部固定住 68火焰脸
    await nets.faceLandmark68Net.loadFromUri("/models")
    // 检测表情，可以不经过68
    await loadFaceExpressionModel("/models")
    this.loadStatuc = true
    console.log("模型加载完毕")
  }
  /**
   * 获取现在选择的模型
   */
  getCurrentFaceDetectionNet () {
    //  selectedFaceDetector 人脸检测模型
    if (this.selectedFaceDetector === SSD_MOBILENETV1) {
      return nets.ssdMobilenetv1
    }
    if (this.selectedFaceDetector === TINY_FACE_DETECTOR) {
      return nets.tinyFaceDetector
    }
  }
  /**
   * 判断【人脸区域】检测模型加载情况
   */
  isFaceDetectionModelLoaded () {
    return !!this.getCurrentFaceDetectionNet().params
  }
  getFaceDetectorOptions () {
    if (this.selectedFaceDetector === SSD_MOBILENETV1) {
      return new SsdMobilenetv1Options({ minConfidence })
    } else if (this.selectedFaceDetector === TINY_FACE_DETECTOR) {
      return new TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    } else {
      console.log("FaceDetector not initial")
    }
  }
  max_Object (emojiCount) {
    let max = 0
    let max_key = ""
    for (let key in emojiCount) {
      if (emojiCount[key] > max) {
        max = emojiCount[key]
        max_key = key
      }
    }
    return max_key
  }
  checkStatus () {
    return this.checkCount > 0 && this.checkCount % checkCycle == 0
  }
  /** @name 人脸检测 */
  async detectFace (currentFaces) {
    if (!this.start) {
      console.log("检测没有初始化")
      return
    }
    console.log("---------------检测中------------------")
    const videos = localUsersService.getWebcamPublisher().videos
    const roomvideos = [...videos.filter(v => v.id.indexOf("room") > -1)]
    const video = roomvideos.length ? roomvideos[0].video : null
    console.log("检测video :", video)
    if (!video || !localUsersService.hasWebcamVideoActive()) {
      console.log("没有检测到视频")
      return
    }
    const startTime = Date.now()
    // 开始检测
    const result = await detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceExpressions()
    console.log("检测结果:", result)
    if (result) {
      console.log("检测结果:", result)
      this.checkCount++
      // 68点
      // if (result.landmarks._positions) {
      const face68_ = result.landmarks._positions
      const eyeData = eyeStatusCheck(face68_)
      const mouthData = mouthStatusCheck(face68_)
      const headData = await headCheck(result)
      // }
      // 情绪
      const { expressions } = result
      const faceStr = this.max_Object(expressions)
      console.log("情绪：" + faceStr)
      const moodData = { faceStr, expressions }
      const sesstionToken = tokenService.getWebcamToken()
      if (sesstionToken) {
        const faceAll = this.faces[sesstionToken]??[]
        faceAll.push({ moodData, eyeData, mouthData, headData })
        this.faces[sesstionToken] = faceAll
      }
      currentFaces.push({ moodData, eyeData, mouthData, headData })
      // 检测次数
      this.checkCount++
      if (this.checkStatus(currentFaces)) {
        // time 先做为5s
        const focusData = cycleComputer(currentFaces, currentFaces.length, checkCycle)
      }
      // 表情次数
      this.emojiCount[faceStr]++
    } else {
      console.log("检测不到")
    }
    console.log("检测时间: " + (Date.now() - startTime))
    return currentFaces
  }
  clear () {
    this.start = false
    clearTimeout(this.setTimeoutContainer)
    this.setTimeoutContainer = null
  }
}
export const faceService = new FaceService()
