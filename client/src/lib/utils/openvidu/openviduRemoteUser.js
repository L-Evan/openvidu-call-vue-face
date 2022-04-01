import store from "@/store/index"
import { utils as utilsSrv } from "./openviduUtils"
import { avatarService } from "./avatar"
import {UserModel} from "./openviduUser"
class RemoteUsersService {
  // remoteUsers: Observable<UserModel[]>;
  // remoteUserNameList: Observable<UserName[]>;
  //  _remoteUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);
  //  _remoteUserNameList = <BehaviorSubject<UserName[]>>new BehaviorSubject([]);
  constructor () {
    this.utilsSrv = utilsSrv
    this.avatarService = avatarService
    this.users = []
    // 双向绑定
    this._remoteUsers = users => store.commit("openvidu/SET_RemoteUsers", users)
    this.remoteUsers = () => store.getters.remoteUsers
    this._remoteUserNameList = users =>
      store.commit("openvidu/SET_RemoteUserNameList", users)
    this.remoteUserNameList = () => store.getters.remoteUserNameList
  }
  // 更新界面
  updateUsers () {
    this._remoteUsers(this.users)
  }

  add (event, subscriber) {
    let nickname = ""
    let avatar = ""
    const connectionId =
      event?.stream?.connection?.connectionId || event?.connection?.connectionId
    const data = event?.stream?.connection?.data || event?.connection?.data
    nickname = this.utilsSrv.getNicknameFromConnectionData(data)
    avatar = this.avatarService.getAvatarFromConnectionData(data)
    const newUser = new UserModel(connectionId, subscriber, nickname)
    newUser.setAvatar(avatar)
    // Add new user (connectionCreated Event) or assign the streamManager to old user when the connnectionId exists (streamCreated Event)
    this.addUser(newUser)
    this.updateUsers()
  }

  removeUserByConnectionId (connectionId) {
    console.log("Deleting user: ", connectionId)
    const user = this.getRemoteUserByConnectionId(connectionId)
    const index = this.users.indexOf(user, 0)
    if (index > -1) {
      this.users.splice(index, 1)
      this.updateUsers()
    }
  }

  someoneIsSharingScreen () {
    return this.users.some(user => user.isScreen())
  }

  toggleUserZoom (connectionId) {
    const user = this.getRemoteUserByConnectionId(connectionId)
    user.setVideoSizeBig(!user.isVideoSizeBig())
  }

  resetUsersZoom () {
    this.users.forEach(u => u.setVideoSizeBig(false))
  }

  setUserZoom (connectionId, zoom) {
    this.getRemoteUserByConnectionId(connectionId)?.setVideoSizeBig(zoom)
  }

  getRemoteUserByConnectionId (connectionId) {
    return this.users.find(u => u.getConnectionId() === connectionId)
  }

  updateNickname (connectionId, nickname) {
    const user = this.getRemoteUserByConnectionId(connectionId)
    user?.setNickname(nickname)
    this._remoteUsers(this.users)

    // Update nickname in remote nickname list
    const remoteUserNameList = this.remoteUserNameList()
    remoteUserNameList.forEach(element => {
      if (element.connectionId === connectionId) {
        element.nickname = nickname
        return
      }
    })
    this._remoteUserNameList(remoteUserNameList)
  }

  clear () {
    this._remoteUsers([])
    this._remoteUserNameList([])
    this.users = []
  }

  getUserAvatar (connectionId) {
    return (
      this.getRemoteUserByConnectionId(connectionId)?.getAvatar() ||
      this.avatarService.getOpenViduAvatar()
    )
  }

  addUserName (event) {
    const nickname = this.utilsSrv.getNicknameFromConnectionData(
      event.connection.data
    )
    const connectionId = event.connection.connectionId
    const newUserNameList = this.remoteUserNameList() 
    newUserNameList?.push({ nickname, connectionId })
    console.log("newUserNameList",newUserNameList)
    
    this._remoteUserNameList(newUserNameList)
  }

  deleteUserName (event) {
    const oldUserNameList = this.remoteUserNameList()
    const newUserNameList = oldUserNameList.filter(
      element => element.connectionId !== event.connection.connectionId
    )
    console.log("deleteUserName:",newUserNameList)
    this._remoteUserNameList(newUserNameList)
  }

  addUser (user) {
    const oldUser = this.getRemoteUserByConnectionId(user.connectionId)

    // Assign streamManager if user exists due to connectionCreated Event
    if (oldUser) {
      oldUser.setStreamManager(user.getStreamManager())
      return
    }

    this.users.push(user)
  }
}

export const remoteUsersService = new RemoteUsersService()
