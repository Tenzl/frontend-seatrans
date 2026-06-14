'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import {
  Clock,
  Shield,
  Headphones,
  X,
  Anchor,
  Plus
} from 'lucide-react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { getProvinceCoordinates } from '@/shared/utils/provinceCoordinates'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { MorphingPopover, MorphingPopoverContent } from '@/shared/components/ui/morphing-popover'

// Module-level cache — avoids re-downloading/re-parsing the geo JSON on each mount
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let geoDataCache: any = null

interface ProvinceApiResponse {
  id: number
  name: string
  displayName?: string
  ports?: string[]
}

interface MapProvince {
  id: number
  name: string
  coordinates: [number, number]
  ports: string[]
  renderRight: boolean
}

// Pure helper — compute once at map time, not on every render
function computeRenderRight(name: string): boolean {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return (
    normalized.includes('ho chi minh') ||
    normalized.includes('tp hcm') ||
    normalized.includes('dong nai') ||
    normalized.includes('quang ninh') ||
    normalized.includes('quang ngai')
  )
}

// Geography layer never changes after geoData loads — memo prevents re-render on hover
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MapGeographies = memo(function MapGeographies({ geoData }: { geoData: any }) {
  return (
    <Geographies geography={geoData}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill="hsl(var(--primary) / 0.12)"
            stroke="hsl(var(--primary))"
            strokeWidth={0.5}
            style={{
              default: { outline: 'none' },
              hover: { outline: 'none', fill: 'hsl(var(--primary) / 0.22)' },
              pressed: { outline: 'none' },
            }}
          />
        ))
      }
    </Geographies>
  )
})

function PopupBody({
  province,
  onPortSelect,
}: {
  province: MapProvince
  onPortSelect: (provinceName: string, portName: string) => void
}) {
  return (
    <div className="bg-card rounded-xl shadow-xl border p-4 min-w-[220px]">
      <div className="text-base font-bold text-foreground uppercase tracking-wide border-b pb-2 mb-2">
        {province.name}
      </div>
      <div className="space-y-2">
        {province.ports.map((port, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <Anchor className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-[15px] font-medium text-muted-foreground leading-tight text-left flex-1">
              {port}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPortSelect(province.name, port)
              }}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-primary/30 text-primary hover:bg-primary/10"
              aria-label={`View details for ${port}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ProvinceMarkerProps {
  province: MapProvince
  isActive: boolean
  /** Render the radar ripple only while the map is on screen — stops the SMIL loop when scrolled away */
  animate: boolean
  onEnter: (id: number) => void
  onLeave: (id: number) => void
  onClick: (id: number) => void
  onPopupEnter: (id: number) => void
  onPopupLeave: (id: number) => void
  onPortSelect: (provinceName: string, portName: string) => void
}

// Each marker only re-renders when its own isActive changes (not on other markers' hover)
const ProvinceMarker = memo(function ProvinceMarker({
  province,
  isActive,
  animate,
  onEnter,
  onLeave,
  onClick,
  onPopupEnter,
  onPopupLeave,
  onPortSelect,
}: ProvinceMarkerProps) {
  const handleEnter = useCallback(() => onEnter(province.id), [province.id, onEnter])
  const handleLeave = useCallback(() => onLeave(province.id), [province.id, onLeave])
  const handleClick = useCallback(() => onClick(province.id), [province.id, onClick])
  const handlePopupEnter = useCallback(() => onPopupEnter(province.id), [province.id, onPopupEnter])
  const handlePopupLeave = useCallback(() => onPopupLeave(province.id), [province.id, onPopupLeave])

  return (
    <Marker coordinates={province.coordinates}>
      <g
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        className="cursor-pointer"
      >
        {/* Radar ripple — GPU-composited CSS scale, only while the map is on screen */}
        {animate && (
          <circle
            className="map-ping"
            r={8}
            fill="none"
            stroke="hsl(var(--success))"
            strokeWidth={1.5}
          />
        )}

        {/* Main Marker Circle */}
        <circle
          r={8}
          fill="hsl(var(--success))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
          className="transition-transform hover:scale-110"
        />

        {isActive && (
          <foreignObject
            x={province.renderRight ? 20 : -300}
            y={-95}
            width={280}
            height={190}
            className="overflow-visible"
          >
            <div
              className="flex flex-row items-center justify-end h-full animate-in fade-in zoom-in-95 duration-200"
              onMouseEnter={handlePopupEnter}
              onMouseLeave={handlePopupLeave}
            >
              {province.renderRight ? (
                <>
                  <div className="w-4 h-4 bg-card rotate-45 transform translate-x-2 shadow-sm border-l border-b z-10" />
                  <PopupBody province={province} onPortSelect={onPortSelect} />
                </>
              ) : (
                <>
                  <PopupBody province={province} onPortSelect={onPortSelect} />
                  <div className="w-4 h-4 bg-card rotate-45 transform -translate-x-2 shadow-sm border-t border-r z-10" />
                </>
              )}
            </div>
          </foreignObject>
        )}
      </g>
    </Marker>
  )
})

export function Coverage() {
  const [provinces, setProvinces] = useState<MapProvince[]>([])
  const [activeProvince, setActiveProvince] = useState<number | null>(null)
  const [selectedPort, setSelectedPort] = useState<{ provinceName: string; portName: string } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<any | null>(null)
  const [ref, isInView] = useIntersectionObserver()
  // Separate toggling observer (once: false) gates the marker ripple so the SMIL
  // animation loops only while the map is actually on screen.
  const [mapViewRef, mapInView] = useIntersectionObserver({ once: false, threshold: 0 })

  const hoverHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref (not state) — only used to guard the hide timer, no render needed
  const popupHoveredRef = useRef<number | null>(null)

  const clearHoverHideTimeout = useCallback(() => {
    if (hoverHideTimeoutRef.current) {
      clearTimeout(hoverHideTimeoutRef.current)
      hoverHideTimeoutRef.current = null
    }
  }, [])

  const scheduleHide = useCallback((id: number, delay = 120) => {
    clearHoverHideTimeout()
    hoverHideTimeoutRef.current = setTimeout(() => {
      setActiveProvince((current) => (current === id ? null : current))
    }, delay)
  }, [clearHoverHideTimeout])

  const handleEnter = useCallback((id: number) => {
    clearHoverHideTimeout()
    setActiveProvince(id)
  }, [clearHoverHideTimeout])

  const handleLeave = useCallback((id: number) => {
    if (popupHoveredRef.current === id) return
    scheduleHide(id)
  }, [scheduleHide])

  const handleClick = useCallback((id: number) => {
    clearHoverHideTimeout()
    setActiveProvince(id)
  }, [clearHoverHideTimeout])

  const handlePopupEnter = useCallback((id: number) => {
    popupHoveredRef.current = id
    clearHoverHideTimeout()
  }, [clearHoverHideTimeout])

  const handlePopupLeave = useCallback((id: number) => {
    popupHoveredRef.current = null
    scheduleHide(id, 80)
  }, [scheduleHide])

  const handlePortSelect = useCallback((provinceName: string, portName: string) => {
    setSelectedPort({ provinceName, portName })
  }, [])

  useEffect(() => {
    return () => clearHoverHideTimeout()
  }, [clearHoverHideTimeout])

  useEffect(() => {
    let ignore = false

    const loadGeoData = async () => {
      if (geoDataCache) {
        if (!ignore) setGeoData(geoDataCache)
        return
      }
      try {
        const response = await fetch('/geo/newvn.json')
        if (ignore) return
        if (!response.ok) {
          console.error('Failed to load map data', response.status)
          return
        }
        const data = await response.json()
        if (ignore) return
        geoDataCache = data
        setGeoData(data)
      } catch (error) {
        if (!ignore) console.error('Failed to load map data', error)
      }
    }

    loadGeoData()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false

    const fetchProvinces = async () => {
      try {
        const response = await apiClient.get(API_CONFIG.PROVINCES.BASE, { skipAuth: true })
        if (ignore) return

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to fetch provinces', response.status, errorText)
          return
        }

        const data = await response.json()
        if (ignore) return

        const resolveCoordinates = (province: ProvinceApiResponse): [number, number] => {
          const candidates = [province.displayName, province.name]
            .filter((v): v is string => Boolean(v?.trim()))
          for (const name of candidates) {
            const coords = getProvinceCoordinates(name)
            if (coords[0] !== 0 || coords[1] !== 0) return coords
          }
          return [0, 0]
        }

        if (data?.success) {
          const mapped: MapProvince[] = data.data
            .filter((p: ProvinceApiResponse) => Array.isArray(p.ports) && p.ports.length > 0)
            .map((p: ProvinceApiResponse) => {
              const name = (p.displayName || p.name || '').trim()
              const coordinates = resolveCoordinates(p)
              if (coordinates[0] === 0 && coordinates[1] === 0) {
                console.warn(`No coordinates for province: ${name} (ID: ${p.id})`)
              }
              return {
                id: p.id,
                name,
                coordinates,
                ports: p.ports ?? [],
                renderRight: computeRenderRight(name),
              }
            })
            .filter((p: MapProvince) => p.coordinates[0] !== 0)

          setProvinces(mapped)
        } else {
          console.error('Invalid provinces response', data)
        }
      } catch (error) {
        if (!ignore) console.error('Failed to fetch provinces', error)
      }
    }

    fetchProvinces()
    return () => { ignore = true }
  }, [])

  return (
    <div ref={ref}>
      <section className="landing-section landing-section--alt">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isInView ? 'fade-rise' : 'opacity-0'}`}>
              <div className="space-y-4 max-w-xl">
                <p className="landing-eyebrow">Network coverage</p>
                <h2 className="landing-display text-balance">
                  Vietnam ports,{' '}
                  <span className="text-primary">mapped to your cargo lane</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                  Hover provinces on the operations map to see where we berth, clear, and coordinate — from Quy Nhon to Hai Phong.
                </p>
              </div>

              {/* Key Benefits */}
              <div className={`grid gap-4 ${isInView ? 'fade-rise stagger-1' : 'opacity-0'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Predictable Transit Times</h3>
                    <p className="text-sm text-muted-foreground">Reliable scheduling across all major routes</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Customs Expertise</h3>
                    <p className="text-sm text-muted-foreground">Streamlined clearance processes and compliance</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Headphones className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">24/7 Support</h3>
                    <p className="text-sm text-muted-foreground">Round-the-clock operational assistance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Interactive Map */}
            <div className={`relative ${isInView ? 'scale-in stagger-1' : 'opacity-0'}`}>
              <Card className="p-6 landing-card-shadow border-primary/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold tracking-tight">Operations map</h3>
                    <Badge variant="secondary" className="font-medium">Live ports</Badge>
                  </div>

                  {/* Map Container */}
                  <div ref={mapViewRef} className="relative bg-card rounded-lg overflow-hidden border">
                    {selectedPort && (
                      <div className="absolute inset-0 z-30 bg-black/25 backdrop-blur-sm" />
                    )}

                    {geoData ? (
                      <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ center: [107, 16], scale: 3000 }}
                        width={800}
                        height={850}
                        className="w-full h-auto"
                      >
                        <MapGeographies geoData={geoData} />

                        {provinces.map((province) => (
                          <ProvinceMarker
                            key={province.id}
                            province={province}
                            isActive={activeProvince === province.id}
                            animate={mapInView}
                            onEnter={handleEnter}
                            onLeave={handleLeave}
                            onClick={handleClick}
                            onPopupEnter={handlePopupEnter}
                            onPopupLeave={handlePopupLeave}
                            onPortSelect={handlePortSelect}
                          />
                        ))}
                      </ComposableMap>
                    ) : (
                      <div className="flex items-center justify-center h-[520px] text-sm text-muted-foreground">
                        Loading map...
                      </div>
                    )}

                    <MorphingPopover
                      open={!!selectedPort}
                      onOpenChange={(open) => {
                        if (!open) setSelectedPort(null)
                      }}
                      className="absolute inset-0 z-40 pointer-events-none"
                    >
                      <MorphingPopoverContent className="pointer-events-auto left-1/2 top-1/2 z-50 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 p-0">
                        <div className="flex h-full flex-col bg-background">
                          <div className="flex items-center justify-between border-b px-4 py-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Port information</p>
                              <h4 className="text-base font-semibold">{selectedPort?.portName}</h4>
                              <p className="text-sm text-muted-foreground">{selectedPort?.provinceName}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedPort(null)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                              aria-label="Close port details"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
                            <p>
                              Operational details for this port can be shown here, such as available services,
                              contact points, and handling notes.
                            </p>
                          </div>
                        </div>
                      </MorphingPopoverContent>
                    </MorphingPopover>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
