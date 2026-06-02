<template>
  <view class="login-page">
    <!-- Dark gradient background -->
    <view class="bg-layer">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <!-- Logo and branding area -->
    <view class="brand-area">
      <view class="logo-wrapper">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
      </view>
      <text class="app-title">XinTai Admin</text>
      <text class="app-subtitle">服装外贸管理系统</text>
    </view>

    <!-- White card -->
    <view class="card">
      <view class="card-inner">
        <text class="card-title">欢迎登录</text>
        <text class="card-desc">请使用微信授权登录管理后台</text>

        <button class="login-btn" :loading="loading" @tap="handleLogin">
          <view v-if="!loading" class="btn-icon">
            <text class="wechat-icon">💬</text>
          </view>
          <text class="btn-text">{{ loading ? '登录中...' : '微信一键登录' }}</text>
        </button>

        <text class="tip">仅授权管理员可登录</text>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="footer-text">XinTai Admin · 服装外贸管理系统</text>
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
  background: linear-gradient(180deg, #0a1628 0%, #162040 60%, #1a2a52 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  position: relative;
  overflow: hidden;
}

/* Decorative background circles */
.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
}

.bg-circle-1 {
  width: 600rpx;
  height: 600rpx;
  background: #1677ff;
  top: -180rpx;
  right: -120rpx;
}

.bg-circle-2 {
  width: 400rpx;
  height: 400rpx;
  background: #1677ff;
  bottom: 80rpx;
  left: -160rpx;
}

/* Brand area */
.brand-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
  z-index: 1;
}

.logo-wrapper {
  width: 140rpx;
  height: 140rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  backdrop-filter: blur(10px);
  border: 2rpx solid rgba(255, 255, 255, 0.08);
}

.logo {
  width: 80rpx;
  height: 80rpx;
}

.app-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2rpx;
  margin-bottom: 12rpx;
}

.app-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4rpx;
}

/* White card */
.card {
  width: 100%;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.card-inner {
  padding: 56rpx 48rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 12rpx;
}

.card-desc {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 56rpx;
}

/* Login button */
.login-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  border-radius: 16rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.35);
  transition: opacity 0.2s;
}

.login-btn::after {
  border: none;
}

.login-btn:active {
  opacity: 0.85;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
}

.tip {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: rgba(0, 0, 0, 0.35);
  margin-top: 32rpx;
}

/* Footer */
.footer {
  position: absolute;
  bottom: 60rpx;
  z-index: 1;
}

.footer-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 1rpx;
}
</style>
