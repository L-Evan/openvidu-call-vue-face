import store from "@/store/index"
import { openViduWebRTCService } from "./openviduWrtc"
import { localUsersService } from "./openviduMainUser"
import { remoteUsersService } from "./openviduRemoteUser"

class ChatService {
  //  chatComponent: MatSidenav;

  //  _toggleChat = <BehaviorSubject<boolean>>new BehaviorSubject(false);

  //  chatOpened: boolean;
  //  messagesUnread = 0;

  //  _messagesUnread = <BehaviorSubject<number>>new BehaviorSubject(0);
  //  _messageList = <BehaviorSubject<ChatMessage[]>>new BehaviorSubject([]);

  constructor () {
    this.openViduWebRTCService = openViduWebRTCService
    this.localUsersService = localUsersService
    this.remoteUsersService = remoteUsersService
    //   this.notificationService= NotificationService
    this._messageList = users => store.commit("openvidu/SET_MessageList", users)
    this._messagesUnread = users =>
      store.commit("openvidu/SET_MessagesUnread", users)
    this._toggleChat = users => store.commit("openvidu/SET_ToggleChat", users)
    this.messagesObs = () => store.getters.messageList
    this.toggleChatObs = () => store.getters.toggleChat
    this.messagesUnreadObs = () => store.getters.messagesUnread
    // 初始化
    this.messageList = []
    this.messagesUnread = 0
    this.chatOpened = this.toggleChatObs()
  }
  // 初始化事件
  setChatComponent (chatSidenav) {
    this.chatComponent = chatSidenav
  }

  subscribeToChat () {
    const session = openViduWebRTCService.getWebcamSession()
    session.on("signal:chat", event => {
      const connectionId = event.from.connectionId
      const data = JSON.parse(event.data)
      const isMyOwnConnection = openViduWebRTCService.isMyOwnConnection(
        connectionId
      )
      this.messageList.push({
        isLocal: isMyOwnConnection,
        nickname: data.nickname,
        message: data.message,
        userAvatar: isMyOwnConnection
          ? localUsersService.getAvatar()
          : remoteUsersService.getUserAvatar(connectionId)
      })
      if (!this.isChatOpened()) {
        this.addMessageUnread()
        // 消息弹窗
        // this.notificationService.newMessage(
        //   data.nickname.toUpperCase(),
        //   this.toggleChat.bind(this)
        // )
      }
      this._messageList(this.messageList)
    })
  }

  sendMessage (message) {
    message = message.replace(/ +(?= )/g, "")
    if (message !== "" && message !== " ") {
      const data = {
        message: message,
        nickname: localUsersService.getWebcamUserName()
      }
      const sessionAvailable = openViduWebRTCService.getSessionOfUserConnected()
      // 发送消息
      sessionAvailable.signal({
        data: JSON.stringify(data),
        type: "chat"
      })
    }
  }
  // 开关消息 （需优化）
  toggleChat () {
    console.log("Toggling chat",this.chatOpened)
    // 开关抽屉 
    this.chatOpened = !this.chatOpened
    this._toggleChat(this.chatOpened)
    if (this.chatOpened) {
      this.resetUnreadMessages()
    } 
  }

  resetUnreadMessages () {
    this.messagesUnread = 0
    this._messagesUnread(this.messagesUnread)
  }

  isChatOpened () {
    return this.chatOpened
  }

  addMessageUnread () {
    this.messagesUnread++
    this._messagesUnread(this.messagesUnread)
  }
}
export const chatService = new ChatService()
