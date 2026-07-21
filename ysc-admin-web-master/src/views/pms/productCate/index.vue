<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Tickets } from '@element-plus/icons-vue'
import { getProductCategoryListAPI, productCategoryDeleteByIdAPI, productCategoryUpdateShowStatusAPI, productCategoryUpdateNavStatusAPI } from '@/apis/productCate'
import type { PmsProductCategory } from '@/types/productCate'

// 获取路由
const router = useRouter()
const route = useRoute()

// 当前列表页父分类ID
const parentId = ref(0)
// 列表查询参数
const listQuery = ref({
  pageNum: 1,
  pageSize: 10
})
// 列表数据
const list = ref<PmsProductCategory[]>([])
// 总条数
const total = ref(0)
// 加载状态
const listLoading = ref(true)
// 重置父级ID
const resetParentId = () => {
  listQuery.value.pageNum = 1
  if (route.query.parentId != null) {
    parentId.value = Number(route.query.parentId)
  } else {
    parentId.value = 0
  }
}
// 获取列表数据
const getList = async () => {
  listLoading.value = true
  const res = await getProductCategoryListAPI(parentId.value, listQuery.value)
  listLoading.value = false
  list.value = res.data.list
  total.value = res.data.total
}

// 组件挂载后执行
onMounted(() => {
  resetParentId()
  getList()
})

// 监听查询参数变化
watch(() => route.query, () => {
  resetParentId()
  getList()
})

// 添加商品分类
const handleAddProductCate = () => {
  router.push('/pms/addProductCate')
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  listQuery.value.pageNum = 1
  listQuery.value.pageSize = val
  getList()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  listQuery.value.pageNum = val
  getList()
}

// 处理导航状态变化
const handleNavStatusChange = async (index: number, row: PmsProductCategory) => {
  await productCategoryUpdateNavStatusAPI({ ids: [row.id!].join(','), navStatus: row.navStatus })
  ElMessage({
    message: '修改成功',
    type: 'success',
    duration: 1000
  })
}

// 处理显示状态变化
const handleShowStatusChange = async (index: number, row: PmsProductCategory) => {
  await productCategoryUpdateShowStatusAPI({ ids: [row.id!].join(','), showStatus: row.navStatus })
  ElMessage({
    message: '修改成功',
    type: 'success',
    duration: 1000
  })
}

// 查看下级分类
const handleShowNextLevel = (index: number, row: PmsProductCategory) => {
  router.push({ path: '/pms/productCate', query: { parentId: row.id } })
}

// 转移商品
const handleTransferProduct = (index: number, row: PmsProductCategory) => {
  console.log('handleAddProductCate', row)
}

// 更新分类
const handleUpdate = (index: number, row: PmsProductCategory) => {
  router.push({ path: '/pms/updateProductCate', query: { id: row.id } })
}

// 删除分类
const handleDelete = async (index: number, row: PmsProductCategory) => {
  await ElMessageBox.confirm('是否要删除该品牌', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await productCategoryDeleteByIdAPI(row.id!)
  ElMessage({
    message: '删除成功',
    type: 'success',
    duration: 1000
  })
  getList()
}

// 分类级别过滤器
const levelFilter = (value: number) => {
  if (value === 0) {
    return '一级'
  } else if (value === 1) {
    return '二级'
  }
}

// 禁用下级按钮
const disableNextLevel = (value: number) => {
  if (value === 0) {
    return false
  } else {
    return true
  }
}
</script>

<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <el-icon class="el-icon-middle">
        <Tickets />
      </el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAddProductCate()">
        添加
      </el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="productCateTable" style="width: 100%" :data="list" v-loading="listLoading" border>
        <el-table-column label="分类名称" min-width="200">
          <template #default="scope">
            <span :style="{ paddingLeft: scope.row.level * 20 + 'px' }">
              <strong>{{ scope.row.name }}</strong>
              <span style="margin-left: 8px; font-size: 12px; color: #999;">({{ scope.row.level === 0 ? '一级' : '二级' }})</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="商品数" width="80" align="center">
          <template #default="scope">{{ scope.row.productCount }} {{ scope.row.productUnit }}</template>
        </el-table-column>
        <el-table-column label="状态" width="180" align="center">
          <template #default="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <span :class="scope.row.navStatus === 1 ? 'status-tag status-on' : 'status-tag status-off'">
                {{ scope.row.navStatus === 1 ? '导航' : '' }}
              </span>
              <span :class="scope.row.showStatus === 1 ? 'status-tag status-show' : 'status-tag status-hide'">
                {{ scope.row.showStatus === 1 ? '显示' : '隐藏' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="70" align="center">
          <template #default="scope">{{ scope.row.sort }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" :disabled="scope.row.level !== 0" @click="handleShowNextLevel(scope.$index, scope.row)">查看下级</el-button>
            <el-button size="small" @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper" :page-size="listQuery.pageSize" :page-sizes="[5, 10, 15]"
        v-model:current-page="listQuery.pageNum" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<style scoped>
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-on {
  background-color: #f0f9eb;
  color: #67c23a;
}
.status-off {
  visibility: hidden;
}
.status-show {
  background-color: #ecf5ff;
  color: #409eff;
}
.status-hide {
  background-color: #f5f5f5;
  color: #909399;
}
</style>
