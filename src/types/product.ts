/** Raw product row from Supabase database */
export interface DbProduct {
  id: string
  name: string
  name_cn: string
  description: string
  description_cn: string
  price: number
  images: string[]
  category: string
  category_cn: string
  sizes: string[]
  colors: string[]
  moq: number
  featured: boolean
  tags: string[]
  tags_cn: string[]
  slug: string
  freight_links: string[]
  created_at: string
  updated_at: string
}

/** Product type used throughout the app (same shape, explicit type) */
export type Product = DbProduct

/** Params for fetching products list */
export interface ProductListParams {
  page?: number
  pageSize?: number
  category?: string
  search?: string
  featured?: boolean
  orderBy?: keyof DbProduct
  orderDirection?: 'asc' | 'desc'
}

/** Response from paginated product list */
export interface ProductListResponse {
  data: Product[]
  total: number
  page: number
  pageSize: number
}

/** Payload for creating a product (id is server-generated) */
export type CreateProductPayload = Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>

/** Payload for updating a product (all fields optional except partial data) */
export type UpdateProductPayload = Partial<Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>>
