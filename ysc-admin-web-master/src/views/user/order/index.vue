<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderListAPI } from '@/apis/order'
import { useLocalOrderStore } from '@/stores/localOrder'
import { useOperationLogStore } from '@/stores/operationLog'
import type { OmsOrder, OrderQueryParam } from '@/types/order'

const router = useRouter()
const localOrderStore = useLocalOrderStore()
const logStore = useOperationLogStore()

const listQuery = ref<OrderQueryParam>({
  pageNum: 1,
  pageSize: 10
})
const list = ref<OmsOrder[]>([])
const total = ref(0)
const listLoading = ref(true)

const getList = async () => {
  listLoading.value = true
  try {
    const response = await getOrderListAPI(listQuery.value)
    listLoading.value = false
    const backendList = response.data.list || []
    // 合并本地订单
    const localFiltered = localOrderStore.getFilteredOrders({
      orderSn: listQuery.value.orderSn as string,
      status: listQuery.value.status as string
    })
    // 本地订单添加标记
    localFiltered.forEach(o => (o as any)._isLocal = true)
    list.value = [...localFiltered, ...backendList]
    total.value = response.data.total + localFiltered.length
  } catch (error) {
    listLoading.value = false
    // 后端请求失败时只显示本地订单
    const localFiltered = localOrderStore.getFilteredOrders({
      orderSn: listQuery.value.orderSn as string,
      status: listQuery.value.status as string
    })
    localFiltered.forEach(o => (o as any)._isLocal = true)
    list.value = localFiltered
    total.value = localFiltered.length
  }
}

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待付款', value: '0' },
  { label: '已付款', value: '1' },
  { label: '已发货', value: '2' },
  { label: '已完成', value: '3' },
  { label: '已关闭', value: '4' }
]

const handleSearch = () => {
  listQuery.value.pageNum = 1
  getList()
}

const goDetail = (orderId: number) => {
  router.push(`/user/order/detail/${orderId}`)
}

// 模拟支付
const showPayDialog = ref(false)
const paying = ref(false)
const paySuccess = ref(false)
const currentOrder = ref<OmsOrder | null>(null)

const handlePay = (order: OmsOrder) => {
  currentOrder.value = order
  paySuccess.value = false
  showPayDialog.value = true
}

const confirmPay = () => {
  paying.value = true
  setTimeout(() => {
    paying.value = false
    paySuccess.value = true
    ElMessage.success('支付成功！')
    // 更新订单状态
    if (currentOrder.value) {
      if ((currentOrder.value as any)._isLocal) {
        localOrderStore.updateOrderStatus(currentOrder.value.id, 1)
        logStore.addLog('订单', '支付订单', `订单编号: ${currentOrder.value.orderSn}`)
      } else {
        currentOrder.value.status = 1
      }
    }
    setTimeout(() => {
      showPayDialog.value = false
      getList()
    }, 2000)
  }, 1500)
}

// 确认收货
const handleConfirmReceive = (order: OmsOrder) => {
  ElMessage.confirm('确认已收到商品？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if ((order as any)._isLocal) {
      localOrderStore.updateOrderStatus(order.id, 3)
      logStore.addLog('订单', '确认收货', `订单编号: ${order.orderSn}`)
    } else {
      order.status = 3
    }
    ElMessage.success('确认收货成功！')
    getList()
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <div class="search-bar">
      <el-input v-model="listQuery.orderSn" placeholder="订单编号" clearable style="width: 250px" @keyup.enter="handleSearch">
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="listQuery.status" placeholder="订单状态" style="width: 150px" clearable>
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>

    <el-table :data="list" v-loading="listLoading" border>
      <el-table-column prop="orderSn" label="订单编号" width="180">
        <template #default="scope">
          {{ scope.row.orderSn }}
          <el-tag v-if="(scope.row as any)._isLocal" size="small" type="success" style="margin-left: 4px">本地</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="商品信息">
        <template #default="scope">
          <div v-for="item in (scope.row as any).orderItemList" :key="item.id" style="margin-bottom: 5px">
            <span>{{ item.productName }}</span>
            <span style="margin-left: 10px">x{{ item.productQuantity }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="payAmount" label="实付金额" width="120">
        <template #default="scope">
          <span style="color: #E6A23C; font-weight: bold">¥{{ scope.row.payAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="warning">待付款</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="info">待发货</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="primary">已发货</el-tag>
          <el-tag v-else-if="scope.row.status === 3" type="success">已完成</el-tag>
          <el-tag v-else-if="scope.row.status === 4" type="danger">已关闭</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button size="small" @click="goDetail(scope.row.id!)">查看详情</el-button>
          <el-button v-if="scope.row.status === 0" size="small" type="primary" @click="handlePay(scope.row)">去支付</el-button>
          <el-button v-if="scope.row.status === 2" size="small" type="success" @click="handleConfirmReceive(scope.row)">确认收货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-show="total > 0"
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageSize"
      :total="total"
      layout="total, prev, pager, next, jumper"
      @current-change="(val) => { listQuery.pageNum = val; getList() }"
      @size-change="(val) => { listQuery.pageSize = val; getList() }"
    />

    <!-- 模拟支付弹窗 -->
    <el-dialog v-model="showPayDialog" title="订单支付" width="420px" :close-on-click-modal="false">
      <div v-if="paySuccess" class="pay-success">
        <div class="success-icon">✅</div>
        <p class="success-text">支付成功！</p>
      </div>
      <div v-else class="pay-dialog-content">
        <div class="pay-order-info">
          <div class="pay-row">
            <span class="pay-label">订单编号</span>
            <span class="pay-value">{{ currentOrder?.orderSn }}</span>
          </div>
          <div class="pay-row">
            <span class="pay-label">支付金额</span>
            <span class="pay-amount">¥{{ currentOrder?.payAmount }}</span>
          </div>
        </div>
        <div class="pay-tip">本系统为模拟支付，点击下方按钮即可完成支付</div>
      </div>
      <template #footer v-if="!paySuccess">
        <el-button @click="showPayDialog = false">取消</el-button>
        <el-button type="primary" :loading="paying" @click="confirmPay">
          {{ paying ? '支付中...' : `确认支付 ¥${currentOrder?.payAmount}` }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  text-align: center;
}

/* 支付弹窗样式 */
.pay-dialog-content {
  padding: 10px 0;
}

.pay-order-info {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.pay-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.pay-row:last-child {
  margin-bottom: 0;
}

.pay-label {
  font-size: 14px;
  color: #909399;
}

.pay-value {
  font-size: 14px;
  color: #303133;
}

.pay-amount {
  font-size: 24px;
  color: #F56C6C;
  font-weight: bold;
}

.pay-tip {
  text-align: center;
  font-size: 13px;
  color: #909399;
}

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
  margin: 0;
}
</style>
