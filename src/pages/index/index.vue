<template>
  <view class="dashboard">
    <!-- Status bar spacer -->
    <view :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- Header with gradient -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-left">
          <text class="header-greeting">{{ greeting }}，管理员</text>
          <text class="header-title">管理后台</text>
        </view>
        <view class="header-right">
          <view class="avatar">
            <text class="avatar-text">A</text>
          </view>
        </view>
      </view>
      <view class="header-date-bar">
        <text class="header-date">📅 {{ currentDate }}</text>
      </view>
    </view>

    <!-- Stats cards -->
    <view class="section">
      <view class="section-title">
        <text class="section-title-text">数据概览</text>
      </view>
      <view class="stats-grid">
        <view class="stat-card">
          <view class="stat-icon stat-icon-blue">
            <text class="stat-icon-text">📦</text>
          </view>
          <text class="stat-number">{{ stats.products }}</text>
          <text class="stat-label">产品总数</text>
        </view>
        <view class="stat-card">
          <view class="stat-icon stat-icon-orange">
            <text class="stat-icon-text">📋</text>
          </view>
          <text class="stat-number">{{ stats.inquiries }}</text>
          <text class="stat-label">待处理询盘</text>
        </view>
        <view class="stat-card">
          <view class="stat-icon stat-icon-green">
            <text class="stat-icon-text">📈</text>
          </view>
          <text class="stat-number">{{ stats.newThisMonth }}</text>
          <text class="stat-label">本月新增</text>
        </view>
        <view class="stat-card">
          <view class="stat-icon stat-icon-purple">
            <text class="stat-icon-text">👥</text>
          </view>
          <text class="stat-number">{{ stats.totalCustomers }}</text>
          <text class="stat-label">总客户数</text>
        </view>
      </view>
    </view>

    <!-- Quick actions -->
    <view class="section">
      <view class="section-title">
        <text class="section-title-text">快捷操作</text>
      </view>
      <view class="actions-row">
        <view class="action-btn action-btn-primary" @tap="goTo('/pages/products/index')">
          <text class="action-icon">➕</text>
          <text class="action-text">添加产品</text>
        </view>
        <view class="action-btn action-btn-outline" @tap="goTo('/pages/inquiries/index')">
          <text class="action-icon">💬</text>
          <text class="action-text">查看询盘</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onMounted } from 'vue'

const statusBarHeight = ref(0)

onMounted(() => {
  uni.getSystemInfo({
    success: (info) => {
      statusBarHeight.value = info.statusBarHeight || 20
    }
  })
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${year}年${month}月${day}日 ${weekDays[now.getDay()]}`
})

const stats = ref({
  products: 0,
  inquiries: 0,
  newThisMonth: 0,
  totalCustomers: 0
})

function goTo(url: string) {
  uni.navigateTo({ url })
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header */
.header {
  position: relative;
  padding: 0 0 32rpx 0;
  margin-bottom: 0;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32rpx 32rpx 20rpx;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-greeting {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.header-right {
  display: flex;
  align-items: center;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
}

.header-date-bar {
  position: relative;
  z-index: 1;
  padding: 0 32rpx;
  margin-top: 8rpx;
}

.header-date {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

/* Sections */
.section {
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.section:first-of-type {
  margin-top: -8rpx;
}

.section-title {
  padding: 28rpx 8rpx 20rpx;
}

.section-title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

/* Stats grid */
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.stat-card {
  width: calc(50% - 10rpx);
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.stat-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.stat-icon-blue {
  background: rgba(22, 119, 255, 0.08);
}

.stat-icon-orange {
  background: rgba(250, 173, 20, 0.08);
}

.stat-icon-green {
  background: rgba(82, 196, 26, 0.08);
}

.stat-icon-purple {
  background: rgba(114, 46, 209, 0.08);
}

.stat-icon-text {
  font-size: 36rpx;
}

.stat-number {
  font-size: 44rpx;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 6rpx;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.45);
}

/* Quick actions */
.actions-row {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: opacity 0.2s;
}

.action-btn:active {
  opacity: 0.85;
}

.action-btn-primary {
  background: #1677ff;
  box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.25);
}

.action-btn-outline {
  background: #ffffff;
  border: 2rpx solid #1677ff;
}

.action-icon {
  font-size: 32rpx;
}

.action-text {
  font-size: 28rpx;
  font-weight: 500;
}

.action-btn-primary .action-text {
  color: #ffffff;
}

.action-btn-outline .action-text {
  color: #1677ff;
}
</style>
