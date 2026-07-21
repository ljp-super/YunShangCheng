<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, Document } from '@element-plus/icons-vue'
import { useOperationLogStore } from '@/stores/operationLog'
import { formatDateTime } from '@/utils/datetime'

const logStore = useOperationLogStore()

const searchQuery = ref({
  module: '',
  operator: '',
  dateRange: [] as string[]
})

const filteredLogs = computed(() => {
  return logStore.getFilteredLogs({
    module: searchQuery.value.module,
    operator: searchQuery.value.operator,
    startTime: searchQuery.value.dateRange?.[0],
    endTime: searchQuery.value.dateRange?.[1]
  })
})

// 分页
const currentPage = ref(1)
const pageSize = ref(15)
const pagedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredLogs.value.slice(start, start + pageSize.value)
})

const moduleOptions = computed(() => {
  return logStore.stats.modules.map(m => ({ label: m, value: m }))
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchQuery.value = { module: '', operator: '', dateRange: [] }
  currentPage.value = 1
}

const handleClear = () => {
  ElMessageBox.confirm('确定要清空所有操作日志吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    logStore.clearLogs()
    ElMessage.success('日志已清空')
  }).catch(() => {})
}

// 模块颜色映射
const getModuleTagType = (module: string) => {
  const map: Record<string, string> = {
    '订单': 'warning',
    '商品': 'primary',
    '用户': 'success',
    '权限': 'danger',
    '营销': 'info'
  }
  return map[module] || ''
}

onMounted(() => {
  // store自动加载
})
</script>

<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <el-icon class="el-icon-middle"><Search /></el-icon>
        <span>筛选搜索</span>
        <el-button style="float:right" type="primary" @click="handleSearch">查询搜索</el-button>
        <el-button style="float:right;margin-right: 15px" @click="handleReset">重置</el-button>
      </div>
      <div style="margin-top: 20px">
        <el-form :inline="true" :model="searchQuery" label-width="100px">
          <el-form-item label="操作模块：">
            <el-select v-model="searchQuery.module" placeholder="全部模块" clearable style="width: 200px">
              <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作人：">
            <el-input v-model="searchQuery.operator" placeholder="操作人姓名" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="时间范围：">
            <el-date-picker
              v-model="searchQuery.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 380px"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="operate-container" shadow="never">
      <el-icon class="el-icon-middle"><Document /></el-icon>
      <span>操作日志列表</span>
      <div style="float: right">
        <span style="color: #909399; font-size: 13px; margin-right: 15px">
          共 {{ filteredLogs.length }} 条记录
        </span>
        <el-button type="danger" size="small" :icon="Delete" @click="handleClear">清空日志</el-button>
      </div>
    </el-card>

    <div class="table-container">
      <el-table :data="pagedLogs" border style="width: 100%">
        <el-table-column label="序号" width="70" align="center">
          <template #default="scope">{{ (currentPage - 1) * pageSize + scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="操作模块" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getModuleTagType(scope.row.module)" size="small">{{ scope.row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作类型" width="120" align="center" />
        <el-table-column prop="detail" label="操作详情" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作人" width="120" align="center" />
        <el-table-column label="操作时间" width="180" align="center">
          <template #default="scope">{{ formatDateTime(scope.row.time) }}</template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="130" align="center" />
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        background
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[15, 30, 50]"
        :total="filteredLogs.length"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
  </div>
</template>

<style scoped>
.input-width {
  width: 203px;
}

.table-container {
  margin-top: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>
