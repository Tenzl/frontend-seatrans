import type { Port } from '@/modules/logistics/services/portService'

/**
 * Spec: `{PORT_NAME_UPPER}, {COUNTRY_CODE} ({PORT_CODE})` e.g. `QUI NHON PORT, VN (VNIUH)`.
 * If `code` is missing: `{NAME}, {CC}` or name only if no country.
 */
export function formatPortLabel(port: Pick<Port, 'name'> & Partial<Pick<Port, 'countryCode' | 'code'>>): string {
  const nameUpper = (port.name || '').trim().toUpperCase()
  const cc = (port.countryCode || '').trim().toUpperCase()
  const code = (port.code || '').trim().toUpperCase()
  if (code && cc) {
    return `${nameUpper}, ${cc} (${code})`
  }
  if (cc) {
    return `${nameUpper}, ${cc}`
  }
  return nameUpper || '—'
}
