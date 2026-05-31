'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  AppNotification,
  notificationService,
} from '@/modules/notifications/services/notificationService'

const POLL_INTERVAL_MS = 20_000

interface UseNotificationPollingOptions {
  enabled?: boolean
  onNavigateToInquiries?: () => void
}

export function useNotificationPolling(options: UseNotificationPollingOptions = {}) {
  const { enabled = true, onNavigateToInquiries } = options
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const initializedRef = useRef(false)
  const lastPollAtRef = useRef<string | null>(null)
  const seenIdsRef = useRef<Set<number>>(new Set())

  const showNewNotification = useCallback(
    (item: AppNotification) => {
      toast.success(item.title, {
        description: item.body,
        duration: 8000,
        action: onNavigateToInquiries
          ? {
              label: 'View',
              onClick: () => onNavigateToInquiries(),
            }
          : undefined,
      })
    },
    [onNavigateToInquiries],
  )

  const refresh = useCallback(async (isPoll = false) => {
    if (!enabled) return

    try {
      if (isPoll && lastPollAtRef.current) {
        const { items, unreadCount: count } = await notificationService.list({
          since: lastPollAtRef.current,
          limit: 20,
        })

        lastPollAtRef.current = new Date().toISOString()

        if (items.length > 0) {
          setNotifications((prev) => {
            const merged = [...items, ...prev]
            const byId = new Map<number, AppNotification>()
            for (const n of merged) {
              byId.set(n.id, n)
            }
            return Array.from(byId.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
          })
          setUnreadCount(count)

          for (const item of items) {
            if (!seenIdsRef.current.has(item.id)) {
              seenIdsRef.current.add(item.id)
              showNewNotification(item)
            }
          }
        } else {
          setUnreadCount(count)
        }
        return
      }

      const { items, unreadCount: count } = await notificationService.list({ limit: 20 })
      lastPollAtRef.current = new Date().toISOString()
      setNotifications(items)
      setUnreadCount(count)

      for (const item of items) {
        seenIdsRef.current.add(item.id)
      }

      if (!initializedRef.current) {
        initializedRef.current = true
      }
    } catch {
      // Ignore transient polling errors
    } finally {
      setIsLoading(false)
    }
  }, [enabled, showNewNotification])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    void refresh(false)
    const timer = window.setInterval(() => {
      void refresh(true)
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [enabled, refresh])

  const markAsRead = useCallback(async (id: number) => {
    await notificationService.markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n,
      ),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead()
    const now = new Date().toISOString()
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })))
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: () => refresh(false),
  }
}
