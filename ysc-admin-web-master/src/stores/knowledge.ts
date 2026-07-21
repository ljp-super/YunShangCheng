import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface KnowledgeItem {
  id: number
  title: string
  content: string
  category: string
  createdAt: string
  updatedAt: string
}

export const useKnowledgeStore = defineStore('knowledge', () => {
  const items = ref<KnowledgeItem[]>([
    {
      id: 1,
      title: '商城简介',
      content: '本商城是一个综合性的电商平台，提供各类商品的在线购买服务。我们支持商品浏览、购物车、订单管理等功能。',
      category: '系统介绍',
      createdAt: '2026-01-01 10:00:00',
      updatedAt: '2026-01-01 10:00:00'
    },
    {
      id: 2,
      title: '购物车使用说明',
      content: '在商品详情页点击"加入购物车"按钮，商品将添加到您的购物车中。您可以在购物车页面修改数量或删除商品。',
      category: '购物指南',
      createdAt: '2026-01-01 10:00:00',
      updatedAt: '2026-01-01 10:00:00'
    },
    {
      id: 3,
      title: '订单状态说明',
      content: '待付款：订单已创建但尚未付款；待发货：已付款等待商家发货；待收货：商家已发货等待签收；已完成：订单已签收完成；已取消：订单已取消。',
      category: '购物指南',
      createdAt: '2026-01-01 10:00:00',
      updatedAt: '2026-01-01 10:00:00'
    },
    {
      id: 4,
      title: '退换货政策',
      content: '支持7天无理由退换货。请在收到商品7天内申请退换货，商品需保持完好无损。',
      category: '售后服务',
      createdAt: '2026-01-01 10:00:00',
      updatedAt: '2026-01-01 10:00:00'
    },
    {
      id: 5,
      title: '常见问题',
      content: 'Q: 如何修改密码？A: 在个人中心点击"修改密码"，输入新密码并确认即可。Q: 如何查看订单？A: 在个人中心点击"我的订单"查看所有订单状态。',
      category: '常见问题',
      createdAt: '2026-01-01 10:00:00',
      updatedAt: '2026-01-01 10:00:00'
    }
  ])

  const categories = computed(() => {
    return [...new Set(items.value.map(item => item.category))]
  })

  const addItem = (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toLocaleString('zh-CN')
    items.value.push({
      ...item,
      id: Date.now(),
      createdAt: now,
      updatedAt: now
    })
    saveToStorage()
  }

  const updateItem = (id: number, item: Partial<Pick<KnowledgeItem, 'title' | 'content' | 'category'>>) => {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) {
      const current = items.value[index]!
      items.value[index] = {
        id: current.id,
        title: item.title ?? current.title,
        content: item.content ?? current.content,
        category: item.category ?? current.category,
        createdAt: current.createdAt,
        updatedAt: new Date().toLocaleString('zh-CN')
      }
      saveToStorage()
    }
  }

  const deleteItem = (id: number) => {
    items.value = items.value.filter(i => i.id !== id)
    saveToStorage()
  }

  const searchKnowledge = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    const matches = items.value.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery)
    )
    
    if (matches.length === 0) {
      return '抱歉，我暂时无法回答这个问题，请联系客服获取帮助。'
    }
    
    return matches.slice(0, 2).map(m => `${m.title}\n${m.content}`).join('\n\n')
  }

  const loadFromStorage = () => {
    const stored = localStorage.getItem('knowledge_items')
    if (stored) {
      try {
        items.value = JSON.parse(stored)
      } catch {
        localStorage.removeItem('knowledge_items')
      }
    }
  }

  const saveToStorage = () => {
    localStorage.setItem('knowledge_items', JSON.stringify(items.value))
  }

  return {
    items,
    categories,
    addItem,
    updateItem,
    deleteItem,
    searchKnowledge,
    loadFromStorage,
    saveToStorage
  }
})