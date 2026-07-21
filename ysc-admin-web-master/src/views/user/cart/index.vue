<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useLocalOrderStore } from '@/stores/localOrder'
import { useOperationLogStore } from '@/stores/operationLog'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const cartStore = useCartStore()
const localOrderStore = useLocalOrderStore()
const logStore = useOperationLogStore()
const router = useRouter()

const handleQuantityChange = (productId: number, delta: number) => {
  const item = cartStore.items.find(i => i.productId === productId)
  if (item) {
    cartStore.updateQuantity(productId, item.quantity + delta)
  }
}

const handleRemove = (productId: number) => {
  cartStore.removeItem(productId)
}

// 结算支付相关
const showCheckoutDialog = ref(false)
const paymentMethod = ref('alipay')
const paying = ref(false)
const paySuccess = ref(false)

const paymentOptions = [
  { label: '支付宝', value: 'alipay', icon: '💰' },
  { label: '微信支付', value: 'wechat', icon: '💚' },
  { label: '银行卡', value: 'bank', icon: '🏦' }
]

const handleCheckout = () => {
  showCheckoutDialog.value = true
  paySuccess.value = false
  paymentMethod.value = 'alipay'
}

const handlePay = () => {
  paying.value = true
  // 模拟支付请求延迟
  setTimeout(() => {
    paying.value = false
    paySuccess.value = true
    // 创建本地订单
    const payTypeMap: Record<string, number> = { alipay: 1, wechat: 2, bank: 1 }
    const order = localOrderStore.createOrderFromCart(payTypeMap[paymentMethod.value])
    if (order) {
      logStore.addLog('订单', '创建订单', `订单编号: ${order.orderSn}，支付金额: ¥${order.payAmount}`)
    }
    cartStore.clearCart()
    ElMessage.success('支付成功！')
    // 2秒后关闭弹窗并跳转
    setTimeout(() => {
      showCheckoutDialog.value = false
      router.push('/user/order')
    }, 2000)
  }, 1500)
}

const handleContinueShopping = () => {
  router.push('/user/home')
}
</script>

<template>
  <div class="app-container">
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <div class="empty-icon">🛒</div>
      <p class="empty-text">购物车是空的</p>
      <el-button type="primary" @click="handleContinueShopping">去购物</el-button>
    </div>

    <div v-else class="cart-content">
      <div class="cart-header">
        <h2>我的购物车</h2>
        <span class="item-count">共 {{ cartStore.totalCount }} 件商品</span>
      </div>

      <div class="cart-list">
        <el-card v-for="item in cartStore.items" :key="item.productId" class="cart-item">
          <div class="cart-item-content">
            <div class="product-image">
              <img :src="item.pic" :alt="item.name" />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ item.name }}</h3>
              <p class="product-price">¥{{ item.price }}</p>
              <div class="quantity-control">
                <el-button size="small" @click="handleQuantityChange(item.productId, -1)" :disabled="item.quantity <= 1">-</el-button>
                <span class="quantity">{{ item.quantity }}</span>
                <el-button size="small" @click="handleQuantityChange(item.productId, 1)" :disabled="item.quantity >= item.stock">+</el-button>
                <span class="stock-info">库存: {{ item.stock }}</span>
              </div>
            </div>
            <div class="product-actions">
              <p class="subtotal">¥{{ item.price * item.quantity }}</p>
              <el-button size="small" type="danger" @click="handleRemove(item.productId)">删除</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <div class="cart-footer">
        <div class="total-info">
          <span>商品总数: {{ cartStore.totalCount }} 件</span>
          <span class="total-price">合计: ¥{{ cartStore.totalPrice }}</span>
        </div>
        <div class="footer-actions">
          <el-button @click="handleContinueShopping">继续购物</el-button>
          <el-button type="primary" @click="handleCheckout">去结算</el-button>
        </div>
      </div>
    </div>

    <!-- 结算支付弹窗 -->
    <el-dialog v-model="showCheckoutDialog" title="确认订单并支付" width="500px" :close-on-click-modal="false">
      <!-- 支付成功状态 -->
      <div v-if="paySuccess" class="pay-success">
        <div class="success-icon">✅</div>
        <p class="success-text">支付成功！</p>
        <p class="success-tip">即将跳转到订单页面...</p>
      </div>

      <!-- 结算内容 -->
      <div v-else class="checkout-content">
        <!-- 商品摘要 -->
        <div class="checkout-section">
          <h4 class="section-title">商品清单</h4>
          <div class="order-items">
            <div v-for="item in cartStore.items" :key="item.productId" class="order-item">
              <span class="item-name">{{ item.name }} x{{ item.quantity }}</span>
              <span class="item-price">¥{{ item.price * item.quantity }}</span>
            </div>
          </div>
        </div>

        <!-- 金额汇总 -->
        <div class="checkout-section">
          <div class="amount-row">
            <span>商品总额</span>
            <span>¥{{ cartStore.totalPrice }}</span>
          </div>
          <div class="amount-row">
            <span>运费</span>
            <span class="free-shipping">免运费</span>
          </div>
          <div class="amount-row total-row">
            <span>实付金额</span>
            <span class="pay-amount">¥{{ cartStore.totalPrice }}</span>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="checkout-section">
          <h4 class="section-title">选择支付方式</h4>
          <div class="payment-methods">
            <div
              v-for="opt in paymentOptions"
              :key="opt.value"
              class="payment-method"
              :class="{ active: paymentMethod === opt.value }"
              @click="paymentMethod = opt.value"
            >
              <span class="method-icon">{{ opt.icon }}</span>
              <span class="method-label">{{ opt.label }}</span>
              <span v-if="paymentMethod === opt.value" class="method-check">✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底部按钮 -->
      <template #footer v-if="!paySuccess">
        <el-button @click="showCheckoutDialog = false">取消</el-button>
        <el-button type="primary" :loading="paying" @click="handlePay">
          {{ paying ? '支付中...' : `确认支付 ¥${cartStore.totalPrice}` }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.empty-cart {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 18px;
  color: #909399;
  margin-bottom: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cart-header h2 {
  font-size: 24px;
  margin: 0;
}

.item-count {
  color: #909399;
}

.cart-list {
  margin-bottom: 20px;
}

.cart-item {
  margin-bottom: 15px;
}

.cart-item-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-image {
  width: 100px;
  height: 100px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.product-price {
  font-size: 18px;
  color: #E6A23C;
  font-weight: bold;
  margin: 0 0 15px 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-size: 16px;
}

.stock-info {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}

.product-actions {
  text-align: right;
}

.subtotal {
  font-size: 20px;
  color: #E6A23C;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.total-info {
  display: flex;
  gap: 30px;
}

.total-info span {
  font-size: 16px;
}

.total-price {
  font-size: 20px;
  color: #E6A23C;
  font-weight: bold;
}

.footer-actions {
  display: flex;
  gap: 15px;
}

/* 结算弹窗样式 */
.checkout-content {
  max-height: 450px;
  overflow-y: auto;
}

.checkout-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.checkout-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: bold;
  color: #303133;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.item-name {
  color: #606266;
}

.item-price {
  color: #E6A23C;
  font-weight: 500;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.amount-row:last-child {
  margin-bottom: 0;
}

.free-shipping {
  color: #67C23A;
}

.total-row {
  padding-top: 8px;
  border-top: 1px dashed #DCDFE6;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.pay-amount {
  color: #F56C6C;
  font-size: 20px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #DCDFE6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method:hover {
  border-color: #409EFF;
}

.payment-method.active {
  border-color: #409EFF;
  background: #ECF5FF;
}

.method-icon {
  font-size: 20px;
}

.method-label {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.method-check {
  color: #409EFF;
  font-weight: bold;
}

/* 支付成功样式 */
.pay-success {
  text-align: center;
  padding: 30px 0;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-text {
  font-size: 20px;
  font-weight: bold;
  color: #67C23A;
  margin: 0 0 8px 0;
}

.success-tip {
  font-size: 14px;
  color: #909399;
  margin: 0;
}
</style>
