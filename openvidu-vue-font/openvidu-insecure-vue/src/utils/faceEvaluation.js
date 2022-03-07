
import { estimatePose } from "./head-pose";

import {pow2} from "./my_math";
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
    );
    console.log({ pitch, yaw, roll });
}

/**
 * 眼睛关闭评分
 */
export function eyeStatusCheck(face68_) {
    const t1 = Math.sqrt(
        pow2(face68_[37]._x - face68_[41]._x) +
        pow2(face68_[37]._y - face68_[41]._y)
    );
    const t2 = Math.sqrt(
        pow2(face68_[38]._x - face68_[40]._x) +
        pow2(face68_[38]._y - face68_[40]._y)
    );
    const t3 = Math.sqrt(
        pow2(face68_[36]._x - face68_[39]._x) +
        pow2(face68_[36]._y - face68_[39]._y)
    );
    const R1 = ((1 / 2) * (t1 + t2)) / t3;
    const t4 = Math.sqrt(
        pow2(face68_[48]._x - face68_[47]._x) +
        pow2(face68_[43]._y - face68_[47]._y)
    );
    const t5 = Math.sqrt(
        pow2(face68_[44]._x - face68_[46]._x) +
        pow2(face68_[44]._y - face68_[46]._y)
    );
    const t6 = Math.sqrt(
        pow2(face68_[42]._x - face68_[45]._x) +
        pow2(face68_[42]._y - face68_[45]._y)
    );
    const R2 = ((1 / 2) * (t4 + t5)) / t6;
    const R = (1 / 2) * (R1 + R2);
    console.log("眼睛闭眼程度" + R);
    if (R >= 0.28) {
        console.log("眼睛正常状态");
    } else if (R <= 0.22) {
        console.log("眼睛关闭状态");
    } else {
        console.log("眼睛微闭状态");
    }
}

/**
     * 嘴巴合闭检测
     */
export function mouthStatusCheck(face68_) {
    const t1 = Math.sqrt(
        pow2(face68_[50]._x - face68_[58]._x) +
        pow2(face68_[50]._y - face68_[58]._y)
    );
    const t2 = Math.sqrt(
        pow2(face68_[52]._x - face68_[56]._x) +
        pow2(face68_[52]._y - face68_[56]._y)
    );
    const t3 = Math.sqrt(
        pow2(face68_[48]._x - face68_[54]._x) +
        pow2(face68_[48]._y - face68_[54]._y)
    );
    const R = ((1 / 2) * (t1 + t2)) / t3;
    console.log("闭嘴程度" + R);
    if (R <= 0.05) {
        console.log("嘴巴正常状态");
    } else if (R >= 0.17) {
        console.log("打哈欠");
    } else {
        console.log("嘴巴微开状态");
    }
}