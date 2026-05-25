'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'

export function LandingCtaBand() {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.2 })

  return (
    <section ref={ref} className="landing-section border-t border-border/60">
      <div className="container">
        <div
          className={`relative overflow-hidden rounded-2xl bg-primary px-8 py-10 md:px-12 md:py-14 landing-card-shadow transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-primary-foreground/5 blur-2xl"
            aria-hidden
          />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.4fr_auto] lg:items-center">
            <div className="space-y-3 text-primary-foreground max-w-xl">
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-primary-foreground/80">
                Ready to move cargo
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
                Talk to our operations team across Vietnam ports
              </h2>
              <p className="text-primary-foreground/85 leading-relaxed">
                Port agency, chartering, forwarding, and customs — one desk for your next call.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Button
                size="lg"
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                asChild
              >
                <Link href="/contact">
                  Contact us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                asChild
              >
                <a href="tel:+84935015679">
                  <Phone className="mr-2 h-4 w-4" />
                  +84 93-501-5679
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
