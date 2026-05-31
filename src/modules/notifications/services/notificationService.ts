import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'

export interface AppNotification {
  id: number
  userId: number
  inquiryId: number | null
  type: string
  title: string
  body: string
  metadata: {
    inquiryId?: number
    serviceType?: string | null
    serviceSlug?: string | null
    status?: string
  } | null
  readAt: string | null
  createdAt: string
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T | null
}

interface NotificationListPayload {
  items: AppNotification[]
  unreadCount: number
}

async function parseEnvelope<T>(response: Response): Promise<T | null> {
  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !payload.success) {
    return null
  }
  return payload.data
}

export const notificationService = {
  async list(options?: {
    unreadOnly?: boolean
    limit?: number
    since?: string
  }): Promise<NotificationListPayload> {
    const params = new URLSearchParams()
    if (options?.unreadOnly) params.set('unreadOnly', 'true')
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.since) params.set('since', options.since)

    const qs = params.toString()
    const endpoint = qs
      ? `${API_CONFIG.NOTIFICATIONS.BASE}?${qs}`
      : API_CONFIG.NOTIFICATIONS.BASE

    const response = await apiClient.get(endpoint)
    const data = await parseEnvelope<NotificationListPayload>(response)
    return data ?? { items: [], unreadCount: 0 }
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get(API_CONFIG.NOTIFICATIONS.UNREAD_COUNT)
    const data = await parseEnvelope<{ count: number }>(response)
    return data?.count ?? 0
  },

  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(API_CONFIG.NOTIFICATIONS.MARK_READ(id))
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch(API_CONFIG.NOTIFICATIONS.READ_ALL)
  },
}
