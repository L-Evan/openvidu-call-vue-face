import api from "@/api/user_info"

import {resetRouter} from "@/router"
// import { login, logout, getInfo } from "@/api/user_info"

import { getToken, setToken, removeToken } from "@/utils/auth"
// import { resetRouter } from "@/router"

const getDefaultState = () => {
  return {
    token: getToken(),
    name: "",
    avatar: "",
    roles:[]
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      api.login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit("SET_TOKEN", data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      api.getInfo(state.token).then(data => {
       
        console.log("用户信息",data) 

        const { username, avatar,roles } = data.user
        console.log("权限",roles)
        
        commit("SET_NAME", username)
        commit("SET_AVATAR", avatar)
        commit("SET_ROLES", roles)
        resolve(data.user)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      api.logout(state.token).then(() => { 
        removeToken() // must remove  token  first
        // 好像登出
        resetRouter() 
        
        console.log("登出")
        commit("RESET_STATE")
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit("RESET_STATE")
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

