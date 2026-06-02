<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchText"
          class="search-input"
          placeholder="搜索产品名称..."
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="onSearch"
        />
      </view>
    </view>

    <!-- 分类 Tab -->
    <scroll-view scroll-x class="category-tabs">
      <view class="category-inner">
        <view
          v-for="cat in categories"
          :key="cat.value"
          class="tab-item"
          :class="{ active: currentCategory === cat.value }"
          @tap="switchCategory(cat.value)"
        >
          {{ cat.label }}
        </view>
      </view>
    </scroll-view>

    <!-- 产品列表 -->
    <scroll-view
      scroll-y
      class="product-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view
        v-for="product in products"
        :key="product.id"
        class="product-card"
        @tap="goDetail(product)"
      >
        <view class="card-body">
          <image
            class="product-img"
            :src="product.images?.[0] || ''"
            mode="aspectFill"
          />
          <view class="product-info">
            <text class="product-name">{{ product.name_en }}</text>
            <text class="product-name-cn">{{ product.name_cn }}</text>
            <view class="product-meta">
              <text class="price">US${{ product.price?.toFixed(2) }}</text>
              <text class="moq">MOQ {{ product.moq }}</text>
            </view>
            <view class="product-tag-row">
              <text class="category-tag">{{ product.category }}</text>
            </view>
          </view>
        </view>
        <view class="card-footer">
          <view class="footer-spacer"></view>
          <view class="action-btn edit" @tap.stop="goEdit(product)">编辑</view>
          <view class="action-btn delete" @tap.stop="onDelete(product)">删除</view>
        </view>
      </view>

      <view v-if="loading && page > 1" class="loading-more">加载中...</view>

      <!-- 空状态 -->
      <view v-if="!loading && products.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无产品</text>
      </view>

      <view v-if="!loading && noMore && products.length > 0" class="no-more">没有更多了</view>
    </scroll-view>

    <!-- FAB 添加按钮 -->
    <view class="fab" @tap="goAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchProducts, deleteProduct } from '@/api/products'
import type { Product } from '@/types/product'

const categories = [
  { label: '全部', value: '' },
  { label: 'Dresses', value: 'Dresses' },
  { label: 'Tops', value: 'Tops' },
  { label: 'Outerwear', value: 'Outerwear' },
  { label: 'Bottoms', value: 'Bottoms' },
  { label: 'Knitwear', value: 'Knitwear' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Sets', value: 'Sets' },
]

const products = ref<Product[]>([])
const searchText = ref('')
const currentCategory = ref('')
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

async function loadProducts(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    noMore.value = false
  }
  loading.value = true
  try {
    const res = await fetchProducts({
      page: page.value,
      pageSize,
      category: currentCategory.value || undefined,
      search: searchText.value || undefined,
    })
    if (reset) {
      products.value = res.data
    } else {
      products.value.push(...res.data)
    }
    if (res.data.length < pageSize) noMore.value = true
  } catch (err: any) {
    uni.showToast({ title: err.message || '加载失败', icon: 'error' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function switchCategory(val: string) {
  currentCategory.value = val
  loadProducts(true)
}

function onSearch() {
  loadProducts(true)
}

function onRefresh() {
  refreshing.value = true
  loadProducts(true)
}

function onLoadMore() {
  if (!noMore.value && !loading.value) {
    page.value++
    loadProducts()
  }
}

function goDetail(p: Product) {
  uni.navigateTo({ url: `/pages/products/detail/index?id=${p.id}` })
}

function goEdit(p: Product) {
  uni.navigateTo({ url: `/pages/products/edit/index?id=${p.id}` })
}

function goAdd() {
  uni.navigateTo({ url: '/pages/products/edit/index' })
}

async function onDelete(p: Product) {
  const res = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '确认删除',
      content: `确定删除「${p.name_en}」？`,
      success: (r) => resolve(r.confirm),
    })
  })
  if (!res) return
  try {
    await deleteProduct(p.id)
    uni.showToast({ title: '已删除', icon: 'success' })
    loadProducts(true)
  } catch (err: any) {
    uni.showToast({ title: err.message || '删除失败', icon: 'error' })
  }
}

onMounted(() => loadProducts(true))
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 搜索栏 */
.search-bar {
  padding: 20rpx 24rpx;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.search-wrap {
  display: flex;
  align-items: center;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 999rpx;
  padding: 0 24rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.88);
}

.search-placeholder {
  color: rgba(0, 0, 0, 0.45);
  font-size: 28rpx;
}

/* 分类 Tab */
.category-tabs {
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  white-space: nowrap;
}

.category-inner {
  display: flex;
  padding: 0 24rpx;
  gap: 16rpx;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 28rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.65);
  background: #f5f5f5;
  border-radius: 999rpx;
  flex-shrink: 0;
  transition: all 0.2s;
}

.tab-item.active {
  background: #1677ff;
  color: #fff;
  font-weight: 500;
}

/* 产品列表 */
.product-list {
  height: calc(100vh - 320rpx);
  padding: 20rpx 24rpx;
}

.product-card {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  padding: 24rpx;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.card-body {
  display: flex;
  align-items: flex-start;
}

.product-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  background: #f0f0f0;
}

.product-info {
  flex: 1;
  overflow: hidden;
}

.product-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-name-cn {
  display: block;
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4rpx;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 12rpx;
}

.price {
  font-size: 30rpx;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.moq {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.45);
}

.product-tag-row {
  margin-top: 10rpx;
}

.category-tag {
  display: inline-block;
  font-size: 22rpx;
  color: #1677ff;
  background: rgba(22, 119, 255, 0.08);
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}

/* 卡片底部操作栏 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.footer-spacer {
  flex: 1;
}

.action-btn {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  margin-left: 20rpx;
}

.action-btn.edit {
  color: #1677ff;
}

.action-btn.delete {
  color: #ff4d4f;
}

/* 加载状态 */
.loading-more,
.no-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.45);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.45);
}

/* FAB 按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  background: #1677ff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(22, 119, 255, 0.4);
}

.fab-icon {
  font-size: 48rpx;
  color: #fff;
  line-height: 1;
}
</style>
