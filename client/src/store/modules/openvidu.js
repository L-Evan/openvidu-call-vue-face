

import { openViduLayoutService } from "@/lib/utils/openvidu/layout"// 创建一个新的 store 实例
const getDefaultState = () => {
  return {
    ovSettings:null,
    streamManager:null,
    localUsers:[],
    remoteUsers:[],
    remoteUserNameList:[],
    screenShareState:false,
    webcamVideoActive: true ,
    messagesUnread:0,messageList:[],toggleChat:false,
    
  }
}
const state = getDefaultState()
// 改变属性
const mutations = {
  SET_MessageList: (state, messageList) => {
    state.messageList = messageList
  }, SET_MessagesUnread: (state, messagesUnread) => {
    state.messagesUnread = messagesUnread
  }, SET_ToggleChat: (state, toggleChat) => {
    state.toggleChat = toggleChat
  },
  SET_StreamManager: (state, streamManager) => {
    state.streamManager = streamManager
  },
  SET_OvSettings: (state, ovSettings) => {
    state.ovSettings = ovSettings
  },
  SET_LocalUsers: (state, localUsers) => {
    state.localUsers = localUsers
    openViduLayoutService.update()
  },
  SET_RemoteUserNameList: (state, remoteUserNameList) => {
    state.remoteUserNameList = remoteUserNameList
  },
  SET_RemoteUsers: (state, remoteUsers) => {
    state.remoteUsers = remoteUsers
    openViduLayoutService.update()
  },
  SET_ScreenShareState: (state, screenShareState) => {
    state.screenShareState = screenShareState
  },
  SET_WebcamVideoActive: (state, webcamVideoActive) => {
    state.webcamVideoActive = webcamVideoActive
  }
}
const actions = {
  // user login
  // login ({ commit }, userInfo) {
  //   const { username, password } = userInfo
  //   return new Promise((resolve, reject) => {})
  // }
}
export default {
  namespaced: true,
  // 属性
  state,
  // 状态改变
  mutations,
  // Action 提交的是 mutation
  // Action 可以包含任意异步操作
  actions
}
