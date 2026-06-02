<template>
  <view class="page">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="inquiry" class="detail">
      <!-- 客户信息 -->
      <view class="info-card">
        <text class="card-title">客户信息</text>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">姓名</text>
            <text class="info-value">{{ inquiry.name }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">邮箱</text>
            <text class="info-value link" @tap="sendEmail">{{ inquiry.email }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">公司</text>
            <text class="info-value">{{ inquiry.company || '—' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">国家</text>
            <text class="info-value">{{ inquiry.country || '—' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">数量</text>
            <text class="info-value">{{ inquiry.quantity || '—' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">来源</text>
            <text class="info-value">{{ inquiry.source || '—' }}</text>
          </view>
        </view>
      </view>

      <!-- 询盘商品 -->
      <view v-if="inquiry.items?.length" class="info-card">
        <text class="card-title">询盘商品</text>
        <view v-for="(item, i) in inquiry.items" :key="i" class="product-item">
          <image :src="item.product_image" mode="aspectFill" class="product-thumb" />
          <view class="product-info">
            <text class="product-name">{{ item.product_name }}</text>
            <view class="product-meta">
              <text v-if="item.selected_size">尺码: {{ item.selected_size }}</text>
              <text v-if="item.selected_color">颜色: {{ item.selected_color }}</text>
              <text v-if="item.quantity">数量: {{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 消息内容 -->
      <view v-if="inquiry.message" class="info-card">
        <text class="card-title">询盘消息</text>
        <text class="message-text">{{ inquiry.message }}</text>
      </view>

      <!-- 跟进记录 -->
      <view class="info-card">
        <text class="card-title">跟进记录</text>
        <view v-if="!inquiry.notes?.length" class="empty-notes">暂无跟进记录</view>
        <view v-else class="notes-timeline">
          <view v-for="(note, i) in inquiry.notes" :key="i" class="note-item">
            <view class="note-dot" />
            <view class="note-content">
              <text class="note-text">{{ note.content }}</text>
              <text class="note-time">{{ formatTime(note.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 添加跟进 -->
      <view class="info-card">
        <text class="card-title">添加跟进</text>
        <textarea
          v-model="noteContent"
          class="note-input"
          placeholder="输入跟进备注..."
          :maxlength="2000"
        />
        <button class="note-btn" :loading="submittingNote" :disabled="!noteContent.trim()" @tap="addNote">
          提交跟进
        </button>
      </view>

      <!-- 快捷操作 -->
      <view class="action-bar">
        <button class="action-btn email" @tap="sendEmail">发送邮件</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchInquiryById, addNote } from '@/api/inquiries'
import type { Inquiry } from '@/types/inquiry'

const inquiry = ref<Inquiry | null>(null)
const loading = ref(true)
const noteContent = ref('')
const submittingNote = ref(false)

function formatTime(t: string) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function sendEmail() {
  if (inquiry.value?.email) {
    uni.openURL(`mailto:${inquiry.value.email}`)
  }
}

async function addNote() {
  if (!noteContent.value.trim() || !inquiry.value) return
  submittingNote.value = true
  try {
    await addNote(inquiry.value.id, noteContent.value.trim())
    noteContent.value = ''
    // 重新加载数据
    inquiry.value = await fetchInquiryById(inquiry.value.id)
    uni.showToast({ title: '跟进已添加', icon: 'success' })
  } catch (err: any) {
    uni.showToast({ title: err.message || '添加失败', icon: 'error' })
  } finally {
    submittingNote.value = false
  }
}

onLoad(async (options) => {
  if (!options?.id) return
  try {
    inquiry.value = await fetchInquiryById(options.id)
  } catch {
    uni.showToast({ title: '加载失败', icon: 'error' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; padding-bottom: 160rpx; }
.loading { text-align: center; padding: 100rpx; color: #999; font-size: 28rpx; }
.info-card { background: #fff; margin: 16rpx 24rpx; padding: 24rpx; border-radius: 12rpx; }
.card-title { display: block; font-size: 28rpx; font-weight: 600; color: #1a1a1a; margin-bottom: 16rpx; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.info-item { }
.info-label { display: block; font-size: 22rpx; color: #999; margin-bottom: 4rpx; }
.info-value { display: block; font-size: 26rpx; color: #333; }
.info-value.link { color: #1890ff; }
.product-item { display: flex; padding: 12rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.product-item:last-child { border-bottom: none; }
.product-thumb { width: 100rpx; height: 100rpx; border-radius: 8rpx; margin-right: 16rpx; background: #f0f0f0; flex-shrink: 0; }
.product-info { flex: 1; }
.product-name { display: block; font-size: 26rpx; font-weight: 500; color: #1a1a1a; }
.product-meta { display: flex; gap: 16rpx; margin-top: 8rpx; font-size: 22rpx; color: #999; }
.message-text { font-size: 26rpx; color: #666; line-height: 1.6; }
.empty-notes { text-align: center; padding: 24rpx; color: #ccc; font-size: 24rpx; }
.notes-timeline { padding-left: 24rpx; border-left: 2rpx solid #e8e8e8; }
.note-item { position: relative; padding: 0 0 24rpx 24rpx; }
.note-dot { position: absolute; left: -29rpx; top: 8rpx; width: 16rpx; height: 16rpx; background: #b8860b; border-radius: 50%; }
.note-text { display: block; font-size: 26rpx; color: #333; line-height: 1.5; }
.note-time { display: block; font-size: 22rpx; color: #999; margin-top: 4rpx; }
.note-input { width: 100%; min-height: 120rpx; background: #f9f9f9; border: 1rpx solid #e8e8e8; border-radius: 8rpx; padding: 16rpx; font-size: 26rpx; box-sizing: border-box; }
.note-btn { margin-top: 16rpx; width: 100%; height: 72rpx; line-height: 72rpx; background: #b8860b; color: #fff; font-size: 28rpx; border: none; border-radius: 8rpx; }
.note-btn::after { border: none; }
.action-bar { display: flex; gap: 16rpx; padding: 0 24rpx; }
.action-btn { flex: 1; height: 80rpx; line-height: 80rpx; font-size: 28rpx; border: none; border-radius: 8rpx; }
.action-btn::after { border: none; }
.action-btn.email { background: #1a1a1a; color: #fff; }
.action-btn.call { background: #b8860b; color: #fff; }
</style>
