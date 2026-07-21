<script setup lang="ts">
import { ref, onMounted, computed, markRaw } from 'vue'
import { str2Date } from '@/utils/datetime'
import img_home_order from '@/assets/images/home_order.png'
import img_home_today_amount from '@/assets/images/home_today_amount.png'
import img_home_yesterday_amount from '@/assets/images/home_yesterday_amount.png'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import VChart from 'vue-echarts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import { Clock, Box, ShoppingCart, WarningFilled, Document, Van } from '@element-plus/icons-vue'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

type LineChartDataItem = {
  date: string,
  orderCount: number,
  orderAmount: number
}

const defaultLineChartData: LineChartDataItem[] = [
  { date: '2026-01-01', orderCount: 10, orderAmount: 1093 },
  { date: '2026-01-02', orderCount: 20, orderAmount: 2230 },
  { date: '2026-01-03', orderCount: 33, orderAmount: 3623 },
  { date: '2026-01-04', orderCount: 50, orderAmount: 6423 },
  { date: '2026-01-05', orderCount: 80, orderAmount: 8492 },
  { date: '2026-01-06', orderCount: 60, orderAmount: 6293 },
  { date: '2026-01-07', orderCount: 20, orderAmount: 2293 },
  { date: '2026-01-08', orderCount: 60, orderAmount: 6293 },
  { date: '2026-01-09', orderCount: 50, orderAmount: 5293 },
  { date: '2026-01-10', orderCount: 30, orderAmount: 3293 },
  { date: '2026-01-11', orderCount: 20, orderAmount: 2293 },
  { date: '2026-01-12', orderCount: 80, orderAmount: 8293 },
  { date: '2026-01-13', orderCount: 100, orderAmount: 10293 },
  { date: '2026-01-14', orderCount: 10, orderAmount: 1293 },
  { date: '2026-01-15', orderCount: 40, orderAmount: 4293 }
]

const defaultStartDate = new Date(2026, 0, 1)
const datePickerRange = ref<Date[]>([])

const initDatePickerRange = () => {
  const start = defaultStartDate
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7)
  datePickerRange.value = [start, end] as Date[]
}

const lineChartData = ref<LineChartDataItem[]>([])
const loading = ref(false)

const getLineChartData = () => {
  loading.value = true
  setTimeout(() => {
    const start = datePickerRange.value[0]
    const end = datePickerRange.value[1]
    lineChartData.value = defaultLineChartData.filter(item => {
      const currDate = str2Date(item.date)
      return currDate!.getTime() >= start!.getTime() && currDate!.getTime() <= end!.getTime()
    })
    loading.value = false
  }, 1000)
}

onMounted(() => {
  initDatePickerRange()
  getLineChartData()
})

const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const start = defaultStartDate
      const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const start = defaultStartDate
      const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30)
      return [start, end]
    }
  }
]

const handleDatePickerRangeChange = () => {
  getLineChartData()
}

const pendingItems = ref([
  { title: '待付款订单', count: 10, icon: markRaw(ShoppingCart), color: 'danger' },
  { title: '待发货订单', count: 8, icon: markRaw(Box), color: 'warning' },
  { title: '待确认收货', count: 15, icon: markRaw(Van), color: 'primary' },
  { title: '待处理退款', count: 5, icon: markRaw(WarningFilled), color: 'danger' },
  { title: '待处理退货', count: 3, icon: markRaw(Document), color: 'warning' },
  { title: '广告位即将到期', count: 2, icon: markRaw(Clock), color: 'info' }
])

const chartOption = computed(() => {
  const dates = lineChartData.value.map(item => item.date)
  const orderCounts = lineChartData.value.map(item => item.orderCount)
  const orderAmounts = lineChartData.value.map(item => item.orderAmount)
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#EBEEF5',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#EBEEF5'
        }
      },
      axisLabel: {
        color: '#909399',
        fontSize: 12
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数量',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#409EFF'
          }
        },
        axisLabel: {
          color: '#909399'
        },
        splitLine: {
          lineStyle: {
            color: '#F5F7FA',
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '订单金额',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#67C23A'
          }
        },
        axisLabel: {
          color: '#909399'
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '订单数量',
        type: 'line',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.02)' }
            ]
          }
        },
        data: orderCounts,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        }
      },
      {
        name: '订单金额',
        type: 'line',
        yAxisIndex: 1,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.02)' }
            ]
          }
        },
        data: orderAmounts,
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          width: 3
        }
      }
    ]
  }
})
</script>

<template>
  <div class="dashboard-container">
    <div class="stats-cards">
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="stat-card card-blue">
            <div class="stat-icon-wrapper">
              <img :src="img_home_order" class="stat-icon">
            </div>
            <div class="stat-info">
              <div class="stat-label">今日订单总数</div>
              <div class="stat-value">200</div>
              <div class="stat-trend">
                <span class="trend-up">+12%</span>
                <span class="trend-label">较昨日</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card card-green">
            <div class="stat-icon-wrapper">
              <img :src="img_home_today_amount" class="stat-icon">
            </div>
            <div class="stat-info">
              <div class="stat-label">今日销售总额</div>
              <div class="stat-value">￥5,000.00</div>
              <div class="stat-trend">
                <span class="trend-up">+8%</span>
                <span class="trend-label">较昨日</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card card-purple">
            <div class="stat-icon-wrapper">
              <img :src="img_home_yesterday_amount" class="stat-icon">
            </div>
            <div class="stat-info">
              <div class="stat-label">昨日销售总额</div>
              <div class="stat-value">￥4,630.00</div>
              <div class="stat-trend">
                <span class="trend-down">-5%</span>
                <span class="trend-label">较前日</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <div class="panel-card">
          <div class="panel-header">
            <h3 class="panel-title">待处理事务</h3>
            <el-button type="primary" link size="small">查看全部</el-button>
          </div>
          <div class="pending-list">
            <div class="pending-item" v-for="item in pendingItems" :key="item.title">
              <div class="pending-icon" :class="item.color">
                <component :is="item.icon" />
              </div>
              <div class="pending-info">
                <span class="pending-title">{{ item.title }}</span>
                <span class="pending-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-header">
            <h3 class="panel-title">订单统计概览</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-num">10,000</div>
              <div class="stat-desc">本月订单总数</div>
              <div class="stat-change up">+10%</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">1,000</div>
              <div class="stat-desc">本周订单总数</div>
              <div class="stat-change down">-10%</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">￥100,000</div>
              <div class="stat-desc">本月销售总额</div>
              <div class="stat-change up">+15%</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">￥50,000</div>
              <div class="stat-desc">本周销售总额</div>
              <div class="stat-change down">-5%</div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-card chart-card">
          <div class="panel-header">
            <h3 class="panel-title">订单统计趋势</h3>
            <el-date-picker 
              size="small" 
              v-model="datePickerRange" 
              type="daterange"
              align="right" 
              unlink-panels 
              range-separator="至" 
              start-placeholder="开始日期" 
              end-placeholder="结束日期"
              :shortcuts="shortcuts" 
              @change="handleDatePickerRangeChange"
              class="date-picker"
            >
            </el-date-picker>
          </div>
          <div class="chart-container">
            <v-chart v-if="!loading" :option="chartOption" autoresize />
            <div v-else class="loading-state">
              <el-skeleton :rows="5" animated />
            </div>
          </div>
        </div>

        <div class="overview-cards">
          <div class="panel-card">
            <div class="panel-header">
              <h3 class="panel-title">商品总览</h3>
            </div>
            <div class="overview-grid">
              <div class="overview-item">
                <div class="overview-value danger">100</div>
                <div class="overview-label">已下架</div>
              </div>
              <div class="overview-item">
                <div class="overview-value success">400</div>
                <div class="overview-label">已上架</div>
              </div>
              <div class="overview-item">
                <div class="overview-value warning">50</div>
                <div class="overview-label">库存紧张</div>
              </div>
              <div class="overview-item">
                <div class="overview-value primary">500</div>
                <div class="overview-label">全部商品</div>
              </div>
            </div>
          </div>
          <div class="panel-card">
            <div class="panel-header">
              <h3 class="panel-title">用户总览</h3>
            </div>
            <div class="overview-grid">
              <div class="overview-item">
                <div class="overview-value primary">100</div>
                <div class="overview-label">今日新增</div>
              </div>
              <div class="overview-item">
                <div class="overview-value primary">200</div>
                <div class="overview-label">昨日新增</div>
              </div>
              <div class="overview-item">
                <div class="overview-value success">1,000</div>
                <div class="overview-label">本月新增</div>
              </div>
              <div class="overview-item">
                <div class="overview-value success">5,000</div>
                <div class="overview-label">会员总数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 24px;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }
}

.card-blue::before {
  background: linear-gradient(180deg, #409EFF 0%, #66B1FF 100%);
}

.card-green::before {
  background: linear-gradient(180deg, #67C23A 0%, #85CE61 100%);
}

.card-purple::before {
  background: linear-gradient(180deg, #9B59B6 0%, #BB8FCE 100%);
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
}

.card-blue .stat-icon-wrapper {
  background: rgba(64, 158, 255, 0.1);
}

.card-green .stat-icon-wrapper {
  background: rgba(103, 194, 58, 0.1);
}

.card-purple .stat-icon-wrapper {
  background: rgba(155, 89, 182, 0.1);
}

.stat-icon {
  width: 40px;
  height: 40px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-up {
  color: #67C23A;
  font-size: 13px;
  font-weight: 500;
}

.trend-down {
  color: #F56C6C;
  font-size: 13px;
  font-weight: 500;
}

.trend-label {
  color: #C0C4CC;
  font-size: 12px;
}

.main-content {
  display: flex;
  gap: 24px;
}

.left-panel {
  width: 360px;
  flex-shrink: 0;
}

.right-panel {
  flex: 1;
}

.panel-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #EBEEF5;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.pending-list {
  padding: 12px 0;
}

.pending-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #F5F7FA;
  }
}

.pending-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 18px;
  color: #ffffff;

  &.danger {
    background: linear-gradient(135deg, #F56C6C 0%, #F89898 100%);
  }

  &.warning {
    background: linear-gradient(135deg, #E6A23C 0%, #EEBE77 100%);
  }

  &.primary {
    background: linear-gradient(135deg, #409EFF 0%, #73B4FF 100%);
  }

  &.info {
    background: linear-gradient(135deg, #909399 0%, #B4B6B8 100%);
  }
}

.pending-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pending-title {
  font-size: 14px;
  color: #606266;
}

.pending-count {
  font-size: 14px;
  font-weight: 600;
  color: #F56C6C;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #EBEEF5;
}

.stat-item {
  background: #ffffff;
  padding: 20px;
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.stat-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;

  &.up {
    color: #67C23A;
  }

  &.down {
    color: #F56C6C;
  }
}

.chart-card {
  height: 420px;
}

.date-picker {
  z-index: 10;
}

.chart-container {
  height: calc(100% - 68px);
  padding: 16px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.overview-cards {
  display: flex;
  gap: 24px;
}

.overview-cards .panel-card {
  flex: 1;
  margin-bottom: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #EBEEF5;
}

.overview-item {
  background: #ffffff;
  padding: 24px 16px;
  text-align: center;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;

  &.danger {
    color: #F56C6C;
  }

  &.success {
    color: #67C23A;
  }

  &.warning {
    color: #E6A23C;
  }

  &.primary {
    color: #409EFF;
  }
}

.overview-label {
  font-size: 13px;
  color: #909399;
}
</style>