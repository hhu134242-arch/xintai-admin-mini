<template>
  <view class="page">
    <!-- Loading state -->
    <view v-if="loading" class="loading-state">
      <view class="loading-spinner" />
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="product" class="detail">
      <!-- Image Swiper -->
      <view class="swiper-wrapper">
        <swiper
          class="img-swiper"
          indicator-dots
          indicator-color="rgba(22,119,255,0.3)"
          indicator-active-color="#1677ff"
          :autoplay="false"
        >
          <swiper-item v-for="(img, i) in product.images" :key="i">
            <image :src="img" mode="aspectFill" class="swiper-img" @tap="previewImage(i)" />
          </swiper-item>
        </swiper>
      </view>

      <!-- Product Info Card -->
      <view class="info-card">
        <!-- Category -->
        <view class="category-row">
          <text class="category-text">{{ product.category }} / {{ product.category_cn }}</text>
        </view>

        <!-- Names -->
        <text class="product-name-en">{{ product.name_en }}</text>
        <text class="product-name-cn">{{ product.name_cn }}</text>

        <!-- Price -->
        <view class="price-row">
          <text class="price-value">US${{ product.price?.toFixed(2) }}</text>
          <text class="price-fob">FOB Guangzhou</text>
        </view>
      </view>

      <!-- Description Card -->
      <view v-if="product.description" class="info-card">
        <text class="section-title">产品描述</text>
        <text class="desc-text">{{ product.description }}</text>
        <text v-if="product.description_cn" class="desc-text-cn">{{ product.description_cn }}</text>
      </view>

      <!-- Specs Card -->
      <view class="info-card">
        <text class="section-title">产品规格</text>

        <view class="spec-row">
          <text class="spec-label">MOQ</text>
          <text class="spec-value">{{ product.moq }}</text>
        </view>

        <view v-if="product.sizes?.length" class="spec-row">
          <text class="spec-label">尺码</text>
          <text class="spec-value">{{ product.sizes.join(' / ') }}</text>
        </view>

        <view v-if="product.colors?.length" class="spec-row spec-row-colors">
          <text class="spec-label">颜色</text>
          <view class="color-list">
            <view v-for="(c, i) in product.colors" :key="i" class="color-item">
              <view v-if="typeof c === 'object'" class="color-dot" :style="{ background: c.hex }" />
              <text class="color-name">{{ typeof c === 'object' ? c.name : c }}</text>
            </view>
          </view>
        </view>

        <view v-if="product.tags?.length" class="spec-row spec-row-tags">
          <text class="spec-label">标签</text>
          <view class="tag-list">
            <text v-for="(t, i) in product.tags" :key="i" class="tag-pill">#{{ t }}</text>
          </view>
        </view>

        <view class="spec-row">
          <text class="spec-label">推荐</text>
          <text class="spec-value">{{ product.featured ? '是' : '否' }}</text>
        </view>
      </view>

      <!-- Freight Links Card -->
      <view v-if="product.freight_links?.length" class="info-card">
        <text class="section-title">货代链接</text>
        <view v-for="(link, i) in product.freight_links" :key="i" class="link-row">
          <text class="link-text">{{ link }}</text>
        </view>
      </view>

      <!-- Edit Button -->
      <view class="action-bar">
        <button class="edit-btn" @tap="goEdit">编辑产品</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchProductById } from '@/api/products'
import type { Product } from '@/types/product'

const product = ref<Product | null>(null)
const loading = ref(true)

function previewImage(idx: number) {
  if (product.value?.images) {
    uni.previewImage({
      urls: product.value.images,
      current: idx,
    })
  }
}

function goEdit() {
  if (product.value) {
    uni.navigateTo({ url: `/pages/products/edit/index?id=${product.value.id}` })
  }
}

onLoad(async (options) => {
  if (!options?.id) return
  try {
    product.value = await fetchProductById(options.id)
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

/* Swiper */
.swiper-wrapper {
  width: 750rpx;
}
.img-swiper {
  width: 750rpx;
  height: 750rpx;
}
.swiper-img {
  width: 100%;
  height: 100%;
}

/* Info Card */
.info-card {
  background: #fff;
  margin: 24rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

/* Category */
.category-row {
  margin-bottom: 12rpx;
}
.category-text {
  font-size: 24rpx;
  color: rgba(0,0,0,0.45);
  background: #f5f5f5;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}

/* Product Names */
.product-name-en {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: rgba(0,0,0,0.88);
  line-height: 1.4;
}
.product-name-cn {
  display: block;
  font-size: 24rpx;
  color: rgba(0,0,0,0.45);
  margin-top: 4rpx;
}

/* Price Row */
.price-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}
.price-value {
  font-size: 36rpx;
  font-weight: 700;
  color: rgba(0,0,0,0.88);
}
.price-fob {
  font-size: 24rpx;
  color: rgba(0,0,0,0.45);
}

/* Section Title */
.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: rgba(0,0,0,0.88);
  margin-bottom: 20rpx;
}

/* Description */
.desc-text {
  display: block;
  font-size: 28rpx;
  color: rgba(0,0,0,0.65);
  line-height: 1.7;
}
.desc-text-cn {
  display: block;
  font-size: 24rpx;
  color: rgba(0,0,0,0.45);
  line-height: 1.7;
  margin-top: 8rpx;
}

/* Spec Rows */
.spec-row {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.spec-row:last-child {
  border-bottom: none;
}
.spec-row-colors,
.spec-row-tags {
  flex-direction: column;
}
.spec-label {
  font-size: 24rpx;
  color: rgba(0,0,0,0.45);
  width: 100rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
  padding-top: 2rpx;
}
.spec-value {
  font-size: 28rpx;
  color: rgba(0,0,0,0.88);
  flex: 1;
}

/* Colors */
.color-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}
.color-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.color-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(0,0,0,0.06);
}
.color-name {
  font-size: 24rpx;
  color: rgba(0,0,0,0.65);
}

/* Tags */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}
.tag-pill {
  font-size: 22rpx;
  color: #1677ff;
  background: rgba(22,119,255,0.06);
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
}

/* Links */
.link-row {
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.link-row:last-child {
  border-bottom: none;
}
.link-text {
  font-size: 26rpx;
  color: #1677ff;
}

/* Action Bar */
.action-bar {
  padding: 24rpx 24rpx 60rpx;
}
.edit-btn {
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
.edit-btn::after {
  border: none;
}
</style>
