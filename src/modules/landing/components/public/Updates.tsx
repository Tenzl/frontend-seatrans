'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { LandingSectionHeader } from './LandingSectionHeader'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/shared/components/ui/carousel'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'

interface Post {
  id: number
  title: string
  content?: string
  thumbnailUrl?: string
  publishedAt?: string
  createdAt?: string
  categories?: Array<{
    id: number
    name: string
  }>
}

interface UpdatesProps {
  onNavigateToArticle: (id: number) => void
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function UpdatesSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="shrink-0 w-[min(280px,75vw)] aspect-[4/5] rounded-xl bg-muted animate-pulse"
        />
      ))}
    </div>
  )
}

export function Updates({ onNavigateToArticle }: UpdatesProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [ref, isInView] = useIntersectionObserver()
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    fetchRecentPosts()
  }, [])

  useEffect(() => {
    if (!api) return

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    updateScrollState()
    api.on('select', updateScrollState)
    api.on('reInit', updateScrollState)

    return () => {
      api.off('select', updateScrollState)
      api.off('reInit', updateScrollState)
    }
  }, [api])

  const fetchRecentPosts = async () => {
    try {
      const response = await apiClient.get<ApiResponse<Post[]>>(
        `${API_CONFIG.POSTS.LATEST}?limit=12`,
        { skipAuth: true }
      )
      if (!response.ok) {
        console.error('Failed to fetch posts', response.status)
        return
      }

      const json: ApiResponse<Post[]> = await response.json()
      setPosts((json.data || []).slice(0, 12))
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const scrollPrev = () => {
    if (!api) return
    const current = api.selectedScrollSnap() || 0
    api.scrollTo(Math.max(0, current - 2))
  }

  const scrollNext = () => {
    if (!api) return
    const snaps = api.scrollSnapList().length
    const current = api.selectedScrollSnap() || 0
    api.scrollTo(Math.min(snaps - 1, current + 2))
  }

  return (
    <div ref={ref}>
      <section className="landing-section landing-section--alt">
        <div className="container">
          <LandingSectionHeader
            eyebrow="News & insights"
            title="Latest from the desk"
            description="Port updates, market notes, and operational briefs from our teams."
            className={isInView ? 'fade-rise' : 'opacity-0'}
            action={
              <Button variant="outline" asChild className="hidden sm:inline-flex">
                <Link href="/insights">
                  All articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            }
          />

          {loading && <UpdatesSkeleton />}

          {!loading && posts.length === 0 && (
            <p className="text-muted-foreground py-12 text-center border border-dashed rounded-xl">
              No articles published yet.
            </p>
          )}

          {!loading && posts.length > 0 && (
            <Carousel
              setApi={setApi}
              opts={{ align: 'start', loop: false }}
              className={cn('w-full', isInView ? 'fade-rise stagger-1' : 'opacity-0')}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="absolute -left-3 md:-left-5 top-1/2 z-10 -translate-y-1/2 rounded-full p-2.5 border bg-card shadow-md text-primary transition-[transform,background-color,color,border-color,box-shadow] hover:bg-primary hover:text-primary-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
                  aria-label="Previous articles"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="absolute -right-3 md:-right-5 top-1/2 z-10 -translate-y-1/2 rounded-full p-2.5 border bg-card shadow-md text-primary transition-[transform,background-color,color,border-color,box-shadow] hover:bg-primary hover:text-primary-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
                  aria-label="Next articles"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <CarouselContent className="-ml-4 md:-ml-6">
                  {posts.map((post, index) => (
                    <CarouselItem
                      key={post.id}
                      className="pl-4 md:pl-6 basis-[82%] sm:basis-[45%] md:basis-[38%] lg:basis-[28%]"
                    >
                      <article
                        className="group relative cursor-pointer overflow-hidden rounded-xl landing-card-shadow transition-transform hover:scale-[1.02] active:scale-[0.99] focus-within:ring-2 focus-within:ring-ring"
                        style={{
                          aspectRatio: '4 / 5',
                          animationDelay: `${index * 50}ms`,
                        }}
                        onClick={() => onNavigateToArticle(post.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onNavigateToArticle(post.id)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {post.thumbnailUrl ? (
                          <ImageWithFallback
                            src={post.thumbnailUrl}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            fill
                            sizes="(min-width: 1024px) 28vw, 80vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-muted">
                            <Calendar className="h-14 w-14 text-primary/25" aria-hidden />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                        <div className="absolute inset-0 flex flex-col justify-between p-5">
                          <span className="inline-flex w-fit rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                            {post.categories?.[0]?.name ?? 'News'}
                          </span>

                          <div className="space-y-2">
                            <time className="text-xs text-white/80 tabular-nums">
                              {formatDate(post.publishedAt || post.createdAt)}
                            </time>
                            <h3 className="text-base font-semibold leading-snug text-white line-clamp-3 text-balance">
                              {post.title}
                            </h3>
                          </div>
                        </div>
                      </article>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
            </Carousel>
          )}

          <div className="mt-8 sm:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/insights">
                All articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
