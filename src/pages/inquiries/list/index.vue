<template>
  <view class="page">
    <!-- 状态 Tab -->
    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentStatus === tab.value }"
        @tap="switchStatus(tab.value)"
      >
        {{ tab.label }}
        <view v-if="tab.value === 'pending' && pendingCount > 0" class="badge">{{ pendingCount }}</view>
      </view>
    </view>

    <!-- 询盘列表 -->
    <scroll-view
      scroll-y
      class="inquiry-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view
        v-for="item in inquiries"
        :key="item.id"
        class="inquiry-card"
        @tap="goDetail(item)"
      >
        <view class="card-header">
          <view class="avatar">{{ item.name?.charAt(0) || '?' }}</view>
          <view class="header-info">
            <text class="name">{{ item.name }}</text>
            <text class="company">{{ item.company || '—' }}</text>
          </view>
          <view class="header-right">
            <view v-if="item.status === 'new'" class="unread-dot" />
            <text class="time">{{ formatTime(item.created_at) }}</text>
          </view>
        </view>
        <view class="card-body">
          <view v-if="item.items?.length" class="items-row">
            <image
              v-for="(it, i) in item.items.slice(0, 3)"
              :key="i"
              :src="it.product_image"
              class="item-thumb"
              mode="aspectFill"
            />
            <text v-if="item.items.length > 3" class="more-count">+{{ item.items.length - 3 }}</text>
          </view>
          <text class="message-preview">{{ item.message || '无消息内容' }}</text>
        </view>
        <view class="card-footer">
          <text class="quantity">数量: {{ item.quantity || '—' }}</text>
          <text class="status-tag" :class="item.status">{{ statusLabel(item.status) }}</text>
        </view>
      </view>

      <view v-if="loading && page > 1" class="loading-more">加载中...</view>
      <view v-if="!loading && inquiries.length === 0" class="empty">暂无询盘</view>
      <view v-if="!loading && noMore && inquiries.length > 0" class="no-more">没有更多了</view>
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
.page { min-height: 100vh; background: #f5f5f5; }
.status-tabs { display: flex; background: #fff; padding: 16rpx 24rpx; gap: 12rpx; border-bottom: 1rpx solid #e8e8e8; }
.tab-item { position: relative; padding: 12rpx 24rpx; font-size: 26rpx; color: #666; border-radius: 30rpx; background: #f5f5f5; }
.tab-item.active { background: #1a1a1a; color: #fff; }
.badge { position: absolute; top: -4rpx; right: -4rpx; min-width: 32rpx; height: 32rpx; background: #e74c3c; color: #fff; font-size: 20rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; padding: 0 8rpx; }
.inquiry-list { height: calc(100vh - 120rpx); padding: 16rpx 24rpx; }
.inquiry-card { background: #fff; border-radius: 12rpx; margin-bottom: 16rpx; padding: 24rpx; }
.card-header { display: flex; align-items: center; }
.avatar { width: 72rpx; height: 72rpx; background: #1a1a1a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28rpx; font-weight: 600; margin-right: 16rpx; flex-shrink: 0; }
.header-info { flex: 1; overflow: hidden; }
.name { display: block; font-size: 28rpx; font-weight: 500; color: #1a1a1a; }
.company { display: block; font-size: 22rpx; color: #999; margin-top: 2rpx; }
.header-right { text-align: right; flex-shrink: 0; }
.unread-dot { width: 16rpx; height: 16rpx; background: #e74c3c; border-radius: 50%; margin-left: auto; margin-bottom: 8rpx; }
.time { font-size: 22rpx; color: #999; }
.card-body { margin-top: 16rpx; }
.items-row { display: flex; gap: 8rpx; margin-bottom: 12rpx; }
.item-thumb { width: 80rpx; height: 80rpx; border-radius: 6rpx; background: #f0f0f0; }
.more-count { font-size: 22rpx; color: #999; display: flex; align-items: center; }
.message-preview { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 26rpx; color: #666; line-height: 1.5; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16rpx; padding-top: 12rpx; border-top: 1rpx solid #f5f5f5; }
.quantity { font-size: 22rpx; color: #999; }
.status-tag { font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 4rpx; }
.status-tag.new { background: #fff3e0; color: #f57c00; }
.status-tag.read { background: #e3f2fd; color: #1976d2; }
.status-tag.replied { background: #e8f5e9; color: #43a047; }
.status-tag.archived { background: #f5f5f5; color: #999; }
.loading-more, .empty, .no-more { text-align: center; padding: 30rpx; font-size: 24rpx; color: #999; }
</style>
