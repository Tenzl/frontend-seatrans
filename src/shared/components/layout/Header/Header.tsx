"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, User, LogOut, ChevronRight, AlertTriangle, Phone } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'

import NavMenu from './NavMenu'
import { menuData } from './menuData'
import { UserNav } from './UserNav'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { NotificationBell } from '@/modules/notifications/components/NotificationBell'

const COMPANY_LOGO = '/landing-image/web_Logo.png'
const COMPANY_NAME_EN = 'South East Asia Transport & Logistics J.S.C'

/**
 * Liquid-morph curve — the floating nav settles from a transparent overlay (at
 * rest, on top of the hero) into a glass pill on scroll. Slight overshoot at the
 * tail reads as a settling droplet.
 */
const MORPH =
  'transition-all duration-[1100ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none'

/**
 * Liquid-glass surface (scrolled pill): top inset highlight refracting off the
 * edge, bottom inset seal, and a blue-tinted outer diffusion for grounded depth.
 */
const GLASS =
  'shadow-[inset_0_1px_0_hsl(var(--surface-highlight)/0.5),inset_0_-1px_0_hsl(var(--foreground)/0.08),0_28px_60px_-24px_hsl(var(--primary)/0.4)]'

interface HeaderProps {
  /** Float transparently over a dark hero (home). Off = solid white bar for light pages. */
  overlay?: boolean
  /** Strip the nav + actions, leaving only the logo (used on the landing hero). */
  minimal?: boolean
}

export default function Header({ overlay = false, minimal = false }: HeaderProps = {}) {
  const { user, isAuthenticated, logout, profileComplete } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navSentinelRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const showNotifications = isAuthenticated

  // White text + scrim only while floating over the hero at the very top.
  const transparent = overlay && !isScrolled

  // Compress the header when the sentinel leaves the viewport (scrolled past 64px).
  useEffect(() => {
    const node = navSentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const handleNavigate = (path: string) => {
    setMobileOpen(false)
    router.push(path)
  }

  const flattenMenu = () => {
    const items: Array<{
      id: number
      title: string
      path?: string
      icon?: React.ComponentType<{ className?: string }>
      isParent?: boolean
      isChild?: boolean
    }> = []
    menuData.forEach((item) => {
      if (item.subMenu && item.subMenu.length > 0) {
        items.push({ ...item, isParent: true })
        item.subMenu.forEach((child) => {
          items.push({ ...child, isChild: true })
        })
      } else {
        items.push(item)
      }
    })
    return items
  }

  // Auth controls — Login text flips to white when the header is transparent.
  const renderAuthCluster = () =>
    isAuthenticated && user ? (
      <div className="flex items-center gap-2">
        {!profileComplete && (
          <Badge
            variant="outline"
            className="hidden items-center gap-1 border-warning/30 bg-warning/10 text-warning lg:flex"
          >
            <AlertTriangle className="h-3 w-3" />
            Complete profile
          </Badge>
        )}
        {showNotifications ? (
          <NotificationBell
            onNavigateToInquiries={() => handleNavigate('/dashboard?section=inquiry')}
            light={transparent}
          />
        ) : null}
        <UserNav user={user} onLogout={logout} light={transparent} />
      </div>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleNavigate('/login')}
        className={cn(
          'hidden text-sm transition-colors md:flex',
          transparent ? 'text-white hover:bg-white/10 hover:text-white' : '',
        )}
      >
        Login
      </Button>
    )

  return (
    <>
      {/* Sentinel — height = scroll threshold that triggers the compress */}
      <div
        ref={navSentinelRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-16 w-px"
      />

      <header className="fixed inset-x-0 top-0 z-50">
        {!overlay && (
          /* Light pages: full-bleed white bar at rest, dissolves into the pill on scroll */
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 border-b border-border/70 bg-background/95 backdrop-blur-sm shadow-[0_1px_0_hsl(var(--border)/0.5),0_10px_30px_-24px_hsl(var(--primary)/0.22)] transition-opacity duration-[800ms] ease-out motion-reduce:transition-none',
              isScrolled ? 'opacity-0' : 'opacity-100',
            )}
          />
        )}
        {overlay && !minimal && (
          /* Overlay (home with nav): blurred dark tint fading downward keeps the white nav legible */
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 h-[92px] bg-[rgba(5,25,60,0.34)] backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)] transition-opacity duration-[800ms] ease-out motion-reduce:transition-none',
              isScrolled ? 'opacity-0' : 'opacity-100',
            )}
          />
        )}

        {/* Single morphing surface */}
        <div
          className={cn(
            'relative flex justify-center',
            MORPH,
            isScrolled ? 'px-3 pt-2 sm:px-6' : 'px-0 pt-0',
          )}
        >
          <nav
            className={cn(
              'flex w-full items-center justify-between gap-3 border sm:gap-4',
              MORPH,
              isScrolled
                ? `max-w-4xl rounded-full border-border/80 bg-background/70 px-4 py-2 backdrop-blur-2xl sm:px-5 sm:py-2.5 ${GLASS}`
                : 'max-w-[1400px] rounded-none border-transparent bg-transparent px-4 py-3.5 sm:px-6',
            )}
          >
            {/* Brand identity — always present in the navbar */}
            <Link
              href="/"
              onClick={() => window.scrollTo(0, 0)}
              className="group flex items-center gap-2.5"
            >
              <span
                className={cn(
                  'flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5 transition-[height,width] duration-500 group-hover:scale-[1.03] motion-reduce:transition-none',
                  isScrolled ? 'h-9 w-9' : 'h-10 w-10',
                )}
              >
                <ImageWithFallback
                  src={COMPANY_LOGO}
                  alt={`${COMPANY_NAME_EN} logo`}
                  width={96}
                  height={96}
                  priority
                  sizes="40px"
                  className="h-full w-full object-contain"
                />
              </span>
              <span
                className={cn(
                  'whitespace-nowrap text-base font-bold tracking-tight transition-colors',
                  transparent ? 'text-white' : 'text-foreground',
                )}
              >
                Seatrans
              </span>
            </Link>

            {/* Actions — hidden only while the minimal landing header sits at the top */}
            {(!minimal || isScrolled) && (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="hidden md:block">
                  <NavMenu menu={menuData} light={transparent} />
                </div>

<div className="hidden md:block">{renderAuthCluster()}</div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Mở menu"
                  className={cn(
                    'transition-colors md:hidden',
                    transparent ? 'text-white hover:bg-white/10 hover:text-white' : '',
                  )}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Shared mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="mb-4 border-b pb-4 text-left">
            <SheetTitle className="flex items-center gap-2">
              <ImageWithFallback
                src={COMPANY_LOGO}
                alt={`${COMPANY_NAME_EN} logo`}
                width={80}
                height={80}
                sizes="36px"
                className="h-9 w-9 object-contain"
              />
              Seatrans
            </SheetTitle>
          </SheetHeader>

          <div className="flex h-full flex-col">
            <div className="flex flex-col space-y-1">
              {flattenMenu().map((item) => {
                if (item.isParent) {
                  return (
                    <div
                      key={item.id}
                      className="px-2 py-2 text-sm font-semibold text-muted-foreground"
                    >
                      {item.title}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.id}
                    href={item.path ?? '#'}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center justify-between rounded-md px-2 py-3 text-sm font-medium transition-colors hover:bg-accent',
                      item.isChild && 'pl-6',
                      pathname === item.path ? 'bg-accent text-primary' : 'text-foreground',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                      {item.title}
                    </span>
                    {!item.isChild && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
                  </Link>
                )
              })}
            </div>

{isAuthenticated && user ? (
              <div className="mt-auto border-t pb-8 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.fullName || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  {!profileComplete && (
                    <Button
                      variant="outline"
                      className="w-full justify-start border-warning/30 text-warning"
                      onClick={() => handleNavigate('/dashboard')}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Update profile
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-auto grid grid-cols-1 gap-2 border-t pb-8 pt-4">
                <Button variant="outline" onClick={() => handleNavigate('/login')}>
                  Log in
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
