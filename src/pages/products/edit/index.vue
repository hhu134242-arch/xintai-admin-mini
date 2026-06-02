<template>
  <view class="page">
    <view class="form">
      <!-- 基本信息 -->
      <view class="card">
        <view class="section-title">
          <view class="title-bar"></view>
          <text>基本信息</text>
        </view>

        <view class="field">
          <text class="label">产品名称 (EN) *</text>
          <input
            v-model="form.name_en"
            class="field-input"
            placeholder="e.g. Floral Summer Dress"
            placeholder-class="placeholder"
          />
        </view>
        <view class="field">
          <text class="label">产品名称 (CN)</text>
          <input
            v-model="form.name_cn"
            class="field-input"
            placeholder="e.g. 碎花夏裙"
            placeholder-class="placeholder"
          />
        </view>
        <view class="field">
          <text class="label">URL Slug</text>
          <input
            v-model="form.slug"
            class="field-input"
            placeholder="自动生成（留空）"
            placeholder-class="placeholder"
          />
        </view>
        <view class="field">
          <text class="label">描述 (EN)</text>
          <textarea
            v-model="form.description"
            class="field-textarea"
            placeholder="Product description"
            placeholder-class="placeholder"
            :maxlength="2000"
          />
        </view>
        <view class="field">
          <text class="label">描述 (CN)</text>
          <textarea
            v-model="form.description_cn"
            class="field-textarea"
            placeholder="产品中文描述"
            placeholder-class="placeholder"
            :maxlength="2000"
          />
        </view>
      </view>

      <!-- 价格与分类 -->
      <view class="card">
        <view class="section-title">
          <view class="title-bar"></view>
          <text>价格与分类</text>
        </view>

        <view class="field-row">
          <view class="field half">
            <text class="label">分类 *</text>
            <picker :range="categoryOptions" range-key="label" @change="onCategoryChange">
              <view class="field-picker">
                <text :class="selectedCategory ? 'picker-text' : 'picker-placeholder'">
                  {{ selectedCategory || '选择分类' }}
                </text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="field half">
            <text class="label">价格 (US$) *</text>
            <input
              v-model="form.price"
              class="field-input"
              type="digit"
              placeholder="0.00"
              placeholder-class="placeholder"
            />
          </view>
        </view>
        <view class="field">
          <text class="label">MOQ</text>
          <input
            v-model="form.moq"
            class="field-input"
            type="number"
            placeholder="100"
            placeholder-class="placeholder"
          />
        </view>
      </view>

      <!-- 尺码 -->
      <view class="card">
        <view class="section-title">
          <view class="title-bar"></view>
          <text>可选尺码</text>
        </view>
        <view class="tags-wrap">
          <view
            v-for="s in sizeOptions"
            :key="s"
            class="size-tag"
            :class="{ active: form.sizes.includes(s) }"
            @tap="toggleSize(s)"
          >{{ s }}</view>
        </view>
      </view>

      <!-- 图片 -->
      <view class="card">
        <view class="section-title">
          <view class="title-bar"></view>
          <text>产品图片</text>
        </view>
        <view class="images-grid">
          <view v-for="(img, i) in form.images" :key="i" class="img-item">
            <image :src="img" mode="aspectFill" class="img-thumb" />
            <view class="img-delete" @tap="removeImage(i)">
              <text class="img-delete-icon">×</text>
            </view>
          </view>
          <view v-if="form.images.length < 10" class="img-add" @tap="chooseImage">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>

      <!-- 标签 -->
      <view class="card">
        <view class="section-title">
          <view class="title-bar"></view>
          <text>标签</text>
        </view>
        <view class="field">
          <input
            v-model="tagInput"
            class="field-input"
            placeholder="输入标签后回车"
            placeholder-class="placeholder"
            @confirm="addTag"
          />
        </view>
        <view class="tags-wrap">
          <view v-for="(t, i) in form.tags" :key="i" class="removable-tag" @tap="removeTag(i)">
            <text class="removable-tag-text">{{ t }}</text>
            <text class="removable-tag-close">×</text>
          </view>
        </view>
      </view>

      <!-- 货代链接 -->
      <view class="card">
        <view class="section-title">
          <view class="title-bar"></view>
          <text>货代链接 <text class="hint">（仅后台存储）</text></text>
        </view>
        <view class="field">
          <input
            v-model="linkInput"
            class="field-input"
            placeholder="输入链接后回车"
            placeholder-class="placeholder"
            @confirm="addLink"
          />
        </view>
        <view class="tags-wrap">
          <view v-for="(l, i) in form.freight_links" :key="i" class="removable-tag" @tap="removeLink(i)">
            <text class="removable-tag-text">{{ l.slice(0, 20) }}...</text>
            <text class="removable-tag-close">×</text>
          </view>
        </view>
      </view>

      <!-- 推荐 -->
      <view class="card">
        <view class="switch-row">
          <view class="switch-left">
            <view class="title-bar" style="display: inline-block; vertical-align: middle; margin-right: 12rpx;"></view>
            <text class="switch-label">推荐产品</text>
          </view>
          <switch
            :checked="form.featured"
            @change="form.featured = $event.detail.value"
            color="#1677ff"
          />
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button
        class="submit-btn"
        :loading="submitting"
        @tap="onSubmit"
      >
        {{ isEdit ? '更新产品' : '创建产品' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
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
  name_en: '',
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
  if (!form.name_en) {
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
      name_en: form.name_en,
      name_cn: form.name_cn,
      slug: form.slug || form.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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
          name_en: p.name_en,
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
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.form {
  padding: 20rpx 24rpx;
}

/* 卡片 */
.card {
  background: #fff;
  border-radius: 12rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* 区块标题 */
.section-title {
  display: flex;
  align-items: center;
  font-size: 30rpx;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 24rpx;
}

.title-bar {
  width: 6rpx;
  height: 28rpx;
  background: #1677ff;
  border-radius: 3rpx;
  margin-right: 14rpx;
  flex-shrink: 0;
}

.hint {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
}

/* 表单字段 */
.field {
  margin-bottom: 24rpx;
}

.field:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 12rpx;
  font-weight: 500;
}

.field-input {
  width: 100%;
  height: 80rpx;
  background: #fff;
  border: 1rpx solid #d9d9d9;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.88);
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.field-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2rpx rgba(22, 119, 255, 0.1);
}

.field-textarea {
  width: 100%;
  min-height: 200rpx;
  background: #fff;
  border: 1rpx solid #d9d9d9;
  border-radius: 8rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.88);
  box-sizing: border-box;
  line-height: 1.6;
}

.field-textarea:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2rpx rgba(22, 119, 255, 0.1);
}

.placeholder {
  color: rgba(0, 0, 0, 0.45);
  font-size: 28rpx;
}

.field-row {
  display: flex;
  gap: 20rpx;
}

.field.half {
  flex: 1;
}

/* Picker */
.field-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  background: #fff;
  border: 1rpx solid #d9d9d9;
  border-radius: 8rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.picker-text {
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.88);
}

.picker-placeholder {
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.45);
}

.picker-arrow {
  font-size: 20rpx;
  color: rgba(0, 0, 0, 0.45);
}

/* 尺码标签 */
.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.size-tag {
  padding: 14rpx 32rpx;
  background: #f5f5f5;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.65);
  border: 1rpx solid #f0f0f0;
  transition: all 0.2s;
}

.size-tag.active {
  background: rgba(22, 119, 255, 0.08);
  color: #1677ff;
  border-color: #1677ff;
  font-weight: 500;
}

/* 图片网格 */
.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.img-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.img-thumb {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
}

.img-delete {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff4d4f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;
}

.img-delete-icon {
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
}

.img-add {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 56rpx;
  color: rgba(0, 0, 0, 0.25);
  line-height: 1;
}

/* 可移除标签 */
.removable-tag {
  display: inline-flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background: rgba(22, 119, 255, 0.08);
  border-radius: 999rpx;
  margin-bottom: 8rpx;
}

.removable-tag-text {
  font-size: 24rpx;
  color: #1677ff;
}

.removable-tag-close {
  font-size: 24rpx;
  color: #1677ff;
  margin-left: 10rpx;
  font-weight: 600;
}

/* 推荐开关 */
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-left {
  display: flex;
  align-items: center;
}

.switch-label {
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.88);
  font-weight: 500;
}

/* 提交按钮 */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #1677ff;
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  border-radius: 8rpx;
  letter-spacing: 2rpx;
}

.submit-btn::after {
  border: none;
}
</style>
