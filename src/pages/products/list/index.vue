<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        v-model="searchText"
        class="search-input"
        placeholder="搜索产品名称..."
        confirm-type="search"
        @confirm="onSearch"
      />
    </view>

    <!-- 分类 Tab -->
    <scroll-view scroll-x class="category-tabs">
      <view
        v-for="cat in categories"
        :key="cat.value"
        class="tab-item"
        :class="{ active: currentCategory === cat.value }"
        @tap="switchCategory(cat.value)"
      >
        {{ cat.label }}
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
            <text class="category-tag">{{ product.category }}</text>
          </view>
        </view>
        <view class="product-actions">
          <view class="action-btn edit" @tap.stop="goEdit(product)">编辑</view>
          <view class="action-btn delete" @tap.stop="onDelete(product)">删除</view>
        </view>
      </view>

      <view v-if="loading && page > 1" class="loading-more">加载中...</view>
      <view v-if="!loading && products.length === 0" class="empty">暂无产品</view>
      <view v-if="!loading && noMore && products.length > 0" class="no-more">没有更多了</view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="fab" @tap="goAdd">+</view>
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
.page { min-height: 100vh; background: #f5f5f5; }
.search-bar { padding: 16rpx 24rpx; background: #fff; }
.search-input { height: 72rpx; background: #f5f5f5; border-radius: 8rpx; padding: 0 24rpx; font-size: 28rpx; }
.category-tabs { white-space: nowrap; background: #fff; padding: 16rpx 24rpx; border-bottom: 1rpx solid #e8e8e8; }
.tab-item { display: inline-block; padding: 12rpx 28rpx; margin-right: 16rpx; font-size: 26rpx; color: #666; border-radius: 30rpx; background: #f5f5f5; }
.tab-item.active { background: #1a1a1a; color: #fff; }
.product-list { height: calc(100vh - 280rpx); padding: 16rpx 24rpx; }
.product-card { display: flex; background: #fff; border-radius: 12rpx; margin-bottom: 16rpx; padding: 20rpx; align-items: center; }
.product-img { width: 120rpx; height: 120rpx; border-radius: 8rpx; margin-right: 20rpx; flex-shrink: 0; background: #f0f0f0; }
.product-info { flex: 1; overflow: hidden; }
.product-name { display: block; font-size: 28rpx; font-weight: 500; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-name-cn { display: block; font-size: 22rpx; color: #999; margin-top: 4rpx; }
.product-meta { display: flex; align-items: center; gap: 16rpx; margin-top: 12rpx; }
.price { font-size: 26rpx; font-weight: 500; color: #1a1a1a; }
.moq { font-size: 22rpx; color: #999; }
.category-tag { font-size: 20rpx; color: #b8860b; background: #fdf6e3; padding: 4rpx 12rpx; border-radius: 4rpx; }
.product-actions { display: flex; flex-direction: column; gap: 8rpx; margin-left: 16rpx; }
.action-btn { font-size: 22rpx; padding: 8rpx 16rpx; border-radius: 6rpx; text-align: center; }
.action-btn.edit { background: #f0f0f0; color: #333; }
.action-btn.delete { background: #fff0f0; color: #e74c3c; }
.loading-more, .empty, .no-more { text-align: center; padding: 30rpx; font-size: 24rpx; color: #999; }
.fab { position: fixed; right: 40rpx; bottom: 200rpx; width: 100rpx; height: 100rpx; background: #b8860b; color: #fff; font-size: 48rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.2); }
</style>
