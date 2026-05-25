'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { LandingSectionHeader } from '@/modules/landing/components/public/LandingSectionHeader'
import { cn } from '@/shared/lib/utils'
import { Eye, ArrowRight } from 'lucide-react'
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7 lg:row-span-2 h-72 lg:h-[420px] rounded-xl bg-muted animate-pulse" />
      <div className="lg:col-span-5 h-52 rounded-xl bg-muted animate-pulse" />
      <div className="lg:col-span-5 h-52 rounded-xl bg-muted animate-pulse" />
      <div className="lg:col-span-4 h-48 rounded-xl bg-muted animate-pulse" />
      <div className="lg:col-span-4 h-48 rounded-xl bg-muted animate-pulse" />
      <div className="lg:col-span-4 h-48 rounded-xl bg-muted animate-pulse" />
    </div>
  )
}

export function FieldGallery() {
  const router = useRouter()
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0].id)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [ref, isInView] = useIntersectionObserver()

  useEffect(() => {
    const controller = new AbortController()

    const fetchGalleryImages = async () => {
      try {
        setLoading(true)
        const data = await galleryService.getPublicImages(selectedServiceId, undefined, 0, 12, controller.signal)
        setGalleryImages(
          data.map((image) => ({
            id: image.id,
            imageUrl: image.url,
            portName: image.portName,
            cargoTypeName: image.commodityName,
            province: image.provinceName,
            serviceTypeId: image.serviceTypeId,
            serviceTypeName: image.serviceTypeName,
          }))
        )
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        console.error('Error loading gallery images:', error)
        setGalleryImages([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchGalleryImages()
    return () => controller.abort()
  }, [selectedServiceId])

  const filteredData = galleryImages
    .filter((item) => item.serviceTypeId === selectedServiceId)
    .slice(0, 6)

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
            description="Recent port calls and cargo types by service line — filter to see how we work in practice."
            className={isInView ? 'fade-rise' : 'opacity-0'}
          />

          <div
            className={cn(
              'flex flex-wrap gap-2 mb-10',
              isInView ? 'fade-rise stagger-1' : 'opacity-0'
            )}
          >
            {services.map((service) => (
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

          {loading && <GallerySkeleton />}

          {!loading && filteredData.length === 0 && (
            <p className="text-center text-muted-foreground py-16 rounded-xl border border-dashed">
              No images for this service yet. Check back after the next port call.
            </p>
          )}

          {!loading && filteredData.length > 0 && (
            <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4', isInView ? 'fade-rise stagger-2' : 'opacity-0')}>
              {filteredData.map((item, index) => {
                const isFeatured = index === 0
                return (
                  <Dialog key={item.id}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'group relative overflow-hidden rounded-xl text-left w-full landing-card-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isFeatured
                            ? 'md:col-span-2 lg:col-span-7 lg:row-span-2 h-72 lg:h-[420px]'
                            : index <= 2
                              ? 'h-52 lg:col-span-5'
                              : 'h-48 lg:col-span-4'
                        )}
                      >
                        <ImageWithFallback
                          src={getImageUrl(item.imageUrl)}
                          alt={`${item.portName} — ${item.cargoTypeName}`}
                          width={800}
                          height={600}
                          sizes={isFeatured ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-5">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary" className="bg-white/90 text-foreground text-xs">
                              {item.cargoTypeName}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/90 text-foreground text-xs">
                              {item.province}
                            </Badge>
                          </div>
                          <p className="text-white font-semibold text-sm md:text-base">{item.portName}</p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Eye className="h-8 w-8 text-white" aria-hidden />
                          <span className="sr-only">View image</span>
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
                        className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                )
              })}
            </div>
          )}

          {!loading && filteredData.length > 0 && (
            <div className={cn('flex justify-start mt-10', isInView ? 'fade-rise stagger-3' : 'opacity-0')}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  NProgress.start()
                  router.push(serviceGalleryUrls[selectedServiceId])
                }}
                className="group transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Full {services.find((s) => s.id === selectedServiceId)?.label ?? 'service'} gallery
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
