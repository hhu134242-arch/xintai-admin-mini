import { get, post, put, del } from './request'
import type { Product, ProductListResponse, CreateProductPayload, UpdateProductPayload } from '@/types/product'

const API_PREFIX = '/api/products'

/**
 * Fetch a paginated list of products
 */
export function fetchProducts(params?: {
  page?: number
  pageSize?: number
  category?: string
  search?: string
  featured?: boolean
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}): Promise<ProductListResponse> {
  return get<ProductListResponse>(API_PREFIX, params)
}

/**
 * Fetch a single product by ID
 */
export function fetchProductById(id: string): Promise<Product> {
  return get<Product>(`${API_PREFIX}/${id}`)
}

/**
 * Create a new product
 */
export function createProduct(data: CreateProductPayload): Promise<Product> {
  return post<Product>(API_PREFIX, data)
}

/**
 * Update an existing product
 */
export function updateProduct(id: string, data: UpdateProductPayload): Promise<Product> {
  return put<Product>(`${API_PREFIX}/${id}`, data)
}

/**
 * Delete a product by ID
 */
export function deleteProduct(id: string): Promise<void> {
  return del<void>(`${API_PREFIX}/${id}`)
}
