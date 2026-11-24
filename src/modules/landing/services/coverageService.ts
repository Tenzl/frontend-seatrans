import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse, PageResponse } from '@/shared/types/api.types'
import { apiClient } from '@/shared/utils/apiClient'
import { getProvinceCoordinates } from '@/shared/utils/provinceCoordinates'

interface CoverageProvinceDto {
  id: number
  name: string
  displayName: string | null
  isActive?: boolean
}

interface CoveragePortDto {
  id: number
  name: string
  provinceId: number | null
  isActive: boolean
  inCharge: boolean
}

interface CoveragePortOptionDto {
  id: number
  name: string
}

export interface CoveragePort {
  id: number
  name: string
}

interface CoverageProvinceBase {
  id: number
  name: string
  ports: CoveragePort[]
}

export interface MappedCoverageProvince extends CoverageProvinceBase {
  coordinates: [number, number]
}

export type UnmappedCoverageProvince = CoverageProvinceBase

export interface CoverageNetwork {
  mapped: MappedCoverageProvince[]
  unmapped: UnmappedCoverageProvince[]
}

async function getActiveProvinces(signal?: AbortSignal): Promise<CoverageProvinceDto[]> {
  const response = await apiClient.get<ApiResponse<CoverageProvinceDto[]>>(
    API_CONFIG.PROVINCES.ACTIVE,
    { skipAuth: true, cache: 'no-store', signal }
  )
  if (!response.ok) throw new Error('Could not load provinces')

  const result = await response.json()
  if (result.success === false || !Array.isArray(result.data)) {
    throw new Error('Invalid provinces response')
  }
  return result.data
}

async function getAllActivePorts(signal?: AbortSignal): Promise<CoveragePortDto[]> {
  const ports: CoveragePortDto[] = []

  for (let page = 0; ; page += 1) {
    const response = await apiClient.get<ApiResponse<PageResponse<CoveragePortDto> & { hasNext: boolean }>>(
      `${API_CONFIG.PORTS.ACTIVE}?page=${page}&size=100`,
      { skipAuth: true, cache: 'no-store', signal }
    )
    if (!response.ok) throw new Error('Could not load ports')

    const result = await response.json()
    if (
      result.success === false ||
      !Array.isArray(result.data?.content) ||
      typeof result.data.hasNext !== 'boolean'
    ) {
      throw new Error('Invalid ports response')
    }

    ports.push(...result.data.content)
    if (!result.data.hasNext) return ports
  }
}

async function getInChargePorts(signal?: AbortSignal): Promise<CoveragePortDto[]> {
  const response = await apiClient.get<ApiResponse<CoveragePortOptionDto[]>>(
    `${API_CONFIG.PORTS.OPTIONS}?inChargeOnly=true&limit=50`,
    { skipAuth: true, cache: 'no-store', signal }
  )
  if (!response.ok) throw new Error('Could not load ports')

  const result = await response.json()
  if (
    result.success === false ||
    !Array.isArray(result.data) ||
    result.data.some((option) => !Number.isInteger(option.id) || option.id <= 0)
  ) {
    throw new Error('Invalid ports response')
  }

  // Options are capped at 50. A full page might hide more in-charge ports.
  if (result.data.length === 50) return getAllActivePorts(signal)
  if (result.data.length === 0) return []

  const options = result.data
  const ports = new Array<CoveragePortDto>(options.length)
  let nextIndex = 0

  const loadDetails = async () => {
    while (nextIndex < options.length) {
      const index = nextIndex++
      const option = options[index]
      const detailResponse = await apiClient.get<ApiResponse<CoveragePortDto>>(
        API_CONFIG.PORTS.BY_ID(option.id),
        { skipAuth: true, cache: 'no-store', signal }
      )
      if (!detailResponse.ok) throw new Error('Could not load port details')

      const detail = await detailResponse.json()
      if (detail.success === false || detail.data?.id !== option.id) {
        throw new Error('Invalid port details response')
      }
      ports[index] = detail.data
    }
  }

  await Promise.all(Array.from({ length: Math.min(6, options.length) }, loadDetails))
  return ports
}

export function buildCoverageNetwork(
  provinces: CoverageProvinceDto[],
  ports: CoveragePortDto[]
): CoverageNetwork {
  const portsByProvince = new Map<number, CoveragePort[]>()

  for (const port of ports) {
    if (
      port.isActive !== true ||
      port.inCharge !== true ||
      !Number.isInteger(port.provinceId) ||
      (port.provinceId ?? 0) <= 0 ||
      !port.name?.trim()
    ) continue

    const provinceId = port.provinceId as number
    const provincePorts = portsByProvince.get(provinceId) ?? []
    provincePorts.push({ id: port.id, name: port.name.trim() })
    portsByProvince.set(provinceId, provincePorts)
  }

  const mapped: MappedCoverageProvince[] = []
  const unmapped: UnmappedCoverageProvince[] = []

  for (const province of provinces) {
    if (province.isActive === false) continue
    const provincePorts = portsByProvince.get(province.id)
    if (!provincePorts?.length) continue

    const name = province.displayName?.trim() || province.name?.trim()
    if (!name) continue

    const portsForDisplay = provincePorts.sort((a, b) => a.name.localeCompare(b.name))
    const coordinates = [province.displayName, province.name]
      .filter((candidate): candidate is string => Boolean(candidate?.trim()))
      .map(getProvinceCoordinates)
      .find(([longitude, latitude]) => longitude !== 0 && latitude !== 0)

    if (coordinates) {
      mapped.push({ id: province.id, name, coordinates, ports: portsForDisplay })
    } else {
      unmapped.push({ id: province.id, name, ports: portsForDisplay })
    }
  }

  return { mapped, unmapped }
}

export async function loadCoverage(signal?: AbortSignal): Promise<CoverageNetwork> {
  const provinces = await getActiveProvinces(signal)
  const ports = await getInChargePorts(signal)
  return buildCoverageNetwork(provinces, ports)
}
