// 临时改session
class LocalStroy {
  constructor() {
    this.tokenKey = "accessToken_science"
    this.entityKey = "entity"
    console.log("创建对象")
  }
  getToken() { 
    return sessionStorage.getItem(this.tokenKey)
  }
  removeToken() {  
    //是否全删 
    console.log("删token")
    return sessionStorage.removeItem(this.tokenKey)
  }
  setToken(token) {
    console.log("存",token)
    return sessionStorage.setItem(this.tokenKey, token)
  }

  setEntity(entity) {
    return sessionStorage.setItem(this.entityKey, JSON.stringify(entity))
  }
  getEntity() {
    return JSON.parse(sessionStorage.getItem(this.entityKey))
  }
  // 待定 基础不牢
  setStory(key, str) {
    if (str instanceof String && typeof str == "string") {
      return sessionStorage.setItem(key, str)
    }
    return false
  }
}
const allStroy = new LocalStroy()
//console.log(Function instanceof String,Function.prototype,String.prototype)
export default allStroy