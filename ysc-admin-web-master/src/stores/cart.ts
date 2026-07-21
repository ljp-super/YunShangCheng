import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  id: number
  productId: number
  name: string
  pic: string
  price: number
  quantity: number
  stock: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const existingItem = items.value.find(i => i.productId === item.productId)
    if (existingItem) {
      if (existingItem.quantity < existingItem.stock) {
        existingItem.quantity += 1
      }
    } else {
      const newItem: CartItem = {
        ...item,
        id: Date.now()
      }
      items.value.push(newItem)
    }
  }

  const removeItem = (productId: number) => {
    const index = items.value.findIndex(i => i.productId === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else if (quantity <= item.stock) {
        item.quantity = quantity
      }
    }
  }

  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
})

export default useCartStore