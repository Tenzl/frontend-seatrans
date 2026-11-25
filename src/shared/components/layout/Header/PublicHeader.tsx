'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

/**
 * Contact opens on a dark hero and uses the same white-text overlay as Home.
 * Other public pages use a translucent light surface with room for content.
 */
const hasDarkHero = (pathname: string) => pathname === '/contact'

export default function PublicHeader() {
  const pathname = usePathname() ?? ''
  return <Header overlay={hasDarkHero(pathname)} />
}
