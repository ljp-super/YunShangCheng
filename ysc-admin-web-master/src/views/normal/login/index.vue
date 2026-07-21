<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { isvalidUsername } from '@/utils/validate'
import { type FormInstance, type FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules = reactive<FormRules<typeof loginForm>>({
  username: [{ required: true, trigger: 'blur', validator: validateUsername }],
  password: [{ required: true, trigger: 'blur', validator: validatePass }]
})

const loading = ref(false)
const dialogVisible = ref(false)

function validateUsername(rule: unknown, value: string, callback: (error?: Error) => void) {
  if (!isvalidUsername(value)) {
    callback(new Error('请输入正确的用户名'))
  } else {
    callback()
  }
}

function validatePass(rule: unknown, value: string, callback: (error?: Error) => void) {
  if (value.length < 3) {
    callback(new Error('密码不能小于3位'))
  } else {
    callback()
  }
}

onMounted(() => {
  loginForm.username = userStore.userInfo.username
  loginForm.password = userStore.userInfo.password
  if (!loginForm.username) {
    loginForm.username = 'admin'
    loginForm.password = 'admin'
  }
})

const handleLogin = () => {
  loginFormRef.value!.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.userLogin({
          username: loginForm.username.trim(),
          password: loginForm.password
        })
        loading.value = false
        const isUser = userStore.userInfo.username === 'user'
        router.push({ path: isUser ? '/user/home' : '/home' })
      } catch (err) {
        loading.value = false
        console.log(err)
      }
    } else {
      console.log('参数验证不合法！')
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="bg-gradient"></div>
      <div class="bg-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
        <div class="circle circle-5"></div>
      </div>
    </div>

    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <h1 class="system-title">云商城平台系统</h1>
          <p class="system-subtitle">一站式电商管理平台</p>
        </div>

        <el-form autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginFormRef" label-position="left" class="login-form">
          <el-form-item prop="username">
            <el-input name="username" type="text" v-model="loginForm.username" autoComplete="on" placeholder="请输入用户名" class="login-input">
              <template #prefix>
                <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input name="password" @keyup.enter="handleLogin" v-model="loginForm.password" autoComplete="on" show-password placeholder="请输入密码" class="login-input">
              <template #prefix>
                <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item class="login-btn-group">
            <el-button type="primary" :loading="loading" @click="handleLogin" class="login-btn">登录</el-button>
          </el-form-item>

          <div class="login-tips">
            <span>默认账号：admin / admin</span>
            <span>用户账号：user / user</span>
          </div>
        </el-form>

        <div class="login-footer">
          <span>© 2026 云商城平台系统</span>
        </div>
      </div>
    </div>

    
  </div>
</template>

<style scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: #409EFF;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: #67C23A;
  top: 50%;
  right: -150px;
  animation-delay: 5s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: #9B59B6;
  bottom: -50px;
  left: 20%;
  animation-delay: 10s;
}

.circle-4 {
  width: 200px;
  height: 200px;
  background: #E6A23C;
  top: 30%;
  left: 60%;
  animation-delay: 15s;
}

.circle-5 {
  width: 150px;
  height: 150px;
  background: #F56C6C;
  bottom: 20%;
  right: 30%;
  animation-delay: 7s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, 50px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
}

.login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  margin-bottom: 20px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  background: linear-gradient(135deg, #409EFF 0%, #66B1FF 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.system-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.system-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-input {
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.login-input:focus {
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
  border-color: #409EFF;
}

.input-icon {
  width: 18px;
  height: 18px;
  color: #C0C4CC;
}

.login-btn-group {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #409EFF 0%, #66B1FF 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-tips {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 12px;
  color: #C0C4CC;
}

.login-tips span {
  background: #F5F7FA;
  padding: 6px 12px;
  border-radius: 20px;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
  font-size: 12px;
  color: #C0C4CC;
}

@media screen and (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 32px 24px;
  }
  .system-title {
    font-size: 24px;
  }
}
</style>