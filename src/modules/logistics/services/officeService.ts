import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse } from '@/shared/types/api.types'

export interface Office {
  id: number
  provinceId: number | null
  name: string
  city: string | null
  region: string | null
  address: string
  mapUrl: string | null
  latitude: string | null
  longitude: string | null
  coordinates: { lat: string | null; lng: string | null }
  manager: {
    name: string | null
    title: string | null
    mobile: string | null
    email: string | null
  }
  isHeadquarter: boolean
  isActive: boolean
}

export const officeService = {
  async getActiveOffices(signal?: AbortSignal): Promise<Office[]> {
    const response = await apiClient.get<ApiResponse<Office[]>>(
      API_CONFIG.OFFICES.ACTIVE,
      { skipAuth: true, cache: 'no-store', signal }
    )
    if (!response.ok) throw new Error('Could not load offices')

    const result = await response.json()
    if (result.success === false || !Array.isArray(result.data)) {
      throw new Error('Invalid offices response')
    }
    return result.data
  },
}

export function getOfficeMapQuery(office: Office): string {
  const rawLatitude = office.coordinates?.lat ?? office.latitude
  const rawLongitude = office.coordinates?.lng ?? office.longitude
  if (rawLatitude?.trim() && rawLongitude?.trim()) {
    const latitude = Number(rawLatitude)
    const longitude = Number(rawLongitude)
    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
    ) {
      return `${latitude},${longitude}`
    }
  }
  return office.address?.trim() || ''
}
