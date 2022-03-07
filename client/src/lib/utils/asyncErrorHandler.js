// 提示
import { MessageBox, Message } from "element-ui"
import Vue from "vue"
import StaticEnum from "@/lib/utils/staticEnum" 
import  constantRoutes   from "@/main"

const errorHandler = {
  onTokenExpired: () => {
    MessageBox.confirm("登录状态已过期，请重新登录", "提示", {
      confirmButtonText: "确定",
      type: "error",
      showClose: false,
      showCancelButton: false,
      closeOnClickModal: false
    }).then(() => {
      window.localStorage.removeItem("accessToken")
      constantRoutes.push({ name: "login" })
    })
  }
}
// 处理错误
Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
  // 只在 2.2.0+ 可用
    
}

// 处理
export const asyncErrorHandler = (err)=>{
  switch (err.code) {
  case StaticEnum.ServerError.TokenExpired:
    errorHandler.onTokenExpired()
    break
  default:
    Message({
      message: err.msg,
      type: "error",
      duration: 5 * 1000
    })
    break
  }
}
  