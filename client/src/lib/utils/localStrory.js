class LocalStroy {
  constructor() {
    this.tokenKey = "accessToken_science"
    this.entityKey = "entity"
    console.log("创建对象")
  }
  getToken() { 
    return localStorage.getItem(this.tokenKey)
  }
  removeToken() {  
    //是否全删 
    console.log("删token")
    return localStorage.removeItem(this.tokenKey)
  }
  setToken(token) {
    console.log("存",token)
    return localStorage.setItem(this.tokenKey, token)
  }

  setEntity(entity) {
    return localStorage.setItem(this.entityKey, JSON.stringify(entity))
  }
  getEntity() {
    return JSON.parse(localStorage.getItem(this.entityKey))
  }
  // 待定 基础不牢
  setStory(key, str) {
    if (str instanceof String && typeof str == "string") {
      return localStorage.setItem(key, str)
    }
    return false
  }
}
const allStroy = new LocalStroy()
//console.log(Function instanceof String,Function.prototype,String.prototype)
export default allStroy