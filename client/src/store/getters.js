const getters = {
  sidebar: state => state.app.sidebar,
  // openvidu
  localUsers: state => state.openvidu.localUsers,
  remoteUsers: state => state.openvidu.remoteUsers,
  remoteUserNameList: state => state.openvidu.remoteUserNameList,
  screenShareState: state => state.openvidu.screenShareState,
  webcamVideoActive: state => state.openvidu.webcamVideoActive,
  
  ovSettings: state => state.openvidu.ovSettings,
  //MESSAGE
  messagesUnread: state => state.openvidu.messagesUnread,
  messageList: state => state.openvidu.messageList,
  toggleChat: state => state.openvidu.toggleChat,

  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles:  state => state.user.roles,
  addRouters:  state => state.permission.addRouters,
}
export default getters
