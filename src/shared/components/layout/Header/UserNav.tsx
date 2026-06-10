"use client"

import { useState, useEffect } from 'react'
import { User as UserIcon, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { User } from '@/shared/types/dashboard'

interface UserNavProps {
  user: User
  onLogout: () => void
  light?: boolean
}

export function UserNav({ user, onLogout, light }: UserNavProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const derivedGroup = user.role
    ? (user.role.includes('ADMIN') || user.role.includes('EMPLOYEE') ? 'INTERNAL' : 'EXTERNAL')
    : undefined
  const roleGroup = user.roleGroup ?? derivedGroup

  const handleNavigate = (path: string) => {
    setShowDropdown(false)
    router.push(path)
  }

  const isInternal = roleGroup === 'INTERNAL'
  const isExternal = roleGroup === 'EXTERNAL'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-dropdown')) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <div
      className="relative user-dropdown"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <button className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${light ? 'hover:bg-white/10 text-white' : 'hover:bg-accent'}`}>
        <div className={`flex items-center justify-center w-7 h-7 rounded-full ${light ? 'bg-white/15' : 'bg-primary/10'}`}>
          <UserIcon className={`w-4 h-4 ${light ? 'text-white' : 'text-primary'}`} />
        </div>
        <span className="hidden sm:inline text-sm font-medium">
          {user.fullName || user.email}
        </span>
        <ChevronDown className={`w-4 h-4 ${light ? 'text-white/70' : 'text-muted-foreground'}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <div className="bg-card border shadow-lg rounded-lg overflow-hidden min-w-[240px]">
            <div className="px-4 py-3 border-b bg-muted text-sm">
              <p className="font-medium text-foreground">
                {user.fullName || user.email}
              </p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>

            {isExternal && (
              <button
                onClick={() => handleNavigate('/dashboard')}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-accent text-foreground flex items-center space-x-2 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>User Dashboard</span>
              </button>
            )}

            {isInternal && (
              <button
                onClick={() => handleNavigate('/admin')}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-accent text-foreground flex items-center space-x-2 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}

            <button
              onClick={() => {
                onLogout()
                setShowDropdown(false)
              }}
              className="block w-full px-4 py-3 text-left text-sm hover:bg-accent text-destructive flex items-center space-x-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
