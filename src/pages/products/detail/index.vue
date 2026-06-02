<template>
  <view class="page">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="product" class="detail">
      <!-- 图片轮播 -->
      <swiper
        class="img-swiper"
        indicator-dots
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#b8860b"
        :autoplay="false"
      >
        <swiper-item v-for="(img, i) in product.images" :key="i">
          <image :src="img" mode="aspectFill" class="swiper-img" @tap="previewImage(i)" />
        </swiper-item>
      </swiper>

      <!-- 基本信息 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">分类</text>
          <text class="info-value">{{ product.category }} / {{ product.category_cn }}</text>
        </view>
        <text class="product-name">{{ product.name_en }}</text>
        <text class="product-name-cn">{{ product.name_cn }}</text>
        <view class="price-row">
          <text class="price">US${{ product.price?.toFixed(2) }}</text>
          <text class="fob">FOB Guangzhou</text>
        </view>
      </view>

      <!-- 描述 -->
      <view v-if="product.description" class="info-card">
        <text class="card-title">产品描述</text>
        <text class="desc">{{ product.description }}</text>
        <text v-if="product.description_cn" class="desc-cn">{{ product.description_cn }}</text>
      </view>

      <!-- 规格 -->
      <view class="info-card">
        <text class="card-title">产品规格</text>
        <view class="spec-row">
          <text class="spec-label">MOQ</text>
          <text class="spec-value">{{ product.moq }}</text>
        </view>
        <view v-if="product.sizes?.length" class="spec-row">
          <text class="spec-label">尺码</text>
          <text class="spec-value">{{ product.sizes.join(' / ') }}</text>
        </view>
        <view v-if="product.colors?.length" class="spec-row">
          <text class="spec-label">颜色</text>
          <view class="color-list">
            <view v-for="(c, i) in product.colors" :key="i" class="color-item">
              <view v-if="typeof c === 'object'" class="color-dot" :style="{ background: c.hex }" />
              <text class="color-name">{{ typeof c === 'object' ? c.name : c }}</text>
            </view>
          </view>
        </view>
        <view v-if="product.tags?.length" class="spec-row">
          <text class="spec-label">标签</text>
          <view class="tag-list">
            <text v-for="(t, i) in product.tags" :key="i" class="tag">#{{ t }}</text>
          </view>
        </view>
        <view class="spec-row">
          <text class="spec-label">推荐</text>
          <text class="spec-value">{{ product.featured ? '是' : '否' }}</text>
        </view>
      </view>

      <!-- 货代链接 -->
      <view v-if="product.freight_links?.length" class="info-card">
        <text class="card-title">货代链接</text>
        <view v-for="(link, i) in product.freight_links" :key="i" class="link-item">
          <text class="link-text">{{ link }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
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
.page { min-height: 100vh; background: #f5f5f5; }
.loading { text-align: center; padding: 100rpx; color: #999; font-size: 28rpx; }
.img-swiper { width: 100%; height: 750rpx; }
.swiper-img { width: 100%; height: 100%; }
.info-card { background: #fff; margin: 16rpx 24rpx; padding: 24rpx; border-radius: 12rpx; }
.card-title { display: block; font-size: 28rpx; font-weight: 600; color: #1a1a1a; margin-bottom: 16rpx; }
.info-row { display: flex; justify-content: space-between; padding: 12rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.info-label { font-size: 24rpx; color: #999; }
.info-value { font-size: 24rpx; color: #333; }
.product-name { display: block; font-size: 34rpx; font-weight: 600; color: #1a1a1a; margin-top: 16rpx; }
.product-name-cn { display: block; font-size: 26rpx; color: #999; margin-top: 4rpx; }
.price-row { display: flex; align-items: baseline; gap: 12rpx; margin-top: 16rpx; }
.price { font-size: 36rpx; font-weight: 600; color: #1a1a1a; }
.fob { font-size: 22rpx; color: #999; }
.desc { display: block; font-size: 26rpx; color: #666; line-height: 1.6; }
.desc-cn { display: block; font-size: 24rpx; color: #999; line-height: 1.6; margin-top: 8rpx; }
.spec-row { padding: 12rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.spec-row:last-child { border-bottom: none; }
.spec-label { font-size: 24rpx; color: #999; margin-right: 16rpx; }
.spec-value { font-size: 24rpx; color: #333; }
.color-list, .tag-list { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 8rpx; }
.color-item { display: flex; align-items: center; gap: 6rpx; }
.color-dot { width: 24rpx; height: 24rpx; border-radius: 50%; border: 1rpx solid #e8e8e8; }
.color-name { font-size: 22rpx; color: #666; }
.tag { font-size: 22rpx; color: #b8860b; background: #fdf6e3; padding: 4rpx 12rpx; border-radius: 4rpx; }
.link-item { padding: 8rpx 0; }
.link-text { font-size: 24rpx; color: #1890ff; }
.action-bar { padding: 30rpx 24rpx; }
.edit-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: #1a1a1a; color: #fff; font-size: 30rpx; border: none; border-radius: 8rpx; }
.edit-btn::after { border: none; }
</style>
