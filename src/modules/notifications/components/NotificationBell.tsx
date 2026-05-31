'use client'

import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'
import { useNotificationPolling } from '@/modules/notifications/hooks/useNotificationPolling'

interface NotificationBellProps {
  onNavigateToInquiries?: () => void
}

export function NotificationBell({ onNavigateToInquiries }: NotificationBellProps) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotificationPolling({ onNavigateToInquiries })

  const handleOpenItem = async (id: number, isUnread: boolean) => {
    if (isUnread) {
      await markAsRead(id)
    }
    onNavigateToInquiries?.()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative shrink-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => void markAllAsRead()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y">
              {notifications.map((item) => {
                const isUnread = !item.readAt
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full px-3 py-3 text-left transition-colors hover:bg-muted/60',
                        isUnread && 'bg-primary/5',
                      )}
                      onClick={() => void handleOpenItem(item.id, isUnread)}
                    >
                      <div className="flex items-start gap-2">
                        <p className="flex-1 text-sm font-medium leading-snug">{item.title}</p>
                        {isUnread ? (
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            New
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                      <p className="mt-1.5 text-[10px] tabular-nums text-muted-foreground/80">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
