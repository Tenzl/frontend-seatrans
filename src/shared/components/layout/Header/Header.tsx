"use client"

import { memo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, Ship, User, LogOut, ChevronRight, AlertTriangle } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'

import NavMenu from './NavMenu'
import { menuData } from './menuData'
import { UserNav } from './UserNav'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

/**
 * Liquid-drop transition — ease-out-back curve produces a water-droplet
 * settle: target dimension is briefly overshot, then springs back. Pair with
 * a longer duration so the overshoot reads as deliberate. `motion-reduce`
 * disables the morph for users who request reduced motion.
 */
const LIQUID =
  'transition-all duration-[1100ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none'

/**
 * Liquid-glass surface — pre-composed shadow strings for each morph state.
 * Three layers, **same count/order** in both states so the browser interpolates
 * shadow-by-shadow during the morph instead of cross-fading (which looks dead):
 *   1. Top inset highlight   → light refracting off the glass edge.
 *   2. Bottom inset seal     → defines the bottom of the pill against the bg.
 *   3. Outer diffusion shadow → tinted to the page's blue accent for depth.
 *
 * The TOP state intentionally keeps the outer diffusion almost invisible so the
 * pill reads as a "resting droplet" — the diffusion only ramps once scrolled,
 * giving the pill a clear "compressed and grounded" feel.
 */
const GLASS_TOP =
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_hsla(217,33%,17%,0.02),0_4px_18px_-10px_hsla(217,30%,30%,0.12)]'
const GLASS_SCROLLED =
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_hsla(217,33%,17%,0.08),0_28px_60px_-24px_hsla(217,45%,35%,0.4)]'

/**
 * Perpetual brand mark — Ship icon bobs gently as if floating on water.
 * Isolated + memoized per skill guardrail: never trigger re-renders in the
 * parent layout, never animate inside the morphing nav transition pipeline.
 */
const FloatingShip = memo(function FloatingShip({ scaledDown }: { scaledDown: boolean }) {
  const reducedMotion = useReducedMotion()
  return (
    <div
      className={cn(
        'rounded-lg bg-primary/10 p-1.5 transition-[transform,background-color] duration-[900ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-primary/20 motion-reduce:transition-none',
        scaledDown ? 'scale-90' : 'scale-100',
      )}
    >
      <motion.div
        animate={reducedMotion ? { y: 0 } : { y: [0, -1.5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
      >
        <Ship className="h-5 w-5 text-primary" strokeWidth={1.5} />
      </motion.div>
    </div>
  )
})

export default function Header() {
  const { user, isAuthenticated, logout, profileComplete } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navSentinelRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Liquid-drop island: morph to compact state when sentinel leaves viewport
  // (i.e. user has scrolled past the first 64px), morph back when it returns.
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

  return (
    <>
      {/* Sentinel for liquid-drop morph (height = scroll trigger threshold) */}
      <div
        ref={navSentinelRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-16 w-px"
      />

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 flex justify-center px-3 sm:px-6',
          LIQUID,
          isScrolled ? 'pt-1.5 sm:pt-2' : 'pt-4 sm:pt-6',
        )}
      >
        <nav
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-full border px-4 py-2 backdrop-blur-2xl sm:gap-4 sm:px-6 sm:py-2.5 [transform-origin:50%_0%]',
            LIQUID,
            isScrolled
              ? `max-w-4xl scale-[0.97] border-border/80 bg-background/95 ${GLASS_SCROLLED}`
              : `max-w-6xl scale-100 border-border/35 bg-background/55 ${GLASS_TOP}`,
          )}
        >
          <div className={cn('flex items-center', LIQUID, isScrolled ? 'gap-5' : 'gap-8')}>
            <Link
              href="/"
              className="group flex items-center gap-2 active:scale-[0.98]"
              onClick={() => window.scrollTo(0, 0)}
            >
              <FloatingShip scaledDown={isScrolled} />
              <span
                className={cn(
                  'font-bold tracking-tight',
                  LIQUID,
                  isScrolled ? 'text-base' : 'text-lg',
                )}
              >
                Seatrans
              </span>
            </Link>

            <div className="hidden md:block">
              <NavMenu menu={menuData} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {!profileComplete && (
                    <Badge
                      variant="outline"
                      className="hidden items-center gap-1 border-amber-200 bg-amber-50 text-amber-700 lg:flex"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Complete profile
                    </Badge>
                  )}
                  <UserNav user={user} onLogout={logout} />
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden text-sm md:flex"
                    onClick={() => handleNavigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="hover-lift rounded-full text-sm"
                    onClick={() => handleNavigate('/signup')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="text-left border-b pb-4 mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Ship className="h-6 w-6 text-primary" />
                    Seatrans
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full">
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
                            'flex items-center justify-between px-2 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent',
                            item.isChild && 'pl-6',
                            pathname === item.path
                              ? 'bg-accent text-primary'
                              : 'text-foreground'
                          )}
                        >
                          <span className="flex items-center gap-3">
                            {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                            {item.title}
                          </span>
                          {!item.isChild && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </Link>
                      )
                    })}
                  </div>

                  {isAuthenticated && user ? (
                    <div className="mt-auto pt-4 border-t pb-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.fullName || 'User'}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                        {!profileComplete && (
                          <Button
                            variant="outline"
                            className="w-full justify-start border-amber-200 text-amber-700"
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
                    <div className="mt-auto pt-4 border-t pb-8 grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => handleNavigate('/login')}>
                        Log in
                      </Button>
                      <Button onClick={() => handleNavigate('/signup')}>Register</Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
    </>
  )
}
