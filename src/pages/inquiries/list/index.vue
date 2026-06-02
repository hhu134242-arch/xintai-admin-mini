<template>
  <view class="page">
    <!-- Status Tabs -->
    <view class="tabs-wrapper">
      <view class="tabs-inner">
        <view
          v-for="tab in statusTabs"
          :key="tab.value"
          class="tab-pill"
          :class="{ active: currentStatus === tab.value }"
          @tap="switchStatus(tab.value)"
        >
          <text class="tab-label">{{ tab.label }}</text>
          <view v-if="tab.value === 'new' && pendingCount > 0" class="tab-badge">{{ pendingCount }}</view>
        </view>
      </view>
    </view>

    <!-- Inquiry List -->
    <scroll-view
      scroll-y
      class="inquiry-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- Inquiry Card -->
      <view
        v-for="item in inquiries"
        :key="item.id"
        class="inquiry-card"
        @tap="goDetail(item)"
      >
        <!-- Card Header -->
        <view class="card-header">
          <view class="avatar-circle">
            <text class="avatar-letter">{{ item.name?.charAt(0) || '?' }}</text>
          </view>
          <view class="header-info">
            <view class="name-row">
              <text class="customer-name">{{ item.name }}</text>
              <view v-if="item.status === 'new'" class="unread-dot" />
            </view>
            <text class="company-name">{{ item.company || '—' }}</text>
          </view>
          <text class="time-text">{{ formatTime(item.created_at) }}</text>
        </view>

        <!-- Card Body -->
        <view class="card-body">
          <view v-if="item.items?.length" class="product-thumbs">
            <image
              v-for="(it, i) in item.items.slice(0, 3)"
              :key="i"
              :src="it.product_image"
              class="thumb-img"
              mode="aspectFill"
            />
            <view v-if="item.items.length > 3" class="thumb-more">
              <text class="thumb-more-text">+{{ item.items.length - 3 }}</text>
            </view>
          </view>
          <text class="message-preview">{{ item.message || '无消息内容' }}</text>
        </view>

        <!-- Card Footer -->
        <view class="card-footer">
          <text class="qty-text">数量: {{ item.quantity || '—' }}</text>
          <view class="status-tag" :class="item.status">
            <text class="status-tag-text">{{ statusLabel(item.status) }}</text>
          </view>
        </view>
      </view>

      <!-- States -->
      <view v-if="loading && page > 1" class="state-text">
        <view class="state-spinner" />
        <text class="state-label">加载中...</text>
      </view>
      <view v-if="!loading && inquiries.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无询盘</text>
      </view>
      <view v-if="!loading && noMore && inquiries.length > 0" class="state-text">
        <text class="state-label">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchInquiries } from '@/api/inquiries'
import type { Inquiry } from '@/types/inquiry'

const statusTabs = [
  { label: '全部', value: '' },
  { label: '待处理', value: 'new' },
  { label: '已读', value: 'read' },
  { label: '已回复', value: 'replied' },
  { label: '已归档', value: 'archived' },
]

const inquiries = ref<Inquiry[]>([])
const currentStatus = ref('')
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

const pendingCount = computed(() =>
  (inquiries.value || []).filter((i) => i.status === 'new').length,
)

function statusLabel(s: string) {
  const map: Record<string, string> = { new: '待处理', read: '已读', replied: '已回复', archived: '已归档' }
  return map[s] || s
}

function formatTime(t: string) {
  if (!t) return ''
  const d = new Date(t)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

async function loadInquiries(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    noMore.value = false
  }
  loading.value = true
  try {
    const res = await fetchInquiries({
      page: page.value,
      pageSize,
      status: currentStatus.value || undefined,
    })
    if (reset) {
      inquiries.value = res.data
    } else {
      inquiries.value.push(...res.data)
    }
    if (res.data.length < pageSize) noMore.value = true
  } catch (err: any) {
    uni.showToast({ title: err.message || '加载失败', icon: 'error' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function switchStatus(val: string) {
  currentStatus.value = val
  loadInquiries(true)
}

function onRefresh() {
  refreshing.value = true
  loadInquiries(true)
}

function onLoadMore() {
  if (!noMore.value && !loading.value) {
    page.value++
    loadInquiries()
  }
}

function goDetail(item: Inquiry) {
  uni.navigateTo({ url: `/pages/inquiries/detail/index?id=${item.id}` })
}

onMounted(() => loadInquiries(true))
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Tabs */
.tabs-wrapper {
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}
.tabs-inner {
  display: flex;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  overflow-x: auto;
  white-space: nowrap;
}
.tab-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 12rpx 28rpx;
  background: #f5f5f5;
  border-radius: 999rpx;
  flex-shrink: 0;
}
.tab-pill.active {
  background: #1677ff;
}
.tab-label {
  font-size: 26rpx;
  color: rgba(0,0,0,0.65);
}
.tab-pill.active .tab-label {
  color: #fff;
  font-weight: 500;
}
.tab-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  line-height: 32rpx;
}

/* Inquiry List */
.inquiry-list {
  height: calc(100vh - 96rpx);
  padding: 24rpx;
}

/* Inquiry Card */
.inquiry-card {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  padding: 28rpx;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: flex-start;
}
.avatar-circle {
  width: 72rpx;
  height: 72rpx;
  background: #1677ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
}
.avatar-letter {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}
.header-info {
  flex: 1;
  overflow: hidden;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.customer-name {
  font-size: 28rpx;
  font-weight: 500;
  color: rgba(0,0,0,0.88);
}
.unread-dot {
  width: 14rpx;
  height: 14rpx;
  background: #ff4d4f;
  border-radius: 50%;
  flex-shrink: 0;
}
.company-name {
  display: block;
  font-size: 22rpx;
  color: rgba(0,0,0,0.45);
  margin-top: 4rpx;
}
.time-text {
  font-size: 22rpx;
  color: rgba(0,0,0,0.45);
  flex-shrink: 0;
  margin-left: 12rpx;
}

/* Card Body */
.card-body {
  margin-top: 20rpx;
}
.product-thumbs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.thumb-img {
  width: 88rpx;
  height: 88rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}
.thumb-more {
  width: 88rpx;
  height: 88rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-more-text {
  font-size: 22rpx;
  color: rgba(0,0,0,0.45);
}
.message-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 26rpx;
  color: rgba(0,0,0,0.65);
  line-height: 1.6;
}

/* Card Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}
.qty-text {
  font-size: 22rpx;
  color: rgba(0,0,0,0.45);
}
.status-tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}
.status-tag.new {
  background: rgba(250,173,20,0.1);
}
.status-tag.new .status-tag-text {
  color: #faad14;
}
.status-tag.read {
  background: rgba(22,119,255,0.1);
}
.status-tag.read .status-tag-text {
  color: #1677ff;
}
.status-tag.replied {
  background: rgba(82,196,26,0.1);
}
.status-tag.replied .status-tag-text {
  color: #52c41a;
}
.status-tag.archived {
  background: #f5f5f5;
}
.status-tag.archived .status-tag-text {
  color: rgba(0,0,0,0.45);
}
.status-tag-text {
  font-size: 22rpx;
}

/* Empty & States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}
.empty-text {
  font-size: 28rpx;
  color: rgba(0,0,0,0.45);
}
.state-text {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  gap: 12rpx;
}
.state-label {
  font-size: 24rpx;
  color: rgba(0,0,0,0.45);
}
.state-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid #d9d9d9;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
