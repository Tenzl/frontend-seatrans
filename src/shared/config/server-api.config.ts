import { API_CONFIG } from '@/shared/config/api.config'

/** Server consumers need an absolute backend URL, separate from browser URLs. */
export function getServerApiOrigin(): string {
  const configured = (process.env.API_PROXY_TARGET || '').trim() || API_CONFIG.API_ORIGIN
  const origin = configured.replace(/\/+$/, '').replace(/\/api(?:\/v\d+)?$/, '')

  if (/^https?:\/\//i.test(origin)) return origin
  if (!configured && process.env.NODE_ENV !== 'production') return 'http://127.0.0.1:8080'
  throw new Error('API_PROXY_TARGET must be an absolute backend HTTP(S) origin.')
}

export function getServerApiUrl(): string {
  return `${getServerApiOrigin()}${API_CONFIG.API_BASE_PATH}`
}
