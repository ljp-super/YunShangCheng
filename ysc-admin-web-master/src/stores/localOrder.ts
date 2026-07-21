import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OmsOrder, OmsOrderItem } from '@/types/order'
import { useCartStore } from './cart'
import { useUserStore } from './user'

const STORAGE_KEY = 'local_orders'

/** 本地订单store - 用localStorage持久化模拟订单 */
export const useLocalOrderStore = defineStore('localOrder', () => {
  const orders = ref<OmsOrder[]>(loadOrders())

  function loadOrders(): OmsOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  function saveOrders() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
  }

  /** 生成订单编号 */
  function generateOrderSn(): string {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const h = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    const s = String(now.getSeconds()).padStart(2, '0')
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${y}${m}${d}${h}${min}${s}${rand}`
  }

  /** 从购物车创建订单（支付成功后调用） */
  function createOrderFromCart(payType: number = 1): OmsOrder | null {
    const cartStore = useCartStore()
    const userStore = useUserStore()

    if (cartStore.items.length === 0) return null

    const now = new Date()
    const nowStr = now.toISOString().replace('T', ' ').substring(0, 19)
    const orderSn = generateOrderSn()
    const totalAmount = cartStore.totalPrice

    // 构建订单商品项
    const orderItemList: OmsOrderItem[] = cartStore.items.map((item, index) => ({
      id: Date.now() + index,
      orderId: 0,
      orderSn: orderSn,
      productId: item.productId,
      productPic: item.pic,
      productName: item.name,
      productBrand: '',
      productSn: '',
      productPrice: item.price,
      productQuantity: item.quantity,
      productSkuId: 0,
      productSkuCode: '',
      productCategoryId: 0,
      promotionName: '',
      promotionAmount: 0,
      couponAmount: 0,
      integrationAmount: 0,
      realAmount: item.price * item.quantity,
      giftIntegration: 0,
      giftGrowth: 0,
      productAttr: ''
    }))

    const order: OmsOrder = {
      id: Date.now(),
      memberId: 0,
      orderSn: orderSn,
      createTime: nowStr,
      memberUsername: userStore.userInfo.username || 'user',
      totalAmount: totalAmount,
      payAmount: totalAmount,
      freightAmount: 0,
      promotionAmount: 0,
      integrationAmount: 0,
      couponAmount: 0,
      discountAmount: 0,
      payType: payType,
      sourceType: 0,
      status: 1, // 已付款（待发货）
      orderType: 0,
      deliveryCompany: '',
      deliverySn: '',
      autoConfirmDay: 15,
      integration: Math.floor(totalAmount),
      growth: Math.floor(totalAmount),
      promotionInfo: '',
      billType: 0,
      billHeader: '',
      billContent: '',
      billReceiverPhone: '',
      billReceiverEmail: '',
      receiverName: userStore.userInfo.username || 'user',
      receiverPhone: '',
      receiverPostCode: '',
      receiverProvince: '',
      receiverCity: '',
      receiverRegion: '',
      receiverDetailAddress: '',
      note: '',
      confirmStatus: 0,
      deleteStatus: 0,
      useIntegration: 0,
      paymentTime: nowStr,
      deliveryTime: '',
      receiveTime: '',
      commentTime: '',
      modifyTime: nowStr
    }

    // 将订单商品项附加到订单上（用扩展字段存储）
    ;(order as any).orderItemList = orderItemList

    orders.value.unshift(order)
    saveOrders()
    return order
  }

  /** 获取所有本地订单 */
  function getAllOrders(): OmsOrder[] {
    return orders.value
  }

  /** 按条件筛选本地订单 */
  function getFilteredOrders(params: {
    orderSn?: string
    status?: number | string
    memberUsername?: string
  }): OmsOrder[] {
    return orders.value.filter(order => {
      if (params.orderSn && !order.orderSn!.includes(params.orderSn)) return false
      if (params.status !== undefined && params.status !== '' && order.status !== Number(params.status)) return false
      if (params.memberUsername && order.memberUsername !== params.memberUsername) return false
      return true
    })
  }

  /** 更新订单状态 */
  function updateOrderStatus(orderId: number, status: number) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      order.modifyTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
      if (status === 2) {
        order.deliveryTime = order.modifyTime
      }
      saveOrders()
    }
  }

  /** 删除订单 */
  function deleteOrder(orderId: number) {
    const index = orders.value.findIndex(o => o.id === orderId)
    if (index > -1) {
      orders.value.splice(index, 1)
      saveOrders()
    }
  }

  /** 本地订单统计 */
  const stats = computed(() => {
    const all = orders.value
    return {
      total: all.length,
      pendingPayment: all.filter(o => o.status === 0).length,
      pendingDelivery: all.filter(o => o.status === 1).length,
      shipped: all.filter(o => o.status === 2).length,
      completed: all.filter(o => o.status === 3).length,
      totalAmount: all.reduce((sum, o) => sum + o.payAmount, 0)
    }
  })

  return {
    orders,
    createOrderFromCart,
    getAllOrders,
    getFilteredOrders,
    updateOrderStatus,
    deleteOrder,
    stats
  }
})

export default useLocalOrderStore
