<template>
  <view class="page">
    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <view class="loading-spinner" />
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="inquiry" class="detail">
      <!-- Customer Info Card -->
      <view class="info-card">
        <text class="section-title">客户信息</text>
        <view class="info-grid">
          <view class="info-cell">
            <text class="cell-label">姓名</text>
            <text class="cell-value">{{ inquiry.name }}</text>
          </view>
          <view class="info-cell">
            <text class="cell-label">邮箱</text>
            <text class="cell-value link-value" @tap="sendEmail">{{ inquiry.email }}</text>
          </view>
          <view class="info-cell">
            <text class="cell-label">公司</text>
            <text class="cell-value">{{ inquiry.company || '—' }}</text>
          </view>
          <view class="info-cell">
            <text class="cell-label">国家</text>
            <text class="cell-value">{{ inquiry.country || '—' }}</text>
          </view>
          <view class="info-cell">
            <text class="cell-label">数量</text>
            <text class="cell-value">{{ inquiry.quantity || '—' }}</text>
          </view>
          <view class="info-cell">
            <text class="cell-label">来源</text>
            <text class="cell-value">{{ inquiry.source || '—' }}</text>
          </view>
        </view>
      </view>

      <!-- Product Items -->
      <view v-if="inquiry.items?.length" class="info-card">
        <text class="section-title">询盘商品</text>
        <view v-for="(item, i) in inquiry.items" :key="i" class="product-row">
          <image :src="item.product_image" mode="aspectFill" class="product-thumb" />
          <view class="product-info">
            <text class="product-name">{{ item.product_name }}</text>
            <view class="product-meta">
              <text v-if="item.selected_size" class="meta-item">尺码: {{ item.selected_size }}</text>
              <text v-if="item.selected_color" class="meta-item">颜色: {{ item.selected_color }}</text>
              <text v-if="item.quantity" class="meta-item">数量: {{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Message Card -->
      <view v-if="inquiry.message" class="info-card">
        <text class="section-title">询盘消息</text>
        <text class="message-body">{{ inquiry.message }}</text>
      </view>

      <!-- Notes Timeline -->
      <view class="info-card">
        <text class="section-title">跟进记录</text>
        <view v-if="!inquiry.notes?.length" class="empty-notes">
          <text class="empty-notes-text">暂无跟进记录</text>
        </view>
        <view v-else class="timeline">
          <view v-for="(note, i) in inquiry.notes" :key="i" class="timeline-item">
            <view class="timeline-line-wrapper">
              <view class="timeline-dot" />
              <view v-if="i < inquiry.notes.length - 1" class="timeline-line" />
            </view>
            <view class="timeline-content">
              <text class="timeline-text">{{ note.content }}</text>
              <text class="timeline-time">{{ formatTime(note.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Add Note -->
      <view class="info-card">
        <text class="section-title">添加跟进</text>
        <textarea
          v-model="noteContent"
          class="note-textarea"
          placeholder="输入跟进备注..."
          :maxlength="2000"
        />
        <button class="note-submit-btn" :loading="submittingNote" :disabled="!noteContent.trim()" @tap="addNote">
          提交跟进
        </button>
      </view>

      <!-- Send Email Button -->
      <view class="bottom-bar">
        <button class="email-btn" @tap="sendEmail">发送邮件</button>
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
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}
.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #d9d9d9;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: rgba(0,0,0,0.45);
}

/* Info Card */
.info-card {
  background: #fff;
  margin: 24rpx;
  padding: 28rpx;
  border-radius: 12rpx;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

/* Section Title */
.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: rgba(0,0,0,0.88);
  margin-bottom: 20rpx;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}
.info-cell {
  display: flex;
  flex-direction: column;
}
.cell-label {
  font-size: 22rpx;
  color: rgba(0,0,0,0.45);
  margin-bottom: 6rpx;
}
.cell-value {
  font-size: 28rpx;
  color: rgba(0,0,0,0.88);
}
.link-value {
  color: #1677ff;
}

/* Product Items */
.product-row {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.product-row:last-child {
  border-bottom: none;
}
.product-thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}
.product-info {
  flex: 1;
}
.product-name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: rgba(0,0,0,0.88);
}
.product-meta {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
  flex-wrap: wrap;
}
.meta-item {
  font-size: 22rpx;
  color: rgba(0,0,0,0.45);
}

/* Message */
.message-body {
  font-size: 28rpx;
  color: rgba(0,0,0,0.65);
  line-height: 1.7;
}

/* Timeline */
.timeline {
  padding-left: 8rpx;
}
.timeline-item {
  display: flex;
  position: relative;
}
.timeline-line-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32rpx;
  flex-shrink: 0;
}
.timeline-dot {
  width: 16rpx;
  height: 16rpx;
  background: #1677ff;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 10rpx;
}
.timeline-line {
  width: 2rpx;
  flex: 1;
  background: #d9d9d9;
  margin-top: 8rpx;
}
.timeline-content {
  flex: 1;
  padding: 0 0 28rpx 20rpx;
}
.timeline-text {
  display: block;
  font-size: 26rpx;
  color: rgba(0,0,0,0.88);
  line-height: 1.6;
}
.timeline-time {
  display: block;
  font-size: 22rpx;
  color: rgba(0,0,0,0.45);
  margin-top: 8rpx;
}

/* Add Note */
.note-textarea {
  width: 100%;
  min-height: 140rpx;
  background: #f5f5f5;
  border: 2rpx solid #f0f0f0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: rgba(0,0,0,0.88);
  box-sizing: border-box;
}
.note-submit-btn {
  margin-top: 20rpx;
  width: 100%;
  height: 76rpx;
  line-height: 76rpx;
  background: #1677ff;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  border-radius: 8rpx;
}
.note-submit-btn::after {
  border: none;
}

/* Bottom Bar */
.bottom-bar {
  padding: 24rpx 24rpx 60rpx;
}
.email-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #1677ff;
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  border-radius: 12rpx;
  letter-spacing: 2rpx;
}
.email-btn::after {
  border: none;
}
</style>
