import { defineStore } from 'pinia'
import { getAdminInfoAPI, adminLoginAPI, adminLogoutAPI } from '@/apis/admin'
import { ref } from 'vue'
import type { LoginParam, UserInfo } from '@/types/admin'

export const useUserStore = defineStore(
  'user',
  () => {
    // 用户信息
    const userInfo = ref<UserInfo>({
      username: '',
      password: '',
      avatar: '',
      roles: [],
      token: '',
      menus: [],
      id: 0,
      email: '',
      nickName: '',
      note: '',
    })

    // 用户登录
    const userLogin = async (loginParam: LoginParam) => {
      const res = await adminLoginAPI(loginParam)
      const data = res.data || res
      const tokenHead = data.tokenHead || 'Bearer '
      const finalTokenHead = tokenHead.endsWith(' ') ? tokenHead : tokenHead + ' '
      userInfo.value.token = finalTokenHead + data.token
      userInfo.value.username = loginParam.username
      userInfo.value.password = loginParam.password
      await getUserInfo()
      // 记录登录日志
      try {
        const { useOperationLogStore } = await import('./operationLog')
        const logStore = useOperationLogStore()
        logStore.addLog('权限', '用户登录', `用户 ${loginParam.username} 登录系统`)
      } catch {}
    }

    // 获取用户信息
    const getUserInfo = async () => {
      const res = await getAdminInfoAPI()
      const data = res.data || res
      if (data.roles && data.roles.length > 0) {
        userInfo.value.roles = data.roles
      } else {
        throw new Error('该用户暂未分配角色，请先分配角色！')
      }
      userInfo.value.menus = data.menus
      userInfo.value.avatar = data.icon
      userInfo.value.id = data.id || 0
      userInfo.value.email = data.email || ''
      userInfo.value.nickName = data.nickName || ''
      userInfo.value.note = data.note || ''
    }

    // 用户登出
    const userLogout = async () => {
      await adminLogoutAPI()
      userInfo.value.token = ''
      userInfo.value.roles = []
      userInfo.value.menus = []
      userInfo.value.username = ''
      userInfo.value.password = ''
      localStorage.removeItem('user')
    }

    // 前端登出
    const fedLogout = () => {
      userInfo.value.token = ''
      userInfo.value.roles = []
      userInfo.value.menus = []
      userInfo.value.username = ''
      userInfo.value.password = ''
      localStorage.removeItem('user')
    }

    return {
      userInfo,
      userLogin,
      getUserInfo,
      userLogout,
      fedLogout,
    }
  },
  {
    // 持久化配置
    persist: true,
  },
)
