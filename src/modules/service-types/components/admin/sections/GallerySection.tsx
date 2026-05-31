'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import {
  galleryService,
  GalleryImage as DBGalleryImage,
} from '@/modules/gallery/services/galleryService'
import { API_CONFIG } from '@/shared/config/api.config'

type FilterValue = number | 'all'

/* ─── Single image card — parent container controls all sizing ── */
function GalleryCard({
  image,
  index,
  total,
  getImageUrl,
  priority,
}: {
  image: DBGalleryImage
  index: number
  total: number
  getImageUrl: (url: string) => string
  priority?: boolean
}) {
  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 110, damping: 22, delay: index * 0.04 }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative w-full h-full rounded-[10px] overflow-hidden bg-muted block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ImageWithFallback
              src={getImageUrl(image.url)}
              alt={`${image.serviceTypeName} — ${image.commodityName}`}
              fill
              sizes={
                index === 0 && total >= 4
                  ? '(min-width: 768px) 66vw, 100vw'
                  : '(min-width: 768px) 33vw, 100vw'
              }
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
              priority={priority}
            />

            {/* Scrim */}
            <div className="absolute inset-0 bg-scrim/0 group-hover:bg-scrim/48 transition-colors duration-300" />

            {/* Meta — slides up on hover */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-scrim/72 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.14em] mb-0.5">
                {image.commodityName}
              </p>
              <p className="text-sm font-semibold text-white leading-tight truncate">
                {image.portName}
              </p>
              {image.provinceName && (
                <p className="text-[11px] text-white/55 mt-0.5">{image.provinceName}</p>
              )}
            </div>
          </button>
        </DialogTrigger>

        {/* Lightbox */}
        <DialogContent className="max-w-5xl w-full p-0 bg-scrim border-border rounded-2xl overflow-hidden">
          <DialogTitle className="sr-only">{image.portName}</DialogTitle>
          <DialogDescription className="sr-only">
            {`${image.commodityName} — ${image.provinceName}`}
          </DialogDescription>
          <div className="relative">
            <ImageWithFallback
              src={getImageUrl(image.url)}
              alt={image.portName}
              width={1600}
              height={900}
              priority
              className="w-full h-auto max-h-[88vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-scrim to-transparent">
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.12em]">
                {image.commodityName}
              </p>
              <p className="text-base font-semibold text-white">{image.portName}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

/* ─── Skeleton — mirrors exact bento structure ──────────────── */
function GallerySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Top bento — desktop */}
      <div className="hidden md:flex gap-3" style={{ height: 420 }}>
        <div className="flex-[2] min-w-0 rounded-[10px] bg-muted animate-pulse" />
        <div className="flex-[1] min-w-0 flex flex-col gap-3">
          <div
            className="flex-1 rounded-[10px] bg-muted animate-pulse"
            style={{ animationDelay: '80ms' }}
          />
          <div
            className="flex-1 rounded-[10px] bg-muted animate-pulse"
            style={{ animationDelay: '160ms' }}
          />
        </div>
      </div>
      {/* Top bento — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="aspect-video rounded-[10px] bg-muted animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div
            className="aspect-[4/3] rounded-[10px] bg-muted animate-pulse"
            style={{ animationDelay: '80ms' }}
          />
          <div
            className="aspect-[4/3] rounded-[10px] bg-muted animate-pulse"
            style={{ animationDelay: '160ms' }}
          />
        </div>
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-3">
        {[240, 320, 400].map((delay, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-[10px] bg-muted animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Empty state ─────────────────────────────────────────── */
function EmptyGallery({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-[6px] bg-muted ${i === 0 ? 'col-span-2 h-12' : 'h-12'}`}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {label ? `No images for "${label}"` : 'No images yet'}
      </p>
      <p className="text-xs text-muted-foreground max-w-[30ch] text-center leading-relaxed">
        Field photos will appear here as the team uploads them.
      </p>
    </div>
  )
}

/* ─── Bento grid renderer ─────────────────────────────────── */
function GalleryBento({
  images,
  getImageUrl,
}: {
  images: DBGalleryImage[]
  getImageUrl: (url: string) => string
}) {
  const total = images.length

  /* 1–2 images: simple equal row */
  if (total <= 2) {
    return (
      <div className={`grid gap-3 ${total === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {images.map((image, i) => (
          <div key={image.id} className="aspect-video">
            <GalleryCard
              image={image}
              index={i}
              total={total}
              getImageUrl={getImageUrl}
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    )
  }

  /* 3–6 images: bento layout */
  const topImages = images.slice(0, 3)   // always 3 for bento top
  const bottomImages = images.slice(3)   // 0–3 remaining

  const [feature, ...rightImages] = topImages

  const bottomColClass =
    bottomImages.length === 1
      ? 'grid-cols-1'
      : bottomImages.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-3'

  return (
    <div className="flex flex-col gap-3">

      {/* ── TOP BENTO — desktop: flex, mobile: stack ── */}

      {/* Desktop */}
      <div className="hidden md:flex gap-3" style={{ height: 420 }}>
        {/* Feature image — 2/3 width, full height */}
        <div className="flex-[2] min-w-0">
          <GalleryCard
            image={feature}
            index={0}
            total={total}
            getImageUrl={getImageUrl}
            priority
          />
        </div>

        {/* Right column — 1/3 width, stacked equally */}
        {rightImages.length > 0 && (
          <div className="flex-[1] min-w-0 flex flex-col gap-3">
            {rightImages.map((image, i) => (
              <div key={image.id} className="flex-1 min-h-0">
                <GalleryCard
                  image={image}
                  index={i + 1}
                  total={total}
                  getImageUrl={getImageUrl}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: feature full-width + right pair side-by-side */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="aspect-video">
          <GalleryCard
            image={feature}
            index={0}
            total={total}
            getImageUrl={getImageUrl}
            priority
          />
        </div>
        {rightImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {rightImages.map((image, i) => (
              <div key={image.id} className="aspect-[4/3]">
                <GalleryCard
                  image={image}
                  index={i + 1}
                  total={total}
                  getImageUrl={getImageUrl}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM ROW — equal aspect-[4/3] columns ── */}
      {bottomImages.length > 0 && (
        <div className={`grid gap-3 ${bottomColClass}`}>
          {bottomImages.map((image, i) => (
            <div
              key={image.id}
              className={bottomImages.length === 1 ? 'aspect-[21/9]' : 'aspect-[4/3]'}
            >
              <GalleryCard
                image={image}
                index={i + 3}
                total={total}
                getImageUrl={getImageUrl}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main section ────────────────────────────────────────── */
export function GallerySection({
  serviceTypeId,
  gallery,
}: {
  serviceTypeId: number
  gallery: {
    sectionTitle: string
    sectionDescription: string
    enabled: boolean
    commodities?: { label: string; value: number }[]
  }
}) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')
  const [commodities, setCommodities] = useState<{ label: string; value: number }[]>(
    gallery.commodities ?? []
  )
  const [images, setImages] = useState<DBGalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 6
  const [hasNextPage, setHasNextPage] = useState(false)

  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const assetBase = API_CONFIG.ASSET_BASE_URL

  const commodityFilter = useMemo(
    () => (activeFilter === 'all' ? undefined : activeFilter),
    [activeFilter]
  )

  const getImageUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const normalizedPath = url.replace(/\\/g, '/')
    const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
    return `${assetBase}${path}`
  }

  const activeLabel = useMemo(() => {
    if (activeFilter === 'all') return undefined
    return commodities.find(t => t.value === activeFilter)?.label
  }, [activeFilter, commodities])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (gallery.commodities?.length) return
    let cancelled = false
    ;(async () => {
      try {
        const types = await galleryService.getCommoditiesByServiceType(serviceTypeId)
        if (cancelled) return
        setCommodities(types.map(t => ({ label: t.displayName, value: t.id })))
      } catch {
        // non-critical
      }
    })()
    return () => { cancelled = true }
  }, [gallery.commodities, serviceTypeId])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const data = await galleryService.getPublicImages(
          serviceTypeId,
          commodityFilter,
          currentPage - 1,
          limit,
          controller.signal
        )
        setImages(data)
        setHasNextPage(data.length === limit)
      } catch (e: unknown) {
        if ((e as { name?: string })?.name === 'AbortError') return
        setError('Failed to load images.')
        setImages([])
        setHasNextPage(false)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [serviceTypeId, commodityFilter, currentPage, limit])

  useEffect(() => { setCurrentPage(1) }, [activeFilter])

  const allFilters: Array<{ label: string; value: FilterValue }> = [
    { label: 'All', value: 'all' },
    ...commodities.map(t => ({ label: t.label, value: t.value as FilterValue })),
  ]

  return (
    <section id="service-gallery" ref={sectionRef} className="py-16 md:py-24 scroll-mt-24">

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        className="mb-10 grid gap-5 md:grid-cols-[1fr_1.6fr] md:items-end"
        initial={isVisible ? undefined : { opacity: 0, y: 14 }}
        animate={isVisible ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 110, damping: 22 }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Field work
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] leading-[1.05] text-foreground">
            {gallery.sectionTitle}
          </h2>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[52ch]">
          {gallery.sectionDescription}
        </p>
      </motion.div>

      {/* ── Filter underline tabs ───────────────────────────────── */}
      {commodities.length > 0 && (
        <motion.div
          className="flex flex-wrap items-center gap-0 mb-8 border-b border-border"
          initial={isVisible ? undefined : { opacity: 0, y: 8 }}
          animate={isVisible ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.08, type: 'spring', stiffness: 110, damping: 22 }}
        >
          {allFilters.map(({ label, value }) => {
            const isActive = activeFilter === value
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => setActiveFilter(value)}
                className={[
                  'relative px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                  'focus-visible:outline-none',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground',
                ].join(' ')}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="gallery-filter-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full"
                    transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </motion.div>
      )}

      {/* ── Content ─────────────────────────────────────────────── */}
      {loading && <GallerySkeleton />}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => setCurrentPage(p => p)}
            className="text-xs font-medium text-foreground underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <EmptyGallery label={activeLabel} />
      )}

      {!loading && !error && images.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeFilter}-${currentPage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GalleryBento images={images} getImageUrl={getImageUrl} />
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Pagination ──────────────────────────────────────────── */}
      {!loading && !error && (currentPage > 1 || hasNextPage) && (
        <div className="flex items-center justify-center gap-6 mt-12">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full border',
              'transition-colors duration-150 focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              currentPage === 1
                ? 'border-border text-muted-foreground/60 cursor-not-allowed'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
            ].join(' ')}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>

          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{currentPage}</span>
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!hasNextPage}
            aria-label="Next page"
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full border',
              'transition-colors duration-150 focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              !hasNextPage
                ? 'border-border text-muted-foreground/60 cursor-not-allowed'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
            ].join(' ')}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </section>
  )
}
