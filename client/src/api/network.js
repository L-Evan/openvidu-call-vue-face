import axios from "axios"
import all_stroy from "@/lib/utils/localStrory"
import { asyncErrorHandler } from "./errorHandler"
// import qs from "qs"
// 进行一些全局配置
// 公共路由(网络请求地址)
// axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
// http://localhost:8082
console.log("此时的环境"+process.env.ROOT_API)
axios.defaults.baseURL = process.env.ROOT_API //"https://levani.cn:8080/" //localhost:8080/" ////  https://192.168.137.1:8080/"
// 请求响应超时时间
axios.defaults.timeout = 5000
//post请求设置
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    console.log(`发起请求路径：${config?.url}  token长度： ${all_stroy.getToken()?.length}`)
    config.headers["x-authorization"] = all_stroy.getToken()
    return config
  },
  function (error) {
    console.log("请求的响应错误", error)
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    console.log("-----响应的数据-----", response?.data)
    const token = response.headers["x-authorization"]
    if (token) {
      all_stroy.setToken(token)
    }
    console.log(response.data.code, String(response.data.code).charAt(0))
    // 2开头才是真成功
    // response.data.token 是临时的
    if (String(response.data.code).charAt(0) === "2" || response.data.token) {
      return response
    }

    asyncErrorHandler(response.data)
    return Promise.reject(response)
  },
  function (error) {
    console.log("错误信息", error.response)
    if (error.response) {
      // 处理错误
      asyncErrorHandler(error.response.data)
    } else {
      asyncErrorHandler({
        message: "请求失败，请检查网络链接！"
      })
    }
    return Promise.reject(error)
  }
)

// 封装自己的get/post方法
const request = {
  get: function (path = "", data = {}, catchError = true) {
    return new Promise(function (resolve,reject) {
      axios
        .get(path, {
          params: data
        })
        .then(function (response) {
          // 按需求来，这里我需要的是response.data
          resolve(response.data.data)
        })
        .catch(function (error) {
          // 不需要拦截器错误
          if (!catchError) {
            return reject(error)
          }
        })
    })
  },
  post: function (path = "", data = {}, catchError = true) {
    return new Promise(function (resolve,reject) {
      //Qs.stringify 方法，如果参数是url的话就有问题了 https://blog.csdn.net/csdn_yudong/article/details/79668655
      axios
        .post(path, data)
        .then(function (response) {
          resolve(response.data.data)
        })
        .catch(function (error) {
          // 不需要拦截器错误
          if (!catchError) {
            reject(error)
          }
        })
    })
  }
}

export default request
