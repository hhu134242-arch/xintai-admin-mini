import { config } from '@/config'

/** HTTP methods */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** Request options */
interface RequestOptions {
  url: string
  method?: HttpMethod
  data?: any
  header?: Record<string, string>
  /** Skip auth header (e.g. for public endpoints) */
  noAuth?: boolean
}

/** Standard API response envelope */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * Unified request wrapper around uni.request.
 * All requests go through the backend proxy at xintai.fun/api/...
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, noAuth = false } = options

  const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }

  if (!noAuth) {
    headers['Authorization'] = `Bearer ${config.supabaseServiceKey}`
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method,
      data,
      header: headers,
      timeout: 30000,
      success: (res) => {
        // Handle HTTP errors
        if (res.statusCode >= 400) {
          const errMsg = (res.data as any)?.message || `HTTP ${res.statusCode}`
          console.error(`[API Error] ${method} ${url}:`, errMsg)
          reject(new Error(errMsg))
          return
        }

        // If response has standard envelope, unwrap it
        const body = res.data as any
        if (body && typeof body === 'object' && 'data' in body && 'code' in body) {
          if (body.code !== 0 && body.code !== 200) {
            reject(new Error(body.message || 'Request failed'))
            return
          }
          resolve(body.data as T)
        } else {
          // Raw response (no envelope)
          resolve(body as T)
        }
      },
      fail: (err) => {
        console.error(`[API Fail] ${method} ${url}:`, err.errMsg)
        reject(new Error(err.errMsg || 'Network request failed'))
      },
    })
  })
}

/** GET request shortcut */
export function get<T = any>(url: string, params?: Record<string, any>, opts?: Partial<RequestOptions>): Promise<T> {
  // Build query string from params
  let finalUrl = url
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    if (qs) {
      finalUrl += `?${qs}`
    }
  }
  return request<T>({ url: finalUrl, method: 'GET', ...opts })
}

/** POST request shortcut */
export function post<T = any>(url: string, data?: any, opts?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'POST', data, ...opts })
}

/** PUT request shortcut */
export function put<T = any>(url: string, data?: any, opts?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'PUT', data, ...opts })
}

/** PATCH request shortcut */
export function patch<T = any>(url: string, data?: any, opts?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'PATCH', data, ...opts })
}

/** DELETE request shortcut */
export function del<T = any>(url: string, opts?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'DELETE', ...opts })
}
