'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      router.push('/login?error=' + error)
      return
    }

    // Security: never persist tokens from URL into Storage.
    // Transitional support: if a legacy flow provides `?token=...`,
    // exchange it for an HttpOnly cookie session, then remove the token URL.
    if (!token) {
      router.push('/login')
      return
    }

    void (async () => {
      try {
        const exchange = await apiClient.post(
          API_CONFIG.AUTH.SESSION,
          { token },
          { skipAuth: true },
        )

        if (!exchange.ok) {
          router.push('/login?error=session_exchange_failed')
          return
        }

        // Optionally warm client user cache (not a secret; cookie remains HttpOnly).
        const me = await apiClient.get(API_CONFIG.AUTH.ME, { skipAuth: true })
        if (me.ok) {
          const data = await me.json()
          if (data?.success && data?.data) {
            localStorage.setItem('auth_user', JSON.stringify(data.data))
          }
        }

        window.location.replace('/')
      } catch {
        router.push('/login?error=session_exchange_failed')
      }
    })()
  }, [router, searchParams])

  return <LoadingState />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
