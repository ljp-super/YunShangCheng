import router from '@/router/index'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'
import usePermissionStore from '@/stores/permission'

const whiteList = ['/login']

router.beforeEach((to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  if (userStore.userInfo.token) {
    if (to.path === '/login') {
      const isUser = userStore.userInfo.username === 'user'
      next({ path: isUser ? '/user/home' : '/home' })
      NProgress.done()
    } else {
      if (permissionStore.addRouters.length === 0) {
        if (userStore.userInfo.menus && userStore.userInfo.menus.length > 0) {
          permissionStore.generateRoutes({
            menus: userStore.userInfo.menus,
            username: userStore.userInfo.username,
            roles: userStore.userInfo.roles,
          })
          permissionStore.addRouters.forEach(route => {
            router.addRoute(route)
          })
          const isUser = userStore.userInfo.username === 'user'
          if (to.path === '/' && isUser) {
            next({ path: '/user/home', replace: true })
          } else {
            next({ ...to, replace: true })
          }
        } else {
          userStore.getUserInfo().then(() => {
            permissionStore.generateRoutes({
              menus: userStore.userInfo.menus,
              username: userStore.userInfo.username,
              roles: userStore.userInfo.roles,
            })
            permissionStore.addRouters.forEach(route => {
              router.addRoute(route)
            })
            const isUser = userStore.userInfo.username === 'user'
            if (to.path === '/' && isUser) {
              next({ path: '/user/home', replace: true })
            } else {
              next({ ...to, replace: true })
            }
          }).catch(() => {
            userStore.fedLogout()
            next('/login')
            NProgress.done()
          })
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
