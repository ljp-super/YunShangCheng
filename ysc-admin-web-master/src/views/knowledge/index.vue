<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Plus, Search, Upload, Document, MagicStick } from '@element-plus/icons-vue'
import { useKnowledgeStore, type KnowledgeItem } from '@/stores/knowledge'
import { dashscopeApi } from '@/apis/dashscope'

const knowledgeStore = useKnowledgeStore()

const searchKeyword = ref('')
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showUploadDialog = ref(false)
const selectedItem = ref<KnowledgeItem | null>(null)
const isAnalyzing = ref(false)

const addForm = ref({
  title: '',
  content: '',
  category: ''
})

const editForm = ref({
  title: '',
  content: '',
  category: ''
})

const uploadForm = ref({
  category: '',
  fileContent: '',
  fileName: ''
})

const categories = computed(() => knowledgeStore.categories)

const filteredItems = computed(() => {
  if (!searchKeyword.value) {
    return knowledgeStore.items
  }
  const keyword = searchKeyword.value.toLowerCase()
  return knowledgeStore.items.filter(item =>
    item.title.toLowerCase().includes(keyword) ||
    item.content.toLowerCase().includes(keyword) ||
    item.category.toLowerCase().includes(keyword)
  )
})

const handleAdd = () => {
  addForm.value = { title: '', content: '', category: '' }
  showAddDialog.value = true
}

const handleEdit = (item: KnowledgeItem) => {
  selectedItem.value = item
  editForm.value = {
    title: item.title,
    content: item.content,
    category: item.category
  }
  showEditDialog.value = true
}

const handleDelete = (id: number) => {
  knowledgeStore.deleteItem(id)
  ElMessage.success('删除成功')
}

const submitAdd = () => {
  if (!addForm.value.title || !addForm.value.content) {
    ElMessage.error('请填写标题和内容')
    return
  }
  knowledgeStore.addItem(addForm.value)
  showAddDialog.value = false
  ElMessage.success('添加成功')
}

const submitEdit = () => {
  if (!editForm.value.title || !editForm.value.content) {
    ElMessage.error('请填写标题和内容')
    return
  }
  if (selectedItem.value) {
    knowledgeStore.updateItem(selectedItem.value.id, editForm.value)
    showEditDialog.value = false
    ElMessage.success('修改成功')
  }
}

const handleUpload = () => {
  uploadForm.value = { category: '', fileContent: '', fileName: '' }
  showUploadDialog.value = true
}

const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|doc|docx)$/i)) {
    ElMessage.error('只支持上传 TXT、PDF、DOC、DOCX 格式的文档')
    return
  }

  uploadForm.value.fileName = file.name

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    uploadForm.value.fileContent = content
    ElMessage.success('文件读取成功，点击"智能解析"开始分析')
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败，请重试')
  }

  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    reader.readAsText(file, 'utf-8')
  } else {
    reader.readAsText(file, 'utf-8')
  }
}

const handleAnalyze = async () => {
  if (!uploadForm.value.fileContent) {
    ElMessage.error('请先上传文件')
    return
  }
  if (!uploadForm.value.category) {
    ElMessage.error('请选择分类')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: 'AI正在解析文档，请稍候...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const result = await dashscopeApi.analyzeDocument(uploadForm.value.fileContent)
    const lines = result.split('\n').filter(line => line.trim())
    
    let currentTitle = ''
    let currentContent = ''
    
    for (const line of lines) {
      if (line.match(/^#+\s/)) {
        if (currentTitle && currentContent) {
          knowledgeStore.addItem({
            title: currentTitle,
            content: currentContent.trim(),
            category: uploadForm.value.category
          })
        }
        currentTitle = line.replace(/^#+\s*/, '').trim()
        currentContent = ''
      } else if (currentTitle) {
        currentContent += line + '\n'
      }
    }
    
    if (currentTitle && currentContent) {
      knowledgeStore.addItem({
        title: currentTitle,
        content: currentContent.trim(),
        category: uploadForm.value.category
      })
    }

    showUploadDialog.value = false
    ElMessage.success('文档解析成功，已添加到知识库')
  } catch (error) {
    console.error('Document analysis failed:', error)
    ElMessage.error('文档解析失败，请稍后重试')
  } finally {
    loading.close()
  }
}

onMounted(() => {
  knowledgeStore.loadFromStorage()
})
</script>

<template>
  <div class="app-container">
    <div class="page-header">
      <h2>知识库管理</h2>
      <div class="header-actions">
        <el-button @click="handleUpload" class="upload-btn">
          <el-icon><Upload /></el-icon>
          上传文档
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加知识
        </el-button>
      </div>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索标题、内容或分类"
        clearable
        style="width: 300px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-table :data="filteredItems" border>
      <el-table-column prop="title" label="标题" min-width="150" />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="添加知识" v-model="showAddDialog" width="600px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="addForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="addForm.category" placeholder="请选择分类">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="addForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入知识内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="编辑知识" v-model="showEditDialog" width="600px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editForm.category" placeholder="请选择分类">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入知识内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="上传文档并解析" v-model="showUploadDialog" width="600px">
      <div class="upload-container">
        <div class="upload-area" @click="triggerFileInput">
          <div class="upload-icon">
            <el-icon :size="48"><Document /></el-icon>
          </div>
          <p class="upload-text">点击或拖拽上传文档</p>
          <p class="upload-hint">支持 TXT、PDF、DOC、DOCX 格式</p>
          <input type="file" ref="fileInputRef" class="file-input" @change="handleFileChange" accept=".txt,.pdf,.doc,.docx" />
        </div>
        
        <div v-if="uploadForm.fileName" class="file-info">
          <el-icon><Document /></el-icon>
          <span>{{ uploadForm.fileName }}</span>
        </div>

        <el-form :model="uploadForm" label-width="80px" style="margin-top: 20px;">
          <el-form-item label="分类">
            <el-select v-model="uploadForm.category" placeholder="请选择分类">
              <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-form>

        <div v-if="uploadForm.fileContent" class="preview-section">
          <h4>文档内容预览</h4>
          <div class="content-preview">
            {{ uploadForm.fileContent.substring(0, 500) }}{{ uploadForm.fileContent.length > 500 ? '...' : '' }}
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" :loading="isAnalyzing" @click="handleAnalyze" class="analyze-btn">
          <el-icon><MagicStick /></el-icon>
          智能解析
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  margin-bottom: 20px;
}

.upload-btn {
  border: 1px dashed #409EFF;
  color: #409EFF;
  background: #ecf5ff;
}

.upload-btn:hover {
  background: #dbeafe;
}

.upload-container {
  padding: 10px;
}

.upload-area {
  border: 2px dashed #DCDFE6;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #409EFF;
  background: #f5f7fa;
}

.upload-icon {
  margin-bottom: 16px;
  color: #409EFF;
}

.upload-text {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #606266;
}

.upload-hint {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.file-input {
  display: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #f0f9eb;
  border-radius: 4px;
  margin-top: 16px;
  color: #67c23a;
  font-size: 14px;
}

.preview-section {
  margin-top: 20px;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
}

.content-preview {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.analyze-btn {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: none;
}

.analyze-btn:hover {
  background: linear-gradient(135deg, #85ce61 0%, #a8e063 100%);
}
</style>
