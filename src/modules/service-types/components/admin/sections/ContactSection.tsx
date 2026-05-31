'use client'

import { LucideIcon, Phone, Mail, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

const ICON_STROKE = 1.5

export interface ContactPerson {
  name: string
  mobile: string
}

export interface ContactTeam {
  title: string
  icon: LucideIcon
  subtitle: string
  contacts: ContactPerson[]
  email: string
}

export interface StatItem {
  icon: LucideIcon
  value: string
  label: string
}

export function ContactSection({
  contacts,
}: {
  contacts: {
    showEmergencyBadge?: boolean
    sectionTitle: string
    sectionDescription: string
    teams: ContactTeam[]
    stats?: StatItem[]
  }
}) {
  return (
    <section className="py-16 md:py-24">
      {/* Header — asymmetric */}
      <div className="mb-12 grid gap-6 md:grid-cols-[1fr_1.6fr] md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Direct lines
          </p>
          <h2 className="landing-section-title">
            {contacts.sectionTitle}
          </h2>
          {contacts.showEmergencyBadge && (
            <div className="mt-4">
              <Badge
                variant="destructive"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              >
                <Zap className="h-3 w-3" strokeWidth={ICON_STROKE} />
                24/7 emergency line
              </Badge>
            </div>
          )}
        </div>
        <p className="landing-section-lead max-w-[56ch]">
          {contacts.sectionDescription}
        </p>
      </div>

      {/* Stats bar */}
      {contacts.stats && contacts.stats.length > 0 && (
        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-border/80 border border-border/80 rounded-2xl overflow-hidden bg-card shadow-[0_4px_24px_-8px_hsl(var(--foreground)/0.06)]">
          {contacts.stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 22,
                  delay: index * 0.07,
                }}
                className="flex flex-col items-start gap-1 px-6 py-5"
              >
                <Icon className="h-4 w-4 text-primary mb-1" strokeWidth={ICON_STROKE} />
                <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Team cards */}
      <div
        className={`grid gap-5 items-stretch ${
          contacts.teams.length === 1 ? 'lg:max-w-2xl' : 'md:grid-cols-2'
        }`}
      >
        {contacts.teams.map((team, index) => {
          const TeamIcon = team.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 22,
                delay: index * 0.08,
              }}
              className="flex h-full flex-col rounded-2xl border border-border/80 bg-card shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.10)] ring-1 ring-surface-highlight/60 ring-inset overflow-hidden"
            >
              {/* Card header */}
              <div className="flex shrink-0 items-center gap-4 border-b border-border bg-muted/70 px-6 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TeamIcon className="h-5 w-5" strokeWidth={ICON_STROKE} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground tracking-tight">{team.title}</h3>
                  <p className="text-sm text-muted-foreground">{team.subtitle}</p>
                </div>
              </div>

              {/* Contacts list — email pinned to card bottom when row counts differ */}
              <div className="flex flex-1 flex-col px-6 py-5">
                <div className="space-y-3">
                  {team.contacts.map((contact, contactIndex) => (
                    <div
                      key={contactIndex}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-muted/80 px-4 py-3.5 border border-border"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/8 border border-primary/15">
                          <Phone className="h-3.5 w-3.5 text-primary" strokeWidth={ICON_STROKE} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground">{contact.name}</p>
                          <p className="font-mono text-sm tabular-nums text-muted-foreground">
                            {contact.mobile}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full shrink-0 h-8 text-xs border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                        asChild
                      >
                        <a href={`tel:${contact.mobile.replace(/[\s.]/g, '')}`}>
                          <Phone className="h-3 w-3 mr-1.5" strokeWidth={ICON_STROKE} />
                          Call
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-auto w-full pt-3">
                  <Button className="w-full rounded-xl font-medium" asChild>
                    <a href={`mailto:${team.email}`}>
                      <Mail className="h-4 w-4 mr-2" strokeWidth={ICON_STROKE} />
                      {team.email}
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
