import { get, post } from './request'
import type { Inquiry, InquiryListResponse, InquiryStatus } from '@/types/inquiry'

const API_PREFIX = '/api/inquiries'

/**
 * Fetch a paginated list of inquiries
 */
export function fetchInquiries(params?: {
  page?: number
  pageSize?: number
  status?: InquiryStatus
  search?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}): Promise<InquiryListResponse> {
  return get<InquiryListResponse>(API_PREFIX, params)
}

/**
 * Fetch a single inquiry by ID
 */
export function fetchInquiryById(id: string): Promise<Inquiry> {
  return get<Inquiry>(`${API_PREFIX}/${id}`)
}

/**
 * Add a note to an inquiry
 */
export function addNote(inquiryId: string, content: string): Promise<void> {
  return post<void>(`${API_PREFIX}/${inquiryId}/notes`, { content })
}
