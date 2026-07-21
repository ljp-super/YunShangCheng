import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

/** 数据权限控制 */
export function usePermission() {
  const userStore = useUserStore()

  /** 当前用户角色列表 */
  const roles = computed(() => userStore.userInfo.roles || [])

  /** 是否是超级管理员 */
  const isSuperAdmin = computed(() => {
    return roles.value.some((r: any) => {
      const name = typeof r === 'string' ? r : r?.name || r?.roleName || ''
      return name.includes('超级') || name.includes('系统管理员') || name === 'admin'
    })
  })

  /** 是否是订单管理员 */
  const isOrderAdmin = computed(() => {
    return roles.value.some((r: any) => {
      const name = typeof r === 'string' ? r : r?.name || r?.roleName || ''
      return name.includes('订单') || name === 'orderAdmin'
    })
  })

  /** 是否是商品管理员 */
  const isProductAdmin = computed(() => {
    return roles.value.some((r: any) => {
      const name = typeof r === 'string' ? r : r?.name || r?.roleName || ''
      return name.includes('商品') || name === 'productAdmin'
    })
  })

  /** 是否有订单管理权限 */
  const canManageOrders = computed(() => isSuperAdmin.value || isOrderAdmin.value)

  /** 是否有商品管理权限 */
  const canManageProducts = computed(() => isSuperAdmin.value || isProductAdmin.value)

  /** 当前用户的用户名 */
  const currentUsername = computed(() => userStore.userInfo.username || '')

  return {
    roles,
    isSuperAdmin,
    isOrderAdmin,
    isProductAdmin,
    canManageOrders,
    canManageProducts,
    currentUsername
  }
}
