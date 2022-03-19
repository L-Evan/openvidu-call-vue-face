
import { estimatePose } from "./head-pose"

import {pow2} from "./my_math"
/**
* 头部检测
*/
export async function headCheck(result) {
  // 3d模型 6个关键点的3D脸部模型
  // 下巴：8
  // 鼻尖：30
  // 左眼角：36
  // 右眼角：45
  // 左嘴角：48
  // 右嘴角：54
  const { pitch, yaw, roll } = await estimatePose(
    result.landmarks._positions,
    result.detection.imageWidth,
    result.detection.imageHeight
  )
  console.log({ pitch, yaw, roll })
}

/**
 * 眼睛关闭评分
 */
export function eyeStatusCheck(face68_) {
  const t1 = Math.sqrt(
    pow2(face68_[37-1]._x - face68_[41-1]._x) +
        pow2(face68_[37-1]._y - face68_[41-1]._y)
  )
  const t2 = Math.sqrt(
    pow2(face68_[38-1]._x - face68_[40-1]._x) +
        pow2(face68_[38-1]._y - face68_[40-1]._y)
  )
  const t3 = Math.sqrt(
    pow2(face68_[36-1]._x - face68_[39-1]._x) +
        pow2(face68_[36-1]._y - face68_[39-1]._y)
  )
  const R1 = ((1 / 2) * (t1 + t2)) / t3
  const t4 = Math.sqrt(
    pow2(face68_[43-1]._x - face68_[47-1]._x) +
        pow2(face68_[43-1]._y - face68_[47-1]._y)
  )
  const t5 = Math.sqrt(
    pow2(face68_[44-1]._x - face68_[46-1]._x) +
        pow2(face68_[44-1]._y - face68_[46-1]._y)
  )
  const t6 = Math.sqrt(
    pow2(face68_[42-1]._x - face68_[45-1]._x) +
        pow2(face68_[42-1]._y - face68_[45-1]._y)
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
}
// 暂时以人闭嘴为0.3判断
const mouthBase = 0.3
/**
     * 嘴巴合闭检测
     */
export function mouthStatusCheck(face68_) {
  const t1 = Math.sqrt(
    pow2(face68_[50-1]._x - face68_[58-1]._x) +
        pow2(face68_[50-1]._y - face68_[58-1]._y)
  )
  const t2 = Math.sqrt(
    pow2(face68_[52-1]._x - face68_[56-1]._x) +
        pow2(face68_[52-1]._y - face68_[56-1]._y)
  )
  const t3 = Math.sqrt(
    pow2(face68_[48-1]._x - face68_[54-1]._x) +
        pow2(face68_[48-1]._y - face68_[54-1]._y)
  )
  const R = ((1 / 2) * (t1 + t2)) / t3-mouthBase
  console.log("闭嘴程度" + R)
  if (R <= 0.05) {
    // console.log("嘴巴正常状态")
  } else if (R >= 0.17) {
    console.log("打哈欠") // 说话打哈欠建议0.3 说话可以由音频识别
  } else {
    // console.log("嘴巴微开状态")
  }
  return R
}