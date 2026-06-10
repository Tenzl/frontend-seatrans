import type { DashboardSection } from '@/shared/config/dashboard-registry'

export function buildDashboardUrl(
  pathname: string,
  section: DashboardSection,
  extra?: Record<string, string | number | null | undefined>,
): string {
  const params = new URLSearchParams()
  params.set('section', section)

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined || value === null || value === '') continue
      params.set(key, String(value))
    }
  }

  const qs = params.toString()
  return qs ? `${pathname}?${qs}` : pathname
}
