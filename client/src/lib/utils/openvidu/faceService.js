import { localUsersService } from "./openviduMainUser"
import {
  headCheck,
  mouthStatusCheck,
  eyeStatusCheck
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
let minConfidence = 0.5
// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5

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
    this.loadStatuc = false
    this.setTimeCheck = false
    this.start = false
    // 选用模型
    this.selectedFaceDetector = SSD_MOBILENETV1
  }
  async startCheckFace () {
    // 判断模型加载
    // if (!this.isFaceDetectionModelLoaded()) {
    //   console.log("未加载数据，正在加载")
    //   await this.initialize()
    // }
    if(!this.loadStatuc)
      await this.initialize()
    console.log("start check face")
    // 开始检测时间
    this.checkStartTime = Date.now()
    this.start = true
    this.closeEysCount = 0
    this.openMouthCount = 0
    this.chectCount = 0
    // 情绪判别
    this.emojiCount = {}
    this.detectFace()
  }
  async initialize () {
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
  /** @name 人脸检测 */
  async detectFace () {
    if (!this.start) {
      console.log("检测没有开始")
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
      // 疲劳值
      if (result.landmarks._positions) {
        const face68_ = result.landmarks._positions
        eyeStatusCheck(face68_)
        mouthStatusCheck(face68_)
        headCheck(result)
      }

      // 情绪
      const { expressions } = result
      const faceStr = this.max_Object(expressions)
      console.log("情绪：" + faceStr)
      // 表情次数
      this.emojiCount[faceStr]++
      // 检测次数
      this.checkCount++
    } else {
      console.log("检测不到")
    }
    console.log("检测时间: " + (Date.now() - startTime))
    // 定时检测
    if (this.setTimeCheck)
      this.setTimeoutContainer = setTimeout(
        () => this.detectFace(),
        result ? 0 : 1000
      )
  }

  // 情绪识别相关
  computerMood () {
    const t = this.checkStartTime
    // perclos
    const m1 = this.closeEysCount / this.chectCount
    // 平均闭眼
    const m2 = t / this.closeEysCount
    // 打哈切频率
    const m3 = this.openMouthCount / this.chectCount
    return m1 + 0.8 * m2 + 0.5 * m3
  }
  clear () {
    this.start = false
  }
}
export const faceService = new FaceService()
