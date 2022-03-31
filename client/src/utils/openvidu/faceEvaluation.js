import { estimatePose } from "./head-pose"

import { pow2 } from "./my_math"

// 暂时以人闭嘴为0.3判断
const mouthBase = 0.3
// 表情
const mainPowers = [0.649118, 0.27895457, 0.07192743]
const faceMoodPowers = [
  0.059785,
  0.027026,
  0.039953,
  0.368842,
  0.059785,
  0.260724,
  0.183885
]
const fatigueValues = [1, 0.8, 0.5]

const moodType = {
  angry: 0,
  disgusted: 1,
  fearful: 2,
  happy: 3,
  sad: 4,
  surprised: 5,
  neutral: 6
}
/**
 * 头部检测
 */
export async function headCheck (result) {
  // 3d模型 6个关键点的3D脸部模型
  // 下巴：8
  // 鼻尖：30
  // 左眼角：36
  // 右眼角：45
  // 左嘴角：48
  // 右嘴角：54
  // yaw 左右
  // pitch 上下
  // roll 旋转
  const { pitch, yaw, roll } = await estimatePose(
    result.landmarks._positions,
    result.detection.imageWidth,
    result.detection.imageHeight
  )
  console.log({ pitch, yaw, roll })
  const k1 = Math.abs(yaw * 100) > 70 ? 0 : 1 - Math.abs(yaw * 100) / 70
  const k2 = Math.abs(pitch * 100) > 60 ? 0 : 1 - Math.abs(pitch * 100) / 60
  if(!k1||!k2){
    console.log("有角度过大",k1+"_"+k2)
  }
  const headTurnDegrees = [k1, k2]
  return { headTurnDegree: Math.min(k1, k2), headTurnDegrees, pitch, yaw, roll }
}
function headCalculation (headTurns) {
  return (
    (headTurns.reduce((acc, cur) => acc + cur, 0) / headTurns.length) *
    mainPowers[0]
  )
}
// 情绪识别相关
function fatigueCalculation (
  closeEysCount,
  openMouthCount,
  chectCount = 5,
  checkTime = 5
) {
  // PERCLOS值
  const m1 = closeEysCount / chectCount
  // 平均闭眼
  const m2 = closeEysCount?checkTime / closeEysCount:0
  // 打哈切频率
  const m3 = openMouthCount / chectCount
  //(m1 + 0.8 * m2 + 0.5 * m3) * mainPowers[1]
  return (
    [m1, m2, m3]
      .filter((value, index) => value * fatigueValues[index])
      .reduce((acc, cur) => acc + cur, 0) * mainPowers[1]
  )
}
function moodCalculation (moodCounts) {
  moodCounts.forEach((value, index) => {
    moodCounts[index] = value * faceMoodPowers[index]
  })
  return moodCounts.reduce((acc, cur) => acc + cur, 0) * mainPowers[2]
}

export function cycleComputer (faces, chectCount = 5, checkTime = 5) {
  console.trace()
  const closeEysCount = faces.filter(face => face.eyeData.eyesClosed).length
  const openMouthCount = faces.filter(face => face.mouthData.mouthOpen).length
  // 68
  const fatigue = fatigueCalculation(
    closeEysCount,
    openMouthCount,
    chectCount,
    checkTime
  )
  // 头部
  const headTurns = faces.map(face => face.headData.headTurnDegree)
  const headTurnDegree = headCalculation(headTurns)
  const moodCounts = [0, 0, 0, 0, 0, 0, 0]
  // 情绪
  faces.forEach(
    face => void moodCounts[moodType[face.moodData.faceStr]]++
  )
  const mood = moodCalculation(moodCounts)
  const result = headTurnDegree + fatigue + mood
  console.log("计算的三个度", fatigue, headTurnDegree, mood, result)
  return result
}

/**
 * 眼睛关闭评分
 */
export function eyeStatusCheck (face68_) {
  const t1 = Math.sqrt(
    pow2(face68_[37 - 1]._x - face68_[41 - 1]._x) +
      pow2(face68_[37 - 1]._y - face68_[41 - 1]._y)
  )
  const t2 = Math.sqrt(
    pow2(face68_[38 - 1]._x - face68_[40 - 1]._x) +
      pow2(face68_[38 - 1]._y - face68_[40 - 1]._y)
  )
  const t3 = Math.sqrt(
    pow2(face68_[36 - 1]._x - face68_[39 - 1]._x) +
      pow2(face68_[36 - 1]._y - face68_[39 - 1]._y)
  )
  const R1 = ((1 / 2) * (t1 + t2)) / t3
  const t4 = Math.sqrt(
    pow2(face68_[43 - 1]._x - face68_[47 - 1]._x) +
      pow2(face68_[43 - 1]._y - face68_[47 - 1]._y)
  )
  const t5 = Math.sqrt(
    pow2(face68_[44 - 1]._x - face68_[46 - 1]._x) +
      pow2(face68_[44 - 1]._y - face68_[46 - 1]._y)
  )
  const t6 = Math.sqrt(
    pow2(face68_[42 - 1]._x - face68_[45 - 1]._x) +
      pow2(face68_[42 - 1]._y - face68_[45 - 1]._y)
  )
  const R2 = ((1 / 2) * (t4 + t5)) / t6
  const R = (1 / 2) * (R1 + R2)
  console.log("眼睛闭眼程度" + R)
  if (R >= 0.28) {
    // console.log("眼睛正常状态")
  } else if (R <= 0.22) {
    console.log("眼睛关闭状态")
  } else {
    // console.log("眼睛微闭状态")
  }
  return { eyeR: R, eyesClosed: R <= 0.22 }
}
/**
 * 嘴巴合闭检测
 */
export function mouthStatusCheck (face68_) {
  const t1 = Math.sqrt(
    pow2(face68_[50 - 1]._x - face68_[58 - 1]._x) +
      pow2(face68_[50 - 1]._y - face68_[58 - 1]._y)
  )
  const t2 = Math.sqrt(
    pow2(face68_[52 - 1]._x - face68_[56 - 1]._x) +
      pow2(face68_[52 - 1]._y - face68_[56 - 1]._y)
  )
  const t3 = Math.sqrt(
    pow2(face68_[48 - 1]._x - face68_[54 - 1]._x) +
      pow2(face68_[48 - 1]._y - face68_[54 - 1]._y)
  )
  // 当嘴巴闭合时,闭合度为０
  const R = ((1 / 2) * (t1 + t2)) / t3 - mouthBase
  // console.log("闭嘴程度" + R)
  if (R <= 0.05) {
    // console.log("嘴巴正常状态")
  } else if (R >= 0.17) {
    // console.log("打哈欠") // 说话打哈欠建议0.3 说话可以由音频识别
  } else {
    // console.log("嘴巴微开状态")
  }
  return { mouthR: R, mouthOpen: R >= 0.17 }
}
