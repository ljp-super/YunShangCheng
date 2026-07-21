import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'

const STORAGE_KEY = 'operation_logs'
const MAX_LOGS = 500

/** 操作日志类型 */
export interface OperationLog {
  id: number
  /** 操作模块 */
  module: string
  /** 操作类型 */
  action: string
  /** 操作详情 */
  detail: string
  /** 操作人 */
  operator: string
  /** 操作时间 */
  time: string
  /** IP地址 */
  ip: string
}

/** 操作日志store - 审计追踪 */
export const useOperationLogStore = defineStore('operationLog', () => {
  const logs = ref<OperationLog[]>(loadLogs())

  function loadLogs(): OperationLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  function saveLogs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.value))
  }

  /** 添加操作日志 */
  function addLog(module: string, action: string, detail: string) {
    const userStore = useUserStore()
    const now = new Date()
    const log: OperationLog = {
      id: Date.now(),
      module,
      action,
      detail,
      operator: userStore.userInfo.username || '未知用户',
      time: now.toISOString().replace('T', ' ').substring(0, 19),
      ip: '127.0.0.1'
    }
    logs.value.unshift(log)
    // 限制日志数量
    if (logs.value.length > MAX_LOGS) {
      logs.value = logs.value.slice(0, MAX_LOGS)
    }
    saveLogs()
  }

  /** 按条件筛选日志 */
  function getFilteredLogs(params: {
    module?: string
    operator?: string
    startTime?: string
    endTime?: string
  }): OperationLog[] {
    return logs.value.filter(log => {
      if (params.module && log.module !== params.module) return false
      if (params.operator && !log.operator.includes(params.operator)) return false
      if (params.startTime && log.time < params.startTime) return false
      if (params.endTime && log.time > params.endTime) return false
      return true
    })
  }

  /** 清空日志 */
  function clearLogs() {
    logs.value = []
    saveLogs()
  }

  /** 日志统计 */
  const stats = computed(() => {
    const moduleSet = new Set(logs.value.map(l => l.module))
    const operatorSet = new Set(logs.value.map(l => l.operator))
    return {
      total: logs.value.length,
      modules: Array.from(moduleSet),
      operators: Array.from(operatorSet)
    }
  })

  return {
    logs,
    addLog,
    getFilteredLogs,
    clearLogs,
    stats
  }
})

export default useOperationLogStore
