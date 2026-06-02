/** Inquiry status options */
export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived'

/** Source of the inquiry */
export type InquirySource = 'web' | 'wechat' | 'phone' | 'email' | 'other'

/** Individual product item within an inquiry */
export interface InquiryItem {
  product_id: string
  product_name: string
  product_image: string
  selected_size: string
  selected_color: string
  quantity: number
}

/** A note added to an inquiry */
export interface InquiryNote {
  id: string
  inquiry_id: string
  content: string
  created_at: string
}

/** Raw inquiry row from Supabase */
export interface DbInquiry {
  id: string
  name: string
  email: string
  company: string
  country: string
  quantity: number
  message: string
  source: InquirySource
  status: InquiryStatus
  created_at: string
  items: InquiryItem[]
  notes?: InquiryNote[]
}

/** Inquiry type used throughout the app */
export type Inquiry = DbInquiry

/** Params for fetching inquiries list */
export interface InquiryListParams {
  page?: number
  pageSize?: number
  status?: InquiryStatus
  search?: string
  orderBy?: keyof DbInquiry
  orderDirection?: 'asc' | 'desc'
}

/** Response from paginated inquiry list */
export interface InquiryListResponse {
  data: Inquiry[]
  total: number
  page: number
  pageSize: number
}
