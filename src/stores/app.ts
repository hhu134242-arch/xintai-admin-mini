import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const systemInfo = ref<UniApp.GetSystemInfoResult | null>(null)
  const statusBarHeight = ref(0)
  const navigationBarHeight = ref(44)
  const tabBarHeight = ref(50)
  const isLoading = ref(false)
  const currentPage = ref('')
  const networkType = ref<string>('unknown')
  const isConnected = ref(true)

  // Getters
  const safeAreaBottom = computed(() => {
    if (!systemInfo.value?.safeAreaInsets) return 0
    return systemInfo.value.safeAreaInsets.bottom || 0
  })

  const windowWidth = computed(() => systemInfo.value?.windowWidth || 375)
  const windowHeight = computed(() => systemInfo.value?.windowHeight || 667)

  /**
   * Initialize app-level state
   */
  function init(): void {
    // Get system info
    const info = uni.getSystemInfoSync()
    systemInfo.value = info
    statusBarHeight.value = info.statusBarHeight || 0

    // Get navigation bar height (for custom nav bar on WeChat)
    // #ifdef MP-WEIXIN
    const menuButton = uni.getMenuButtonBoundingClientRect()
    navigationBarHeight.value =
      (menuButton.top - (info.statusBarHeight || 0)) * 2 + menuButton.height
    // #endif

    // Monitor network status
    uni.getNetworkType({
      success: (res) => {
        networkType.value = res.networkType
        isConnected.value = res.networkType !== 'none'
      },
    })

    uni.onNetworkStatusChange((res) => {
      networkType.value = res.isConnected ? res.networkType : 'none'
      isConnected.value = res.isConnected
    })
  }

  /**
   * Set loading state
   */
  function setLoading(val: boolean): void {
    isLoading.value = val
  }

  /**
   * Set current page path
   */
  function setCurrentPage(path: string): void {
    currentPage.value = path
  }

  /**
   * Show loading toast
   */
  function showLoading(title = 'Loading...'): void {
    isLoading.value = true
    uni.showLoading({ title, mask: true })
  }

  /**
   * Hide loading toast
   */
  function hideLoading(): void {
    isLoading.value = false
    uni.hideLoading()
  }

  /**
   * Show a toast message
   */
  function showToast(title: string, icon: 'success' | 'error' | 'none' = 'none'): void {
    uni.showToast({ title, icon, duration: 2000 })
  }

  return {
    systemInfo,
    statusBarHeight,
    navigationBarHeight,
    tabBarHeight,
    isLoading,
    currentPage,
    networkType,
    isConnected,
    safeAreaBottom,
    windowWidth,
    windowHeight,
    init,
    setLoading,
    setCurrentPage,
    showLoading,
    hideLoading,
    showToast,
  }
})
