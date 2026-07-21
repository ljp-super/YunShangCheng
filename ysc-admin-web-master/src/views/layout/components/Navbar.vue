<script lang="ts" setup>
import { computed } from 'vue'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ArrowDown } from '@element-plus/icons-vue'

// 定义组件名称
defineOptions({
  name: 'Navbar'
})

const appStore = useAppStore()
const userStore = useUserStore()

const sidebar = computed(() => appStore.sidebar)
const avatar = computed(() => userStore.userInfo.avatar)

// 处理开关侧边栏操作
const handleToggleSideBar = () => {
  appStore.toggleSideBar()
}

// 处理用户登出
const handleLogout = async () => {
  await userStore.userLogout()
  // 为了重新实例化vue-router对象 避免bug
  location.reload()
}
</script>

<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggle-click="handleToggleSideBar" :is-active="sidebar.opened"></hamburger>
    <breadcrumb></breadcrumb>
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <img class="user-avatar" :src="avatar">
        <el-icon class="el-icon-caret-bottom">
          <arrow-down />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="user-dropdown">
          <router-link class="inlineBlock" to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span @click="handleLogout" style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
</template>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  line-height: 60px;
  border-radius: 0 !important;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 0 24px;

  .hamburger-container {
    line-height: 60px;
    height: 60px;
    float: left;
    padding: 0 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }

  .avatar-container {
    height: 60px;
    display: inline-flex;
    align-items: center;
    position: absolute;
    right: 24px;
    padding: 0 12px;
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .avatar-wrapper {
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #f0f0f0;
        transition: border-color 0.2s ease;

        &:hover {
          border-color: #409EFF;
        }
      }

      .el-icon-caret-bottom {
        font-size: 14px;
        color: #909399;
        transition: color 0.2s ease;

        &:hover {
          color: #409EFF;
        }
      }
    }
  }
}

.user-dropdown {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);

  :deep(.el-dropdown-menu__item) {
    padding: 10px 16px;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background: #ECF5FF;
      color: #409EFF;
    }
  }
}
</style>
