import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Inquiry {
  id: string
  customer_name: string
  customer_company: string
  product_id: string
  product_thumbnail: string
  message: string
  status: 'pending' | 'replied' | 'closed'
  is_read: boolean
  created_at: string
  updated_at: string
}

export const useInquiryStore = defineStore('inquiry', () => {
  const list = ref<Inquiry[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchList(params?: any) {
    loading.value = true
    try {
      // Will be replaced with real API call
    } catch (e) {
      console.error('Failed to fetch inquiries', e)
    } finally {
      loading.value = false
    }
  }

  return { list, total, loading, fetchList }
})
