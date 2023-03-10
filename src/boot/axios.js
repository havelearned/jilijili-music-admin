import {boot} from "quasar/wrappers"
import axios from "axios"
import store from "../store";
import {Loading, Notify} from "quasar"
import {whiteList} from "src/permission.js";

// const baseURL = import.meta.env.VITE_BASEURL_TENXUN
const baseURL = import.meta.env.VITE_BASEURL_DEV
// const baseURL = import.meta.env.VITE_BASEURL
// console.log("import", import.meta)
// console.log("import.url", import.meta.env.BASE_URL)
// console.log("import.env.MODE", import.meta.env.MODE)
// console.log("import.meta.env.VITE_BASEURL", import.meta.env.VITE_BASEURL)

const api = axios.create({
  baseURL: baseURL,
})
const tokenPrefix = "Bearer ";

// 请求拦截器
api.interceptors.request.use(config => {
  if (store.state.user.token) {
    config.headers["Authorization"] = tokenPrefix + store.state.user.token;
  }
  config.headers["Content-Type"] = "application/json"
  config.headers["Access-Control-Allow-Origin"] = "*"
  return config
}, error => {
  return Promise.reject(error)
})


// 响应拦截器
api.interceptors.response.use(response => {
  console.log("api.interceptors.response.success=>", response)
  // 包含有白名单
  if (whiteList.indexOf(response.config.url) !== -1) {
    return response
  }
  return response.data
}, error => {
  Loading.hide()
  // 得到错误的相应信息
  let response = error.response
  console.log("api.interceptors.response.error=>", error.response,", response=>",Boolean(response))
  if (response) {
    // 根据返回的状态码,做相应的逻辑处理
    switch (response.data.code) {
      case 401:
        store.dispatch("logout")
        break;
    }
  }else if(response !== undefined){
    Notify.create({
      type: "negative", message: response.data.message, position: "top",
    })
  }else{
    handleErrorMessages(error);
  }
  return Promise.reject(error)

})


// 处理错误提示信息
function handleErrorMessages(error) {
  switch (error.message) {
    case "Network Error":
      Notify.create({
        type: "negative", message: "网络错误,请检查是否链接到互联网!!!", position: "top",
      })
      break;
    default: {
      Notify.create({
        type: "negative", message: error.message, position: "top",
      })
    }
  }
}


export default boot(({app}) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export {api}

