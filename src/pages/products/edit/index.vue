<template>
  <view class="page">
    <view class="form">
      <!-- 基本信息 -->
      <view class="section-title">基本信息</view>
      <view class="field">
        <text class="label">产品名称 (EN) *</text>
        <input v-model="form.name" placeholder="e.g. Floral Summer Dress" />
      </view>
      <view class="field">
        <text class="label">产品名称 (CN)</text>
        <input v-model="form.name_cn" placeholder="e.g. 碎花夏裙" />
      </view>
      <view class="field">
        <text class="label">URL Slug</text>
        <input v-model="form.slug" placeholder="自动生成（留空）" />
      </view>
      <view class="field">
        <text class="label">描述 (EN)</text>
        <textarea v-model="form.description" placeholder="Product description" :maxlength="2000" />
      </view>
      <view class="field">
        <text class="label">描述 (CN)</text>
        <textarea v-model="form.description_cn" placeholder="产品中文描述" :maxlength="2000" />
      </view>

      <!-- 价格与分类 -->
      <view class="section-title">价格与分类</view>
      <view class="field-row">
        <view class="field half">
          <text class="label">分类 *</text>
          <picker :range="categoryOptions" range-key="label" @change="onCategoryChange">
            <view class="picker">{{ selectedCategory || '选择分类' }}</view>
          </picker>
        </view>
        <view class="field half">
          <text class="label">价格 (US$) *</text>
          <input v-model="form.price" type="digit" placeholder="0.00" />
        </view>
      </view>
      <view class="field">
        <text class="label">MOQ</text>
        <input v-model="form.moq" type="number" placeholder="100" />
      </view>

      <!-- 尺码 -->
      <view class="section-title">可选尺码</view>
      <view class="tags-wrap">
        <view
          v-for="s in sizeOptions"
          :key="s"
          class="tag"
          :class="{ active: form.sizes.includes(s) }"
          @tap="toggleSize(s)"
        >{{ s }}</view>
      </view>

      <!-- 图片 -->
      <view class="section-title">产品图片</view>
      <view class="images-grid">
        <view v-for="(img, i) in form.images" :key="i" class="img-item">
          <image :src="img" mode="aspectFill" class="img-thumb" />
          <view class="img-delete" @tap="removeImage(i)">×</view>
        </view>
        <view v-if="form.images.length < 10" class="img-add" @tap="chooseImage">
          <text class="add-icon">+</text>
        </view>
      </view>

      <!-- 标签 -->
      <view class="section-title">标签</view>
      <view class="field">
        <input v-model="tagInput" placeholder="输入标签后回车" @confirm="addTag" />
      </view>
      <view class="tags-wrap">
        <view v-for="(t, i) in form.tags" :key="i" class="tag active" @tap="removeTag(i)">
          {{ t }} ×
        </view>
      </view>

      <!-- 货代链接 -->
      <view class="section-title">货代链接 <text class="hint">（仅后台存储）</text></view>
      <view class="field">
        <input v-model="linkInput" placeholder="输入链接后回车" @confirm="addLink" />
      </view>
      <view class="tags-wrap">
        <view v-for="(l, i) in form.freight_links" :key="i" class="tag active" @tap="removeLink(i)">
          {{ l.slice(0, 20) }}... ×
        </view>
      </view>

      <!-- 推荐 -->
      <view class="field-row" style="align-items:center;">
        <text class="label" style="margin-bottom:0;">推荐产品</text>
        <switch :checked="form.featured" @change="form.featured = $event.detail.value" color="#b8860b" />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" :loading="submitting" @tap="onSubmit">
        {{ isEdit ? '更新产品' : '创建产品' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onLoad } from '@dcloudio/uni-app'
import { fetchProductById, createProduct, updateProduct } from '@/api/products'
import { uploadImage } from '@/api/upload'

const isEdit = ref(false)
const productId = ref('')
const submitting = ref(false)
const tagInput = ref('')
const linkInput = ref('')
const selectedCategory = ref('')

const categoryOptions = [
  { label: 'Dresses / 连衣裙', value: 'Dresses' },
  { label: 'Tops / 上衣', value: 'Tops' },
  { label: 'Outerwear / 外套', value: 'Outerwear' },
  { label: 'Bottoms / 下装', value: 'Bottoms' },
  { label: 'Knitwear / 针织', value: 'Knitwear' },
  { label: 'Accessories / 配饰', value: 'Accessories' },
  { label: 'Sets / 套装', value: 'Sets' },
]

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL']

const form = reactive({
  name: '',
  name_cn: '',
  slug: '',
  description: '',
  description_cn: '',
  category: '',
  category_cn: '',
  price: '',
  moq: '100',
  sizes: [] as string[],
  images: [] as string[],
  tags: [] as string[],
  tags_cn: [] as string[],
  freight_links: [] as string[],
  featured: false,
})

function onCategoryChange(e: any) {
  const idx = e.detail.value
  form.category = categoryOptions[idx].value
  form.category_cn = categoryOptions[idx].label.split(' / ')[1]
  selectedCategory.value = categoryOptions[idx].label
}

function toggleSize(s: string) {
  const idx = form.sizes.indexOf(s)
  if (idx >= 0) form.sizes.splice(idx, 1)
  else form.sizes.push(s)
}

function addTag() {
  const t = tagInput.value.trim()
  if (t && !form.tags.includes(t)) {
    form.tags.push(t)
    form.tags_cn.push('')
  }
  tagInput.value = ''
}

function removeTag(i: number) {
  form.tags.splice(i, 1)
  form.tags_cn.splice(i, 1)
}

function addLink() {
  const l = linkInput.value.trim()
  if (l && !form.freight_links.includes(l)) {
    form.freight_links.push(l)
  }
  linkInput.value = ''
}

function removeLink(i: number) {
  form.freight_links.splice(i, 1)
}

async function chooseImage() {
  try {
    const res = await new Promise<UniApp.ChooseImageRes>((resolve, reject) => {
      uni.chooseImage({
        count: 10 - form.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject,
      })
    })
    for (const path of res.tempFilePaths) {
      uni.showLoading({ title: '上传中...' })
      try {
        const result = await uploadImage(path)
        form.images.push(result.url)
      } catch {
        uni.showToast({ title: '上传失败', icon: 'error' })
      } finally {
        uni.hideLoading()
      }
    }
  } catch {}
}

function removeImage(i: number) {
  form.images.splice(i, 1)
}

async function onSubmit() {
  if (!form.name) {
    uni.showToast({ title: '请输入产品名称', icon: 'error' })
    return
  }
  if (!form.category) {
    uni.showToast({ title: '请选择分类', icon: 'error' })
    return
  }
  if (!form.price) {
    uni.showToast({ title: '请输入价格', icon: 'error' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      name: form.name,
      name_cn: form.name_cn,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: form.description,
      description_cn: form.description_cn,
      category: form.category,
      category_cn: form.category_cn || form.category,
      price: Number(form.price),
      moq: Number(form.moq || 100),
      sizes: form.sizes,
      images: form.images,
      tags: form.tags,
      tags_cn: form.tags_cn,
      freight_links: form.freight_links,
      featured: form.featured,
    }

    if (isEdit.value) {
      await updateProduct(productId.value, payload)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createProduct(payload)
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (err: any) {
    uni.showToast({ title: err.message || '操作失败', icon: 'error' })
  } finally {
    submitting.value = false
  }
}

// 页面加载
onLoad(async (options) => {
  if (options?.id) {
    isEdit.value = true
    productId.value = options.id
    uni.setNavigationBarTitle({ title: '编辑产品' })
    try {
      const p = await fetchProductById(options.id)
      if (p) {
        Object.assign(form, {
          name: p.name,
          name_cn: p.name_cn,
          slug: p.slug,
          description: p.description,
          description_cn: p.description_cn,
          category: p.category,
          category_cn: p.category_cn,
          price: String(p.price),
          moq: String(p.moq),
          sizes: p.sizes || [],
          images: p.images || [],
          tags: p.tags || [],
          tags_cn: p.tags_cn || [],
          freight_links: p.freight_links || [],
          featured: p.featured,
        })
        selectedCategory.value = categoryOptions.find(c => c.value === p.category)?.label || p.category
      }
    } catch {
      uni.showToast({ title: '加载失败', icon: 'error' })
    }
  } else {
    uni.setNavigationBarTitle({ title: '添加产品' })
  }
})
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; padding-bottom: 140rpx; }
.form { padding: 24rpx; }
.section-title { font-size: 28rpx; font-weight: 600; color: #1a1a1a; margin: 30rpx 0 16rpx; }
.hint { font-size: 22rpx; color: #999; font-weight: 400; }
.field { margin-bottom: 20rpx; }
.label { display: block; font-size: 24rpx; color: #666; margin-bottom: 8rpx; }
.field input, .field textarea { width: 100%; height: 80rpx; background: #fff; border: 1rpx solid #e8e8e8; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; }
.field textarea { height: 160rpx; padding: 16rpx 20rpx; }
.field-row { display: flex; gap: 20rpx; }
.field.half { flex: 1; }
.picker { height: 80rpx; line-height: 80rpx; background: #fff; border: 1rpx solid #e8e8e8; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; color: #333; }
.tags-wrap { display: flex; flex-wrap: wrap; gap: 12rpx; }
.tag { padding: 10rpx 24rpx; background: #f0f0f0; border-radius: 6rpx; font-size: 24rpx; color: #666; }
.tag.active { background: #1a1a1a; color: #fff; }
.images-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.img-item { position: relative; width: 160rpx; height: 160rpx; }
.img-thumb { width: 160rpx; height: 160rpx; border-radius: 8rpx; background: #f0f0f0; }
.img-delete { position: absolute; top: -10rpx; right: -10rpx; width: 40rpx; height: 40rpx; background: #e74c3c; color: #fff; border-radius: 50%; font-size: 24rpx; display: flex; align-items: center; justify-content: center; }
.img-add { width: 160rpx; height: 160rpx; border: 2rpx dashed #ccc; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; }
.add-icon { font-size: 48rpx; color: #ccc; }
.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 24rpx; background: #fff; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); }
.submit-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: #1a1a1a; color: #fff; font-size: 30rpx; border: none; border-radius: 8rpx; }
.submit-btn::after { border: none; }
</style>
