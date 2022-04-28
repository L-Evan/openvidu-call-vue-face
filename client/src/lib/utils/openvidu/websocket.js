import { getValueByURL } from "@/utils/index"
import axios from "axios"
// import { Base64 } from "js-base64"
import { tokenService } from "@/lib/utils/openvidu/openviduToken"

import store from "@/store/index"
// 回调只能用that
let that = null
const websocketStatus = () => store.getters.websocketStatus
const _websocketStatus = is => store.commit("openvidu/SET_websocketStatus", is)
class WebSocketMeet {
  constructor () {
    this.reconnectCount  = 0
    that = this
    //this.sendOverMeet = false
    this.websocketStatus = websocketStatus
    this._websocketStatus = _websocketStatus
    this.isSpeech = false
    // 定义ws对象
    this.webSocket = null
    // ws请求链接（类似于ws后台地址）
    this.ws = ""
    // ws定时器
    this.wsTimer = null
    this.initialTokenStatus = false
  }
  start () {
    // 代表websocket 转vuex
    this.initialTokenStatus = true
    this.wsInit()
  }
  // clearInterval(this.wsTimer)
  sendDataToServer (messageType, message) {
    console.log("发送数据", { messageType, message })
    if (this.webSocket.readyState === 1) {
      this.webSocket.send(JSON.stringify({messageType, message}))
    } else {
      throw Error("服务未连接")
    }
  }
  /**
   * 初始化ws
   */
  wsInit () {
    // wss://levani.cn:4443?sessionId=ses_UEpEixJrsG&token=tok_SJzLH9sHazIpDlSB
    const tokenUrl = tokenService.getWebcamToken()
    const sessionName = tokenService.getSessionId()
    console.log(`token: ${tokenUrl}  sessionName: ${sessionName}`)
    if (!tokenUrl) {
      console.error("异常！为初始token")
      return
    }
    const params = getValueByURL(tokenUrl)
    console.log("params:", params)
    const { token, sessionId } = params
    // wss://127.0.0.1:8080/websocket/badao
    // axios.getUri()
    const hostname = process.env.HOSTNAME //window.location.hostname

    const wsuri = `wss://${hostname}/websocket/${sessionName}/${sessionId}/${token}`
    console.log("url now", wsuri)
    this.ws = wsuri
    if (!this.initialTokenStatus) return
    // 销毁ws
    this.wsDestroy()
    // 初始化ws
    this.webSocket = new WebSocket(this.ws)
    // ws连接建立时触发
    this.webSocket.addEventListener("open", this.wsOpenHanler)
    // ws服务端给客户端推送消息
    this.webSocket.addEventListener("message", this.wsMessageHanler)
    // ws通信发生错误时触发
    this.webSocket.addEventListener("error", this.wsErrorHanler)
    // ws关闭时触发
    this.webSocket.addEventListener("close", this.wsCloseHanler)

    // 检查ws连接状态,readyState值为0表示尚未连接，1表示建立连接，2正在关闭连接，3已经关闭或无法打开
    clearInterval(this.wsTimer)
    this.wsTimer = setInterval(() => {
      if (this.webSocket.readyState === 1) {
        clearInterval(this.wsTimer)
      } else {
        console.log("ws建立连接失败")
        this.wsInit()
      }
    }, 3000)
  }
  wsOpenHanler (event) {
    console.log("ws建立连接成功")
    _websocketStatus(true)
  }
  // 回调
  wsMessageHanler (e) {
    console.log(`wsMessageHanler 接受后端的数据：${e?.data}`)
    // 解析
    const redata = JSON.parse(e.data)
    const { messageType, message } = redata
    console.log(`解析后消息类型：${messageType} 消息： ${message}`)
    if (messageType === "isSpeech") {
      that.isSpeech = message
      console.log("-----当前用户作为会议创建者-----")
    }
  }
  /**
   * ws通信发生错误 回调
   */
  wsErrorHanler (event) {
    console.log(event, "通信发生错误")
    that.wsInit()
  }
  /**
   * ws关闭 回调
  */
  wsCloseHanler (event) {
    console.log(event, "ws关闭")
    if(that.reconnectCount>3){
      that.reconnectCount = 0
      _websocketStatus(false)
      console.log("会议似乎结束了或者网络错误")
      return
    }
    that.reconnectCount++
    console.log("尝试重新链接",that.reconnectCount)
    that.wsInit()
  }
  /**
   * 销毁ws
   */
  wsDestroy () {
    if (this.webSocket !== null) {
      this.webSocket.removeEventListener("open", this.wsOpenHanler)
      this.webSocket.removeEventListener("message", this.wsMessageHanler)
      this.webSocket.removeEventListener("error", this.wsErrorHanler)
      this.webSocket.removeEventListener("close", this.wsCloseHanler)
      this.webSocket.close()
      this.webSocket = null
      this.isSpeech = false
      clearInterval(this.wsTimer)
    }
  }
  meetOver () {
    this.sendDataToServer("leave")
  }
}
export default new WebSocketMeet()
