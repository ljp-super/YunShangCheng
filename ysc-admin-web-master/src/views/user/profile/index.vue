<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { updateAdminPasswordAPI, adminUpdateInfoAPI } from '@/apis/admin'

const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

const userInfo = ref(userStore.userInfo)

const editForm = ref({
  username: userInfo.value.username,
  phone: '',
  email: '',
  avatar: userInfo.value.avatar
})

const showChangePasswordDialog = ref(false)
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' }]
}

const passwordFormRef = ref()

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  try {
    await updateAdminPasswordAPI({
      username: userInfo.value.username,
      newPassword: passwordForm.value.newPassword
    })
    showChangePasswordDialog.value = false
    passwordForm.value = { newPassword: '', confirmPassword: '' }
    ElMessage.success('密码修改成功')
  } catch (error) {
    ElMessage.error('修改密码失败')
  }
}

const showEditProfileDialog = ref(false)
const editProfileForm = ref({
  nickName: '',
  email: ''
})

const openEditProfileDialog = () => {
  editProfileForm.value = {
    nickName: userStore.userInfo.nickName || '',
    email: userStore.userInfo.email || ''
  }
  showEditProfileDialog.value = true
}

const editProfileRules = {
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ type: 'email' as const, message: '请输入正确的邮箱', trigger: 'blur' }]
}

const editProfileFormRef = ref()

const handleSaveProfile = async () => {
  try {
    await adminUpdateInfoAPI({
      email: editProfileForm.value.email || undefined,
      nickName: editProfileForm.value.nickName || undefined
    })
    userStore.userInfo.email = editProfileForm.value.email
    userStore.userInfo.nickName = editProfileForm.value.nickName
    showEditProfileDialog.value = false
    editForm.value.email = editProfileForm.value.email
    editForm.value.phone = editProfileForm.value.nickName
    ElMessage.success('信息修改成功')
  } catch (error) {
    ElMessage.error('信息修改失败')
  }
}

const handleGoToCart = () => {
  router.push('/user/cart')
}

const handleGoToOrders = () => {
  router.push('/user/order')
}
</script>

<template>
  <div class="app-container">
    <el-card>
      <div class="profile-header">
        <div class="avatar-section">
          <el-avatar :size="120" :src="editForm.avatar">
            {{ editForm.username?.charAt(0) }}
          </el-avatar>
          <div class="avatar-upload">
            <el-button size="small">更换头像</el-button>
          </div>
        </div>
        <div class="user-info">
          <h2>{{ editForm.username }}</h2>
          <p class="user-role">普通用户</p>
        </div>
      </div>

      <div class="quick-links">
        <el-card class="quick-link-card" @click="handleGoToCart">
          <div class="link-icon">🛒</div>
          <div class="link-info">
            <h3>购物车</h3>
            <p>{{ cartStore.totalCount }} 件商品</p>
          </div>
          <div class="link-arrow">→</div>
        </el-card>
        <el-card class="quick-link-card" @click="handleGoToOrders">
          <div class="link-icon">📋</div>
          <div class="link-info">
            <h3>我的订单</h3>
            <p>查看订单状态</p>
          </div>
          <div class="link-arrow">→</div>
        </el-card>
        <el-card class="quick-link-card" @click="openEditProfileDialog">
          <div class="link-icon">📝</div>
          <div class="link-info">
            <h3>修改信息</h3>
            <p>编辑个人资料</p>
          </div>
          <div class="link-arrow">→</div>
        </el-card>
        <el-card class="quick-link-card" @click="showChangePasswordDialog = true">
          <div class="link-icon">🔑</div>
          <div class="link-info">
            <h3>修改密码</h3>
            <p>安全设置</p>
          </div>
          <div class="link-arrow">→</div>
        </el-card>
      </div>
    </el-card>

    <el-dialog title="修改密码" v-model="showChangePasswordDialog" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="修改信息" v-model="showEditProfileDialog" width="400px">
      <el-form :model="editProfileForm" :rules="editProfileRules" ref="editProfileFormRef">
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="editProfileForm.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editProfileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditProfileDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProfile">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.avatar-section {
  position: relative;
}

.avatar-upload {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.user-info h2 {
  margin: 0;
  font-size: 24px;
}

.user-role {
  margin: 10px 0 0 0;
  color: #909399;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.quick-link-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.quick-link-card:hover {
  transform: translateX(5px);
}

.quick-link-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
}

.link-icon {
  font-size: 24px;
}

.link-info {
  flex: 1;
}

.link-info h3 {
  margin: 0;
  font-size: 15px;
}

.link-info p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #909399;
}

.link-arrow {
  color: #909399;
  font-size: 18px;
}
</style>