import { localUsersService } from "./openviduMainUser"
import { avatarService } from "./avatar"
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
  // detectFaceLandmarksTiny
  nets,
  matchDimensions,
  resizeResults,
  draw
  // Box,
} from "face-api.js"
const SSD_MOBILENETV1 = "ssd_mobilenetv1"
// eslint-disable-next-line no-unused-vars
const TINY_FACE_DETECTOR = "tiny_face_detector"
// ssd_mobilenetv1 options
// 最小置信阈值  越高检测越精准
const minConfidence = 0.5 // 0.1 ~ 0.9
// tiny_face_detector options
const inputSize = 224 // 160 224 320 416 512 608
const scoreThreshold = 0.5 // 0.1 ~ 0.9

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
    this.canvasEl = null
    this.faces = {}
    this.loadStatuc = false
    // 是否循环检测
    this.setMonitorCheck = true
    // 检测是否已经开始
    this.start = false
    this.checkSessionFaces = []
    // 选用模型
    this.selectedFaceDetector = SSD_MOBILENETV1 // TINY_FACE_DETECTOR // SSD_MOBILENETV1 //TINY_FACE_DETECTOR //
  }
  async initialize () {
    if (!this.loadStatuc) await this.initializeLoadding()
    this.closeEysCount = 0
    this.openMouthCount = 0
    this.checkCount = 0
    // 情绪判别
    this.emojiCount = {}
    // this.detectFace()
  }
  async initializeLoadding () {
    console.log("-----模型正在尝试加载-----")
    // 考虑promiseall优化
    // SSD 移动网络检测模型 // 微型人脸检测器模型  检测人脸区域
    await this.getCurrentFaceDetectionNet().loadFromUri("/models")
    // loadFaceLandmarkModel("/models")
    // loadFaceExpressionModel("/models")
    //  68位点
    await nets.faceLandmark68Net.loadFromUri("/models")
    // 检测表情
    await nets.faceExpressionNet.loadFromUri("/models")

    this.loadStatuc = true
    console.log("-----模型加载完毕-----")
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
  /**
   * webGal 预热
   */
  async detectFaceInit () {
    if (!this.loadStatuc) await this.initializeLoadding()
    const videos = localUsersService.getWebcamPublisher()?.videos
    const video = videos?.length ? videos[videos.length - 1].video : null
    console.log(
      "---------------预热初始化时间---------------",
      (this.a = Date.now())
    )
    const result = await this.detectFaceMain(video, true)
    console.log(
      Date.now() - this.a,
      result,
      "---------------预热初始化结束时间---------------"
    )
  }
  async detectFaceMain (video, isInit) {
    if (this.selectedFaceDetector === SSD_MOBILENETV1) {
      return await detectSingleFace(video, this.getFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
    }
    let result
    // 320:1   224:5   160：24  经过测试只预处理到224
    // , 320, 416, 512, 608
    const inputSizes = [128, 160, 224]
    for (let i = 0; i < inputSizes.length; i++) {
      const inputSize = inputSizes[i]

      result = await detectSingleFace(
        video,
        new TinyFaceDetectorOptions({
          inputSize,
          scoreThreshold: 0.2
        })
      )
        .withFaceLandmarks()
        .withFaceExpressions()
        // && !isInit
      if (result&& !isInit ) {
        console.log(
          "---------------------------" +
            inputSize +
            "---------------------------"
        )
        this.canvasEl = document.getElementById("myCanvas")
        if(this.canvasEl){
          const dims = matchDimensions(this.canvasEl, video, true)
          const resizeResultsd = resizeResults(result, dims)
          draw.drawDetections(this.canvasEl, resizeResultsd)
        }

        return result
      }
      // 其他代码。。。
    }
    return result
  }
  getCheckFaceVideo(){
    if (!localUsersService.hasWebcamVideoActive()) {
      console.log("用户没有视频流")
      return
    }
    console.log("---------------进行单次检测------------------")
    const videos = localUsersService.getWebcamPublisher()?.videos
    const video = videos?.length ? videos[videos.length - 1].video : null
    if (!video || !localUsersService.hasWebcamVideoActive()) {
      console.log("没有检测到视频")
      return
    }
    return video
  }
  captureUserImage(){
    const video = this.getCheckFaceVideo()
    if(video){
      return  avatarService.createCaptureByvideo(video)
    }
    return ""
  }
  /** @name 人脸检测 */
  async detectFace (isCapture) {
    if (!this.start) {
      console.log("检测没有初始化")
      return
    }
    const video = this.getCheckFaceVideo()
    if(!video){
      console.log("没有视频,无法人脸识别")
      return
    }
    let faceData = null
    // 开始检测
    // 裁剪头像 待确定直接图片识别,暂不存到缓存中
    let capturedAvatar = ""
    if (isCapture) capturedAvatar = avatarService.createCaptureByvideo(video)
    console.log("开始识别时间", (this.a = Date.now()))
    const result = await this.detectFaceMain(video)
    console.log("识别结束时间", Date.now() - this.a, result)
    if (result) {
      console.log("----检测到----")
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
      faceData = { moodData, eyeData, mouthData, headData, capturedAvatar }
      // 检测次数
      this.checkCount++
      // 表情次数
      this.emojiCount[faceStr]++
    }
    console.log("检测结果:", result)
    return faceData
  }
  clear () {
    console.log("人脸识别清除")
    this.start = false
  }
}
export const faceService = new FaceService()
