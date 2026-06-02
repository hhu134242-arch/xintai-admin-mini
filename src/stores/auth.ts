import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { config } from '@/config'

const { storageKeys } = config

/** User info stored after login */
interface UserInfo {
  id: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>(uni.getStorageSync(storageKeys.authToken) || '')
  const userInfo = ref<UserInfo | null>(
    uni.getStorageSync(storageKeys.userInfo) || null
  )
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')

  /**
   * Login with service key.
   * For the admin panel, the service key is used directly.
   */
  async function login(serviceKey?: string): Promise<boolean> {
    loading.value = true
    try {
      const key = serviceKey || config.supabaseServiceKey

      // Store the token
      token.value = key
      uni.setStorageSync(storageKeys.authToken, key)

      // Set a default admin user since we're using service key
      const user: UserInfo = {
        id: 'admin',
        email: 'admin@xintai.fun',
        role: 'admin',
      }
      userInfo.value = user
      uni.setStorageSync(storageKeys.userInfo, user)

      return true
    } catch (err) {
      console.error('[Auth] Login failed:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout - clear all stored auth data
   */
  function logout(): void {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync(storageKeys.authToken)
    uni.removeStorageSync(storageKeys.userInfo)
    uni.removeStorageSync(storageKeys.refreshToken)

    // Redirect to login page
    uni.reLaunch({ url: '/pages/login/login' })
  }

  /**
   * Check if the current token is valid
   */
  function checkAuth(): boolean {
    const stored = uni.getStorageSync(storageKeys.authToken)
    if (stored) {
      token.value = stored
      userInfo.value = uni.getStorageSync(storageKeys.userInfo)
      return true
    }
    return false
  }

  return {
    token,
    userInfo,
    loading,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    checkAuth,
  }
})
