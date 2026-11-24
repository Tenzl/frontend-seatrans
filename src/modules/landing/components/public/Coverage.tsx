'use client'

import { memo, useState, useEffect, useRef } from 'react'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import {
  Clock,
  Shield,
  Headphones,
  Anchor,
  Plus,
  X
} from 'lucide-react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { MorphingPopover, MorphingPopoverContent } from '@/shared/components/ui/morphing-popover'
import {
  loadCoverage,
  type MappedCoverageProvince,
  type UnmappedCoverageProvince
} from '@/modules/landing/services/coverageService'

const MapGeographies = memo(function MapGeographies({ geoData }: { geoData: object }) {
  return (
    <Geographies geography={geoData}>
      {({ geographies }) => geographies.map((geo) => (
        <Geography
          key={geo.rsmKey}
          geography={geo}
          fill="#e0f2fe"
          stroke="#1a54b4"
          strokeWidth={0.5}
          style={{
            default: { outline: 'none' },
            hover: { outline: 'none', fill: '#bae6fd' },
            pressed: { outline: 'none' }
          }}
        />
      ))}
    </Geographies>
  )
})

function PortPopup({
  province,
  onPortSelect
}: {
  province: MappedCoverageProvince
  onPortSelect: (portName: string) => void
}) {
  return (
    <div className="min-w-[220px] max-w-[280px] rounded-xl border bg-card p-4 shadow-xl">
      <div className="mb-2 border-b pb-2 text-base font-bold uppercase tracking-wide text-foreground">
        {province.name}
      </div>
      <div className="max-h-[180px] space-y-2 overflow-y-auto">
        {province.ports.map((port) => (
          <div key={port.id} className="flex items-start justify-between gap-3">
            <Anchor className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <span className="flex-1 text-left text-[15px] font-medium leading-tight text-muted-foreground">
              {port.name}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onPortSelect(port.name)
              }}
              className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-primary/30 text-primary hover:bg-primary/10"
              aria-label={`View details for ${port.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Coverage() {
  const [provinces, setProvinces] = useState<MappedCoverageProvince[]>([])
  const [unmappedProvinces, setUnmappedProvinces] = useState<UnmappedCoverageProvince[]>([])
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [hoveredProvince, setHoveredProvince] = useState<number | null>(null)
  const [popupHoveredProvince, setPopupHoveredProvince] = useState<number | null>(null)
  const [selectedPort, setSelectedPort] = useState<{ provinceName: string; portName: string } | null>(null)
  const [geoData, setGeoData] = useState<object | null>(null)
  const [geoError, setGeoError] = useState(false)
  const [coverageError, setCoverageError] = useState(false)
  const [coverageLoading, setCoverageLoading] = useState(true)
  const [geoRetryKey, setGeoRetryKey] = useState(0)
  const [coverageRetryKey, setCoverageRetryKey] = useState(0)
  const [ref, isInView] = useIntersectionObserver()
  const hoverHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHoverHideTimeout = () => {
    if (hoverHideTimeoutRef.current) {
      clearTimeout(hoverHideTimeoutRef.current)
      hoverHideTimeoutRef.current = null
    }
  }

  const scheduleHideProvincePopup = (provinceId: number, delay = 120) => {
    clearHoverHideTimeout()
    hoverHideTimeoutRef.current = setTimeout(() => {
      setHoveredProvince((current) => (current === provinceId ? null : current))
      setSelectedProvince((current) => (current === provinceId ? null : current))
    }, delay)
  }

  const shouldPopupRenderRight = (provinceName: string) => {
    const normalized = provinceName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
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

  useEffect(() => {
    return () => clearHoverHideTimeout()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setGeoError(false)
    setGeoData(null)

    const loadGeoData = async () => {
      try {
        const response = await fetch('/geo/newvn.json', { signal: controller.signal })
        if (!response.ok) throw new Error(`Map geometry returned ${response.status}`)
        const data = await response.json()
        if (!controller.signal.aborted) setGeoData(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to load map data', error)
          setGeoError(true)
        }
      }
    }

    void loadGeoData()
    return () => controller.abort()
  }, [geoRetryKey])

  useEffect(() => {
    const controller = new AbortController()
    setCoverageError(false)
    setCoverageLoading(true)
    setProvinces([])
    setUnmappedProvinces([])

    loadCoverage(controller.signal)
      .then(({ mapped, unmapped }) => {
        if (controller.signal.aborted) return
        setProvinces(mapped)
        setUnmappedProvinces(unmapped)
        setCoverageLoading(false)
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error('Failed to load coverage', error)
        setCoverageError(true)
        setCoverageLoading(false)
      })

    return () => controller.abort()
  }, [coverageRetryKey])

  return (
    <div ref={ref}>
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isInView ? 'fade-rise' : 'opacity-0'}`}>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">
                  {/* Full Coverage Across */}
                  {/* <br /> */}
                  <span className="text-primary">South East Asia Transport and Logistics (SEATRANS)</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Comprehensive network spanning Vietnam's key ports and beyond, ensuring seamless connectivity for your cargo.
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
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">SEATRANS - OPERATION MAP</h3>
                    <Badge variant="secondary">Operational Coverage</Badge>
                  </div>

                  {/* Map Container */}
                  <div className="relative bg-card rounded-lg overflow-hidden border">
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

                        {/* Province Markers */}
                        {provinces.map((province) => (
                          <Marker key={province.id} coordinates={province.coordinates}>
                            <g
                              onMouseEnter={() => {
                                clearHoverHideTimeout()
                                setHoveredProvince(province.id)
                              }}
                              onMouseLeave={() => {
                                if (popupHoveredProvince === province.id) return
                                scheduleHideProvincePopup(province.id)
                              }}
                              onClick={() => {
                                clearHoverHideTimeout()
                                setSelectedProvince(province.id)
                                setHoveredProvince(province.id)
                              }}
                              className="cursor-pointer"
                            >
                              {/* Pulsating Rings */}
                              <circle
                                r={13}
                                fill="none"
                                stroke="#2ECC71"
                                strokeWidth={2}
                                opacity={0.6}
                                className="animate-ping"
                              />

                              {/* Main Marker Circle */}
                              <circle
                                r={8}
                                fill="#2ECC71"
                                stroke="#fff"
                                strokeWidth={2}
                                className="transition-all hover:scale-110"
                              />

                              {/* HOVER MESSAGE BUBBLE */}
                              {(selectedProvince === province.id || hoveredProvince === province.id || popupHoveredProvince === province.id) && (
                                <foreignObject
                                  x={shouldPopupRenderRight(province.name) ? 20 : -320}
                                  y={-140}
                                  width={320}
                                  height={280}
                                  className="overflow-visible"
                                >
                                  <div
                                    className="flex flex-row items-center justify-end h-full animate-in fade-in zoom-in-95 duration-200"
                                    onMouseEnter={() => {
                                      clearHoverHideTimeout()
                                      setPopupHoveredProvince(province.id)
                                    }}
                                    onMouseLeave={() => {
                                      setPopupHoveredProvince((current) => (current === province.id ? null : current))
                                      scheduleHideProvincePopup(province.id, 80)
                                    }}
                                  >
                                    {shouldPopupRenderRight(province.name) ? (
                                      <>
                                        {/* Triangle Tail (pointing left) */}
                                        <div className="w-4 h-4 bg-card rotate-45 transform translate-x-2 shadow-sm border-l border-b z-10"></div>

                                        <PortPopup
                                          province={province}
                                          onPortSelect={(portName) => setSelectedPort({ provinceName: province.name, portName })}
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <PortPopup
                                          province={province}
                                          onPortSelect={(portName) => setSelectedPort({ provinceName: province.name, portName })}
                                        />

                                        {/* Triangle Tail (pointing right) */}
                                        <div className="w-4 h-4 bg-card rotate-45 transform -translate-x-2 shadow-sm border-t border-r z-10"></div>
                                      </>
                                    )}
                                  </div>
                                </foreignObject>
                              )}
                            </g>
                          </Marker>
                        ))}
                      </ComposableMap>
                    ) : (
                      <div className="flex h-[520px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                        <p>{geoError ? 'Map could not be loaded.' : 'Loading map...'}</p>
                        {geoError && (
                          <button type="button" className="text-primary underline" onClick={() => setGeoRetryKey((key) => key + 1)}>
                            Try again
                          </button>
                        )}
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
                  {coverageLoading && <p className="text-sm text-muted-foreground">Loading coverage...</p>}
                  {coverageError && (
                    <div role="alert" className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span>Coverage could not be loaded.</span>
                      <button type="button" className="text-primary underline" onClick={() => setCoverageRetryKey((key) => key + 1)}>
                        Try again
                      </button>
                    </div>
                  )}
                  {!coverageLoading && !coverageError && provinces.length === 0 && unmappedProvinces.length === 0 && (
                    <p className="text-sm text-muted-foreground">No operational ports are currently available.</p>
                  )}
                  {unmappedProvinces.length > 0 && (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Other operational locations</p>
                      {unmappedProvinces.map((province) => (
                        <p key={province.id} className="text-muted-foreground">
                          <span className="font-medium text-foreground">{province.name}:</span>{' '}
                          {province.ports.map((port) => port.name).join(', ')}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
