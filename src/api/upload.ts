import { config } from '@/config'

interface UploadResult {
  url: string
  path: string
}

/**
 * Upload an image to Supabase Storage via the backend proxy.
 *
 * @param filePath - Local file path from uni.chooseImage / uni.chooseMedia
 * @returns The public URL of the uploaded image
 */
export function uploadImage(filePath: string): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    uni.uploadFile({
      url: `${config.apiBaseUrl}/api/upload`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${config.supabaseServiceKey}`,
      },
      success: (res) => {
        if (res.statusCode >= 400) {
          let errMsg = `Upload failed (${res.statusCode})`
          try {
            const body = JSON.parse(res.data as string)
            errMsg = body.message || errMsg
          } catch {
            // ignore parse error
          }
          reject(new Error(errMsg))
          return
        }

        try {
          const body = JSON.parse(res.data as string)
          // Expect { data: { url: string, path: string } } or { url: string }
          const result = body.data || body
          resolve({
            url: result.url,
            path: result.path || '',
          })
        } catch {
          reject(new Error('Failed to parse upload response'))
        }
      },
      fail: (err) => {
        console.error('[Upload Error]', err.errMsg)
        reject(new Error(err.errMsg || 'Upload failed'))
      },
    })
  })
}
