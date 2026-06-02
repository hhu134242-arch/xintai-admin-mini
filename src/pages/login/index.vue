<template>
  <view class="login-page">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">XinTai Admin</text>
      <text class="subtitle">服装外贸管理后台</text>
    </view>
    <view class="login-body">
      <button class="login-btn" :loading="loading" @tap="handleLogin">
        微信一键登录
      </button>
      <text class="tip">仅授权管理员可登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    // 微信登录获取 code
    const loginRes = await new Promise<WechatMiniprogram.LoginRes>((resolve, reject) => {
      uni.login({
        success: resolve,
        fail: reject,
      })
    })

    // 使用 service key 直接登录（方案 A）
    const success = await authStore.login()
    if (success) {
      uni.switchTab({ url: '/pages/index/index' })
    } else {
      uni.showToast({ title: '登录失败', icon: 'error' })
    }
  } catch (err) {
    uni.showToast({ title: '登录失败', icon: 'error' })
  } finally {
    loading.value = false
  }
}

// 检查是否已登录
if (authStore.isLoggedIn) {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
}
.login-header {
  text-align: center;
  margin-bottom: 120rpx;
}
.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}
.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}
.subtitle {
  display: block;
  font-size: 26rpx;
  color: #999;
}
.login-body {
  width: 100%;
}
.login-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: #b8860b;
  color: #fff;
  font-size: 30rpx;
  border: none;
  border-radius: 8rpx;
  font-weight: 500;
}
.login-btn::after {
  border: none;
}
.tip {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #666;
  margin-top: 30rpx;
}
</style>
