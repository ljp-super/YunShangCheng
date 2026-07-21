<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetailByIdAPI } from '@/apis/order'
import { useLocalOrderStore } from '@/stores/localOrder'
import type { OmsOrder } from '@/types/order'

const route = useRoute()
const router = useRouter()
const localOrderStore = useLocalOrderStore()

const order = ref<OmsOrder | null>(null)
const loading = ref(true)

const orderId = Number(route.params.id)

const getOrderDetail = async () => {
  loading.value = true
  try {
    // 先从本地订单查找
    const localOrder = localOrderStore.orders.find(o => o.id === orderId)
    if (localOrder) {
      order.value = localOrder
      ;(order.value as any)._isLocal = true
      loading.value = false
      return
    }
    // 再从后端查找
    const response = await getOrderDetailByIdAPI(orderId)
    order.value = response.data
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('获取订单详情失败:', error)
  }
}

const handleBack = () => {
  router.push('/user/order')
}

onMounted(() => {
  getOrderDetail()
})
</script>

<template>
  <div class="app-container" v-loading="loading">
    <div class="order-detail-header">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回订单列表
      </el-button>
      <div class="order-title">
        <span>订单详情</span>
        <el-tag v-if="(order as any)?._isLocal" size="small" type="success" style="margin-left: 8px">本地订单</el-tag>
      </div>
    </div>

    <el-card v-if="order" class="order-info-card">
      <div class="order-info-section">
        <h3>订单信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>订单编号</label>
            <span>{{ order.orderSn }}</span>
          </div>
          <div class="info-item">
            <label>订单状态</label>
            <el-tag :type="order.status === 0 ? 'warning' : order.status === 1 ? 'info' : order.status === 2 ? 'primary' : order.status === 3 ? 'success' : 'danger'">
              {{ order.status === 0 ? '待付款' : order.status === 1 ? '待发货' : order.status === 2 ? '已发货' : order.status === 3 ? '已完成' : '已关闭' }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>创建时间</label>
            <span>{{ order.createTime }}</span>
          </div>
          <div class="info-item">
            <label>支付时间</label>
            <span>{{ order.paymentTime || '-' }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card v-if="order" class="order-items-card">
      <div class="order-items-section">
        <h3>商品清单</h3>
        <el-table :data="(order as any).orderItemList || []" border style="width: 100%">
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="productPic" label="商品图片" width="80">
            <template #default="scope">
              <el-image v-if="scope.row.productPic" :src="scope.row.productPic" style="width: 60px; height: 60px; object-fit: cover" />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="productPrice" label="单价" width="100">
            <template #default="scope">¥{{ scope.row.productPrice }}</template>
          </el-table-column>
          <el-table-column prop="productQuantity" label="数量" width="80" align="center" />
          <el-table-column prop="realAmount" label="小计" width="100">
            <template #default="scope">¥{{ scope.row.realAmount }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card v-if="order" class="order-amount-card">
      <div class="order-amount-section">
        <h3>金额汇总</h3>
        <div class="amount-list">
          <div class="amount-item">
            <span>商品总额</span>
            <span>¥{{ order.totalAmount }}</span>
          </div>
          <div class="amount-item">
            <span>运费</span>
            <span>¥{{ order.freightAmount }}</span>
          </div>
          <div v-if="order.promotionAmount > 0" class="amount-item">
            <span>促销优惠</span>
            <span style="color: #67C23A">-¥{{ order.promotionAmount }}</span>
          </div>
          <div class="amount-item total">
            <span>实付金额</span>
            <span class="total-amount">¥{{ order.payAmount }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card v-if="order" class="order-receiver-card">
      <div class="order-receiver-section">
        <h3>收货信息</h3>
        <div class="receiver-info">
          <div class="receiver-item">
            <label>收货人</label>
            <span>{{ order.receiverName || '-' }}</span>
          </div>
          <div class="receiver-item">
            <label>联系电话</label>
            <span>{{ order.receiverPhone || '-' }}</span>
          </div>
          <div class="receiver-item full">
            <label>收货地址</label>
            <span>{{ order.receiverProvince }}{{ order.receiverCity }}{{ order.receiverRegion }}{{ order.receiverDetailAddress || '-' }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
}

.order-detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.order-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 20px;
}

.order-info-card,
.order-items-card,
.order-amount-card,
.order-receiver-card {
  margin-bottom: 15px;
}

.order-info-section h3,
.order-items-section h3,
.order-amount-section h3,
.order-receiver-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item label {
  color: #909399;
}

.amount-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-item.total {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #EBEEF5;
}

.total-amount {
  font-size: 20px;
  font-weight: bold;
  color: #F56C6C;
}

.receiver-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.receiver-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.receiver-item label {
  color: #909399;
  font-size: 14px;
}

.receiver-item.full {
  grid-column: span 2;
}

.receiver-item.full span {
  word-break: break-all;
}
</style>
