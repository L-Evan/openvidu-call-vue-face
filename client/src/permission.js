import router from "./router"
import {constantRoutes} from "./router"
import store from "./store"
import { Message } from "element-ui"
import NProgress from "nprogress" // progress bar
import "nprogress/nprogress.css" // progress bar style
// import { getToken } from "@/utils/auth" // get token from cookie
import allStroy from "@/lib/utils/localStrory"   //jwtToken
import getPageTitle from "@/utils/get-page-title"

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ["login","Page404"] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  console.log(from, to) 
  // start progress bar
  NProgress.start() 
  // set page title
  document.title = getPageTitle(to.meta.title)
  // determine whether the user has logged in
  const hasToken = allStroy.getToken()// getToken()
 
  if (hasToken) {
    if (to.name === "login") {
      // if is logged in, redirect to the home page
      next({ path: "/" })
      NProgress.done()
    } else {
      const hasGetUserInfo =   store.getters.roles.length!==0
     
      console.log("you权限",hasGetUserInfo)
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // get user info
          store.dispatch("user/getInfo").then(res => {
            const {roles} = res
            console.log("权限",roles)
            store.dispatch("GenerateRoutes", { roles }).then(() => { // 生成可访问的路由表
              //重新加载路由  
              router.options.routes = constantRoutes.concat(store.getters.addRouters)
              router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
              
              console.log("可访问的",store.getters.addRouters,router.options.routes)
              next({ ...to, replace: true })// hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
            })
          })   
        } catch (error) {
          // remove token and go to login page to re-login
          store.dispatch("user/resetToken")
          console.log("错了话！！！！！！！！！1")
          Message.error(error || "Has Error")
          // 报错 
          //next(`/login/login?redirect=${to.path}`)
          NProgress.done()
        }
        console.log("结束")
      }
    }
  } else {
    /* has no token*/ 
    if (whiteList.indexOf(to.name) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      // `/login?redirect=${to.path}`
      next({name:"login"})
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
