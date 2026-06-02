/** Application configuration */
export const config = {
  /** Supabase project URL */
  supabaseUrl: 'https://uvrjamxprtloyfyolyqj.supabase.co',

  /** Supabase service role key (for admin operations) */
  supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cmphbXhwcnRsb3lmeW9seXFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyMjIxNiwiZXhwIjoyMDk1Njk4MjE2fQ.V66iJSI5vE3pALL-XM_zYFWfypa5Ys1qeldyNC2IByM',

  /** Backend API base URL */
  apiBaseUrl: 'https://xintai.fun',

  /** App name */
  appName: 'XinTai Admin',

  /** Storage keys */
  storageKeys: {
    authToken: 'auth_token',
    refreshToken: 'refresh_token',
    userInfo: 'user_info',
  },
} as const

export type Config = typeof config
