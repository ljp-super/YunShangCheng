<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getProductListAPI } from '@/apis/product'
import { getBrandListAPI } from '@/apis/brand'
import { getProductCategoryListWithChildrenAPI } from '@/apis/productCate'
import { useCartStore } from '@/stores/cart'
import type { PmsProduct, ProductQueryParam } from '@/types/product'
import type { ElSelectDataVo, ElCascaderDataVo } from '@/types/common'

const cartStore = useCartStore()

const listQuery = ref<ProductQueryParam>({
  pageNum: 1,
  pageSize: 12
})
const list = ref<PmsProduct[]>([])
const total = ref(0)
const listLoading = ref(true)

const getList = async () => {
  listLoading.value = true
  try {
    const response = await getProductListAPI(listQuery.value)
    listLoading.value = false
    list.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    listLoading.value = false
    console.error(error)
  }
}

const brandOptions = ref<ElSelectDataVo[]>([])
const getBrandList = async () => {
  const res = await getBrandListAPI({ pageNum: 1, pageSize: 100 })
  brandOptions.value = res.data.list.map(item => ({ label: item.name, value: item.id!.toString() }))
}

const productCateOptions = ref<ElCascaderDataVo[]>([])
const selectProductCateValue = ref([])
const getProductCateList = async () => {
  const res = await getProductCategoryListWithChildrenAPI()
  const list = res.data
  productCateOptions.value = list.map(item => ({
    label: item.name,
    value: item.id!,
    children: item.children?.map(it => ({ label: it.name, value: it.id! }))
  }))
}

const handleSearch = () => {
  listQuery.value.pageNum = 1
  if (selectProductCateValue.value.length > 0) {
    listQuery.value.productCategoryId = selectProductCateValue.value[selectProductCateValue.value.length - 1]
  } else {
    delete listQuery.value.productCategoryId
  }
  getList()
}

const handleReset = () => {
  listQuery.value = { pageNum: 1, pageSize: 12 }
  selectProductCateValue.value = []
  getList()
}

const handleAddToCart = (product: PmsProduct) => {
  cartStore.addItem({
    productId: product.id!,
    name: product.name,
    pic: product.pic!,
    price: product.price!,
    quantity: 1,
    stock: product.stock || 0
  })
  ElMessage.success('添加购物车成功')
}

onMounted(() => {
  getList()
  getBrandList()
  getProductCateList()
})
</script>

<template>
  <div class="app-container">
    <div class="search-bar">
      <el-input v-model="listQuery.keyword" placeholder="搜索商品名称" clearable style="width: 300px" @keyup.enter="handleSearch">
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="listQuery.brandId" placeholder="选择品牌" style="width: 150px" clearable>
        <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-cascader
        v-model="selectProductCateValue"
        :options="productCateOptions"
        :props="{ expandTrigger: 'hover', checkStrictly: true }"
        placeholder="选择分类"
        clearable
        style="width: 200px"
        @change="handleSearch"
      />
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="product-grid">
      <el-card v-for="product in list" :key="product.id" class="product-card" shadow="hover">
        <div class="product-image">
          <img :src="product.pic" :alt="product.name" />
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-subtitle">{{ product.subTitle }}</p>
          <div class="product-price">
            <span class="price">¥{{ product.price }}</span>
            <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
          </div>
          <div class="product-status">
            <span v-if="product.newStatus === 1" class="tag new">新品</span>
            <span v-if="product.recommandStatus === 1" class="tag recommend">推荐</span>
            <span v-if="product.stock" class="tag stock">库存{{ product.stock }}</span>
          </div>
          <el-button type="primary" class="add-cart-btn" @click="handleAddToCart(product)">加入购物车</el-button>
        </div>
      </el-card>
    </div>

    <el-pagination
      v-show="total > 0"
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageSize"
      :total="total"
      layout="total, prev, pager, next, jumper"
      @current-change="(val) => { listQuery.pageNum = val; getList() }"
      @size-change="(val) => { listQuery.pageSize = val; getList() }"
    />
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px 0;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-subtitle {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin-bottom: 10px;
}

.price {
  font-size: 20px;
  color: #E6A23C;
  font-weight: bold;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
  margin-left: 10px;
}

.product-status {
  margin-bottom: 15px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  margin-right: 8px;
}

.tag.new {
  background: #F0F9FF;
  color: #409EFF;
}

.tag.recommend {
  background: #FFF7E6;
  color: #E6A23C;
}

.tag.stock {
  background: #F0F9FF;
  color: #67C23A;
}

.add-cart-btn {
  width: 100%;
}

.el-pagination {
  margin-top: 30px;
  text-align: center;
}
</style>