// import '../public/index.css'

//babel-polyfill 
import "core-js/stable"
import "regenerator-runtime/runtime"
//babel
import "core-js" 

//router配置
import router from "@/router"
// const fetch2 = require("node-fetch") 
import Vue from "vue"
import store from "./store/index"
//入口
import App from "@/App"  // 名字要对应
//tokenD:\GIT\Gihub\Science\client\src\lib\utils\localStrory.js
// import allStroy from "@/lib/utils/localStrory"  
// ui
import ElementUI from "element-ui"
// ui样式
import "element-ui/lib/theme-chalk/index.css"
// 导航的内容
import "@/icons" // icon
import "@/styles/index.scss" // global css
//??
import "normalize.css/normalize.css" // A modern alternative to CSS resets
// layui
import "@/asset/jsp/icheck/minimal/red.css" 
import  "@/asset/jsp/css/global.css" 

import "./permission.js"
// bootstrap
import "jquery"
import "@popperjs/core"  
import "bootstrap/dist/js/bootstrap.min.js"
// 高德
import VueAMap from "vue-amap"
Vue.use(VueAMap)
VueAMap.initAMapApiLoader({
  key: "af70339539f4dac1352b697777d09037",
  plugin: ["AMap.PlaceSearch", "AMap.Geolocation","AMap.AdvancedInfoWindow"],
  v: "1.4.15",
  uiVersion: "1.1"
})

// 路由控制
// router.beforeEach(async (to, from, next) => {
//   console.log(from, to)
//   const token = allStroy.getToken()
//   console.log("token",token)
  
//   if(to.path==="/error/404"){
//     next()
//     return 
//   } 

//   if (token) {
//     //  转主页
//     if (to.name === "login" || to.name === null) {
//       next({ name: "main" })
//     }
//     next()
//     return
//   } else if(to.name!=="login") {
//     // 去登录
//     next({ name: "login" })
//     return 
//   }
//   // 去登录
//   next()
// })

// Vue 挂载
Vue.use(ElementUI)
new Vue({
  router: router,
  store,
  render(h) {
    return h(App)
  }
}).$mount("#app")

export default router


