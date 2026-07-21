import { useUserStore } from '@/stores/user'
import type { CommonResult } from '@/types/common'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 创建axios实例
const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_SERVER_URL,
  timeout: 30000,
})

// axios请求拦截器
http.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    const token = userStore.userInfo.token
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  e => Promise.reject(e),
)

// axios响应拦截器
http.interceptors.response.use(
  response => {
    const res: CommonResult<unknown> = response.data
    if (res.code !== 200) {
      ElMessage({
        message: res.message,
        type: 'error',
        duration: 3 * 1000,
      })
      if (res.code === 401) {
        ElMessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          const userStore = useUserStore()
          userStore.fedLogout()
          location.reload()
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    // 全局处理异常请求
    console.log('error' + error)
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 3 * 1000,
    })
    return Promise.reject(error)
  },
)

export default http
