'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/components/ui/button'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { LandingSectionHeader } from './LandingSectionHeader'
import { cn } from '@/shared/lib/utils'
import {
  Ship,
  Package,
  Building,
  TrendingUp,
  ArrowRight,
  Check,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SolutionsProps {
  onNavigate?: (page: 'shipping-agency' | 'chartering-broking' | 'freight-forwarding' | 'total-logistics') => void
}

type SolutionKey = 'shipping-agency' | 'chartering' | 'freight-forwarding' | 'total-logistics'

interface SolutionItem {
  key: SolutionKey
  title: string
  icon: LucideIcon
  tagline: string
  description: string
  metrics: { label: string; value: string }[]
  details: string[]
  image: string
  path: string
}

const solutionsList: SolutionItem[] = [
  {
    key: 'shipping-agency',
    title: 'Shipping Agency',
    icon: Ship,
    tagline: 'Port clearance & husbandry',
    description: 'Full-service port agency and vessel operations across Asia-Pacific ports.',
    metrics: [
      { label: 'Ports covered', value: '150+' },
      { label: 'Vessels handled', value: '2,500+' },
      { label: 'Avg response', value: '< 2 hrs' },
    ],
    details: [
      'Port clearance and customs coordination',
      'Vessel husbandry and crew assistance',
      '24/7 operational support',
    ],
    image:
      'https://images.unsplash.com/photo-1673714697436-da13c8087c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    path: '/services/shipping-agency',
  },
  {
    key: 'chartering',
    title: 'Chartering & Broking',
    icon: TrendingUp,
    tagline: 'Cargo & tonnage placement',
    description: 'Vessel chartering and brokerage for bulk, project, and specialized cargo.',
    metrics: [
      { label: 'Charter fixtures', value: '500+' },
      { label: 'Trade lanes', value: '15+' },
      { label: 'Cargo moved', value: '480K t' },
    ],
    details: [
      'Spot and time charter arrangements',
      'Market intelligence and analysis',
      'Contract negotiation and management',
    ],
    image:
      'https://images.unsplash.com/photo-1756966552603-6418ccbad7b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    path: '/services/chartering-broking',
  },
  {
    key: 'freight-forwarding',
    title: 'Freight Forwarding',
    icon: Package,
    tagline: 'Sea, air & inland legs',
    description: 'Multimodal freight across the region with documentation and tracking.',
    metrics: [
      { label: 'TEU handled', value: '100K+' },
      { label: 'On-time rate', value: '99.2%' },
      { label: 'Countries', value: '25+' },
    ],
    details: [
      'Door-to-door delivery services',
      'Customs clearance and documentation',
      'Real-time tracking and monitoring',
    ],
    image:
      'https://images.unsplash.com/photo-1726776230751-183496c51f00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    path: '/services/freight-forwarding',
  },
  {
    key: 'total-logistics',
    title: 'Total Logistics',
    icon: Building,
    tagline: 'End-to-end supply chain',
    description: 'Warehousing, distribution, and integrated planning for complex flows.',
    metrics: [
      { label: 'Warehouses', value: '50+' },
      { label: 'Active lanes', value: '1,000+' },
      { label: 'Efficiency lift', value: '23%' },
    ],
    details: [
      'Warehouse management and distribution',
      'Inventory optimization and planning',
      'Integrated technology platforms',
    ],
    image:
      'https://images.unsplash.com/photo-1614571272828-2d8289ff8fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    path: '/services/total-logistics',
  },
]

export function Solutions({ onNavigate: _onNavigate }: SolutionsProps) {
  const router = useRouter()
  const [activeKey, setActiveKey] = useState<SolutionKey>('shipping-agency')
  const [ref, isInView] = useIntersectionObserver()

  const activeSolution = solutionsList.find((s) => s.key === activeKey) ?? solutionsList[0]
  const ActiveIcon = activeSolution.icon

  const goTo = (path: string, hash?: string) => {
    NProgress.start()
    router.push(hash ? `${path}${hash}` : path)
  }

  return (
    <div ref={ref} id="solutions">
      <section className="landing-section">
        <div className="container">
          <LandingSectionHeader
            eyebrow="What we do"
            title="Four disciplines, one operations desk"
            description="Agency, chartering, forwarding, and integrated logistics — pick a line of business to see scope and metrics."
            className={isInView ? 'fade-rise' : 'opacity-0'}
          />

          <div
            className={cn(
              'grid gap-8 lg:grid-cols-12 lg:gap-10 items-start',
              isInView ? 'fade-rise stagger-1' : 'opacity-0'
            )}
          >
            {/* Service picker — vertical on desktop */}
            <nav
              className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:sticky lg:top-24 snap-x snap-mandatory"
              aria-label="Service categories"
            >
              {solutionsList.map((solution) => {
                const Icon = solution.icon
                const isActive = solution.key === activeKey
                return (
                  <button
                    key={solution.key}
                    type="button"
                    onClick={() => setActiveKey(solution.key)}
                    className={cn(
                      'snap-start shrink-0 lg:shrink text-left rounded-xl border px-4 py-4 transition-all duration-200 min-w-[200px] lg:min-w-0 lg:w-full',
                      'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'border-primary bg-primary/8 shadow-sm landing-card-shadow'
                        : 'border-border bg-card/60 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight">{solution.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{solution.tagline}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>

            {/* Featured panel */}
            <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-card overflow-hidden landing-card-shadow">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-3 p-8 md:p-10 flex flex-col min-h-[420px]">
                  <p className="text-sm font-medium text-primary mb-2">{activeSolution.tagline}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <ActiveIcon className="h-6 w-6 text-primary" aria-hidden />
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{activeSolution.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                    {activeSolution.description}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-border/60">
                    {activeSolution.metrics.map((metric) => (
                      <div key={metric.label}>
                        <div className="landing-stat-value text-2xl">{metric.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {activeSolution.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-3 mt-auto">
                    <Button
                      size="lg"
                      onClick={() => goTo(activeSolution.path)}
                      className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Explore service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => goTo(activeSolution.path, '#quote')}
                      className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Request a quote
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2 relative min-h-[240px] md:min-h-full">
                  <ImageWithFallback
                    src={activeSolution.image}
                    alt={`${activeSolution.title} operations`}
                    width={640}
                    height={800}
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent md:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent md:hidden" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
