import { localUsersService } from "./openviduMainUser"
// import {avatarService} from "./avatar"
// import { tokenService } from "@/lib/utils/openvidu/openviduToken"
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
const minConfidence = 0.5
// tiny_face_detector options
const inputSize = 512
const scoreThreshold = 0.5

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
    // 是否循环检测
    this.setMonitorCheck = true
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
  addFaceVector (sesstionToken, checkFaces) {
    if (sesstionToken && checkFaces.length) {
      const faceAll = this.faces[sesstionToken] ?? []
      faceAll.push(checkFaces)
      this.faces[sesstionToken] = faceAll
    }
  }
  /** @name 人脸检测 */
  async detectFace () {
    if (!this.start) {
      console.log("检测没有初始化")
      return
    }
    console.log("---------------检测中------------------")
    const videos = localUsersService.getWebcamPublisher().videos
    // room
    const roomvideos = [...videos.filter(v => v.id.indexOf("room") > -1)]
    const video = roomvideos.length ? roomvideos[0].video : null
    if (!video || !localUsersService.hasWebcamVideoActive()) {
      console.log("没有检测到视频")
      return
    }
 
    let faceData = null
    // 开始检测
    // 裁剪头像 待确定直接图片识别,暂不存到缓存中
    const capturedAvatar = "" //avatarService.createCaptureByvideo(video)
    const result = await detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceExpressions()
    
    if (result) {
      console.log("检测到")
      this.checkCount++
      // 68点
      // if (result.landmarks._positions) {
      const face68_ = result.landmarks._positions
      const eyeData = eyeStatusCheck(face68_)
      const mouthData = mouthStatusCheck(face68_)
      const headData = await headCheck(result)
      // 情绪
      const { expressions } = result
      const faceStr = this.max_Object(expressions)
      const moodData = { faceStr, expressions }
      faceData = { moodData, eyeData, mouthData, headData,capturedAvatar }
      // 检测次数
      this.checkCount++
      // 表情次数
      this.emojiCount[faceStr]++
    }
    console.log("检测结果:", result)
    return faceData 
  }
  clear () {
    this.start = false
    clearTimeout(this.setTimeoutContainer)
    this.setTimeoutContainer = null
  }
}
export const faceService = new FaceService()
