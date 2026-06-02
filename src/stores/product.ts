import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Product {
  id: string
  name_en: string
  name_cn: string
  slug: string
  description_en: string
  description_cn: string
  category: string
  price: number
  moq: number
  sizes: string[]
  colors: string[]
  images: string[]
  tags: string[]
  freight_links: string
  featured: boolean
  created_at: string
  updated_at: string
}

export const useProductStore = defineStore('product', () => {
  const list = ref<Product[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchList(params?: any) {
    loading.value = true
    try {
      // Will be replaced with real API call
      // const res = await productApi.getList(params)
      // list.value = res.data
      // total.value = res.total
    } catch (e) {
      console.error('Failed to fetch products', e)
    } finally {
      loading.value = false
    }
  }

  return { list, total, loading, fetchList }
})
