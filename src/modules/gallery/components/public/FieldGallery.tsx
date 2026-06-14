'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { LandingSectionHeader } from '@/modules/landing/components/public/LandingSectionHeader'
import { cn } from '@/shared/lib/utils'
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { galleryService } from '@/modules/gallery/services/galleryService'
import { API_CONFIG } from '@/shared/config/api.config'

const ASSET_BASE_URL = API_CONFIG.ASSET_BASE_URL

interface GalleryImage {
  id: number
  imageUrl: string
  portName: string
  cargoTypeName: string
  province: string
  serviceTypeId?: number
  serviceTypeName: string
}

const services = [
  { id: 1, key: 'SHIPPING_AGENCY', label: 'Shipping Agency' },
  { id: 2, key: 'FREIGHT_FORWARDING', label: 'Freight Forwarding' },
  { id: 3, key: 'CHARTERING', label: 'Chartering & Broking' },
  { id: 4, key: 'LOGISTICS', label: 'Total Logistics' },
] as const

const serviceGalleryUrls: Record<number, string> = {
  1: '/services/shipping-agency#gallery',
  2: '/services/freight-forwarding#gallery',
  3: '/services/chartering-broking#gallery',
  4: '/services/total-logistics#gallery',
}

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const normalizedPath = url.replace(/\\/g, '/')
  const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  return `${ASSET_BASE_URL}${path}`
}

function GallerySkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden md:gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'h-[420px] shrink-0 rounded-2xl bg-muted animate-pulse md:h-[480px]',
            i === 0 ? 'w-[300px] md:w-[440px]' : 'w-[260px] md:w-[340px]'
          )}
        />
      ))}
    </div>
  )
}

export function FieldGallery() {
  const router = useRouter()
  const [imagesByService, setImagesByService] = useState<Record<number, GalleryImage[]>>({})
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [ref, isInView] = useIntersectionObserver()
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchGalleryImages = async () => {
      try {
        setLoading(true)
        const data = await galleryService.getPublicImages(undefined, undefined, 0, 100, controller.signal)
        const grouped: Record<number, GalleryImage[]> = {}
        data.forEach((image) => {
          if (image.serviceTypeId == null) return
          ;(grouped[image.serviceTypeId] ??= []).push({
            id: image.id,
            imageUrl: image.url,
            portName: image.portName,
            cargoTypeName: image.commodityName,
            province: image.provinceName,
            serviceTypeId: image.serviceTypeId,
            serviceTypeName: image.serviceTypeName,
          })
        })
        setImagesByService(grouped)
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        console.error('Error loading gallery images:', error)
        setImagesByService({})
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchGalleryImages()
    return () => controller.abort()
  }, [])

  // Only surface service lines that actually have images; hide the rest
  const availableServices = services.filter(
    (service) => (imagesByService[service.id]?.length ?? 0) > 0
  )
  const firstAvailableId = availableServices[0]?.id ?? null

  // Keep the active tab valid: fall back to the first service that has images
  useEffect(() => {
    if (loading) return
    setSelectedServiceId((current) =>
      current != null && imagesByService[current]?.length ? current : firstAvailableId
    )
  }, [loading, imagesByService, firstAvailableId])

  // Reset scroll to the head of the rail whenever the service line changes
  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0 })
  }, [selectedServiceId])

  const filteredData =
    selectedServiceId != null ? (imagesByService[selectedServiceId] ?? []).slice(0, 10) : []

  const activeLabel = services.find((s) => s.id === selectedServiceId)?.label ?? 'service'

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const amount = Math.min(el.clientWidth * 0.8, 420)
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }, [])

  return (
    <div ref={ref}>
      <section className="landing-section">
        <div className="container">
          <LandingSectionHeader
            eyebrow="On the ground"
            title={
              <>
                Field operations <span className="text-primary">gallery</span>
              </>
            }
            description="Recent port calls and cargo types by service line. Scroll the reel to see how we work in practice."
            className={isInView ? 'fade-rise' : 'opacity-0'}
          />

          {/* Controls row: service filters (left) + rail navigation (right) */}
          <div
            className={cn(
              'mb-8 flex items-center justify-between gap-4',
              isInView ? 'fade-rise stagger-1' : 'opacity-0'
            )}
          >
            <div className="flex flex-wrap gap-2">
              {availableServices.map((service) => (
                <Button
                  key={service.id}
                  variant={selectedServiceId === service.id ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full px-5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setSelectedServiceId(service.id)}
                >
                  {service.label}
                </Button>
              ))}
            </div>

            {!loading && filteredData.length > 1 && (
              <div className="hidden shrink-0 gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => scrollByCards(-1)}
                  aria-label="Previous photos"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCards(1)}
                  aria-label="Next photos"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            )}
          </div>

          {loading && <GallerySkeleton />}

          {!loading && filteredData.length === 0 && (
            <p className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              No images for this service yet. Check back after the next port call.
            </p>
          )}

          {!loading && filteredData.length > 0 && (
            <div className={cn('relative', isInView ? 'fade-rise stagger-2' : 'opacity-0')}>
              <div
                ref={scrollerRef}
                className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 pb-2 md:gap-5"
              >
                {filteredData.map((item, index) => {
                  const isFeatured = index === 0
                  return (
                    <Dialog key={item.id}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'group relative h-[420px] shrink-0 snap-start overflow-hidden rounded-2xl text-left landing-card-shadow transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-[480px]',
                            isFeatured ? 'w-[300px] md:w-[440px]' : 'w-[260px] md:w-[340px]'
                          )}
                        >
                          <ImageWithFallback
                            src={getImageUrl(item.imageUrl)}
                            alt={`${item.portName} — ${item.cargoTypeName} at ${item.province}`}
                            width={900}
                            height={1100}
                            sizes={isFeatured ? '(min-width: 768px) 440px, 300px' : '(min-width: 768px) 340px, 260px'}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-scrim/85 via-scrim/25 to-transparent" />

                          {/* Open cue, top-right (appears on hover/focus) */}
                          <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                            <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </span>

                          {/* Caption */}
                          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                            <p className="text-lg font-semibold text-white">{item.portName}</p>
                            <p className="mt-1 text-sm text-white/75">
                              {item.cargoTypeName} <span className="px-1 text-white/45">·</span> {item.province}
                            </p>
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogTitle className="sr-only">{item.portName}</DialogTitle>
                        <DialogDescription className="sr-only">
                          {`${item.cargoTypeName} — ${item.province}`}
                        </DialogDescription>
                        <ImageWithFallback
                          src={getImageUrl(item.imageUrl)}
                          alt={item.portName}
                          width={1200}
                          height={800}
                          sizes="100vw"
                          className="h-auto max-h-[80vh] w-full rounded-lg object-contain"
                        />
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </div>
            </div>
          )}

          {!loading && filteredData.length > 0 && (
            <div className={cn('mt-10 flex justify-start', isInView ? 'fade-rise stagger-3' : 'opacity-0')}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (selectedServiceId == null) return
                  NProgress.start()
                  router.push(serviceGalleryUrls[selectedServiceId])
                }}
                className="group transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Full {activeLabel} gallery
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
