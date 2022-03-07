//router
import Router from "vue-router"
import Vue from "vue" 
// import store from "@/store"
Vue.use(Router)
/* Layout */
import Layout from "@/layout"
// 首页
export const constantRoutes = [
  {
    name: "Dashboard", path: "/", 
    component: Layout,
    redirect: "/index", 
    meta: { title: "首页"  }, 
    hidden:true,
    children:[]  
  },
  { path: "*", redirect: "/error/404", hidden: true }
]

// 主节点
const mainChildren = []
// 账户
const accountChildren = []
//维修表
const rotaChildren = []
//值班
const dutyChildren = []
const requireContext = require.context(
  "../views",
  true,
  /\.vue$/
)
// 所有路径
const keys = requireContext.keys()
keys.forEach(key => {
  const component = requireContext(key)
  const path = key.replace(/^\.|\.vue$/g, "")
  const name = component.default.ROUTER_NAME
  const title = component.default.ROUTER_TITLE
  const icon = component.default.ROUTER_ICON
  const hidden = component.default.ROUTER_HIDDEN
  const router = {
    name,
    path,
    hidden:hidden?true:false,
    component: (resolve) => require([`@/views${path}.vue`], resolve),
    meta: {
      icon:icon??"",
      role: [],
      title: title ?? "页面",
    },
    roles: component.default.ROUTER_ROLES??[]
  } 
  const layrouter = {
    path, 
    component:Layout,
    children:[router],
  } 

  // 首页
  if(name=="index"){ 
    constantRoutes[0].children.push( router )
  }
  // 主要功能页
  else if (/^\/main\//.test(path)  ) {  
    if (/^\/main\/rota\//.test(path)  ) {
      rotaChildren.push(router)
    }else if (/^\/main\/duty\//.test(path)  ) {
      dutyChildren.push(router)
    }else{
      mainChildren.push(layrouter) 
    }
      
  // 登录相关页
  } else if (/^\/login\//.test(path)) {
    router.hidden = true
    constantRoutes.push(router) 
    // 账户管理
  }else if (/^\/account\//.test(path)) { 
    accountChildren.push(router)
  } else {
  // 其他
    router.hidden = true
    constantRoutes.push(router)
  }
})
  

constantRoutes.push(...mainChildren)
//账户
const userLayRouter = {
  hidden:false,
  path:"/account", 
  redirect: "/account/users",
  component:Layout,
  children:accountChildren,
  meta: {
    icon: "el-icon-user",
    role: ["admin"],
    title:  "用户管理",
  }
} 
// 维修
const rotaLayRouter = {
  hidden:false,
  path:"/rota", 
  redirect: "/main/rota/FileSelect",
  component:Layout,
  children:rotaChildren,
  meta: {
    icon: "el-icon-document",
    role: ["admin"],
    title:  "表单管理",
  }
} 
// 维修
const dutyLayRouter = {
  hidden:false,
  path:"/duty", 
  redirect: "/main/duty/rota",
  component:Layout,
  children:dutyChildren,
  meta: {
    icon: "el-icon-alarm-clock",
    role: ["admin"],
    title:  "值班管理",
  }
} 


// constantRoutes.push(userLayRouter)

 
console.log(constantRoutes, "加入路由")

//路由表  
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

//路由实体
const router = createRouter()

export default router 
export function resetRouter() { 
  const newRouter = createRouter()
  constantRoutes.matcher = newRouter.matcher // reset router
}

//异步挂载的路由
//动态需要根据权限加载的路由表 
export const asyncRouterMap = [userLayRouter,rotaLayRouter,dutyLayRouter]

 