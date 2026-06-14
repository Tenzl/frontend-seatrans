'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

/**
 * Pages that open on the full-bleed dark hero get a transparent, white-text
 * header floating over it — same as the landing page:
 *   - solution detail pages (e.g. /services/shipping-agency)
 *   - /contact and the /insights listing
 * Gallery subroutes (/services/<slug>/gallery), article pages (/insights/<id>),
 * port-information and other light pages keep the solid header.
 */
const hasDarkHero = (pathname: string) =>
  /^\/services\/[^/]+$/.test(pathname) ||
  pathname === '/contact' ||
  pathname === '/insights'

export default function PublicHeader() {
  const pathname = usePathname() ?? ''
  return <Header overlay={hasDarkHero(pathname)} />
}
