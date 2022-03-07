import { MessageBox, Message } from "element-ui"
import router from "@/main"
import accToken from "@/lib/utils/localStrory"
const errorHandler = {
  onTokenExpired: () => {
    MessageBox.confirm("登录状态已过期，请重新登录", "提示", {
      confirmButtonText: "确定",
      type: "error",
      showClose: false,
      showCancelButton: false,
      closeOnClickModal: false
    }).then(() => {
      accToken.removeToken()
      router.push({ name: "login" })
    })
  }
}
export const asyncErrorHandler = function (err) {
  switch (err.code) {
  case 405:
    errorHandler.onTokenExpired()
    break
  default:
    console.log("响应错", err)
    Message({
      message: err.message,
      type: "error",
      duration: 1 * 1000
    })
    break
  }
}


