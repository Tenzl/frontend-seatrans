import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

import { ServiceHeroImage } from './sections/ServiceHeroImage'
import { ContactSection, ContactTeam, StatItem } from './sections/ContactSection'
import { ServicesSection, ServiceItem } from './sections/ServicesSection'
import { FormSection, FormField, InquiryPayload } from './sections/FormSection'
import { GallerySection } from './sections/GallerySection'
import styles from './ServicePage.module.css'

export interface ContactPerson {
  name: string
  mobile: string
}

export interface ServiceTemplateProps {
  serviceName: string
  serviceIcon: LucideIcon
  onNavigateHome?: () => void
  serviceTypeId?: number

  hero: {
    title: string
    description: string
    subtitle?: string
  }

  contacts?: {
    showEmergencyBadge?: boolean
    sectionTitle: string
    sectionDescription: string
    teams: ContactTeam[]
    stats?: StatItem[]
  }

  services?: {
    sectionTitle: string
    sectionDescription: string
    items: ServiceItem[]
  }

  form?: {
    sectionTitle: string
    sectionDescription: string
    badgeText?: string
    fields: FormField[]
    sections?: { title?: string; description?: string; fields: FormField[] }[]
    submitButtonText: string
    onSubmit: (data: InquiryPayload) => void
    submitPath?: string
    serviceTypeSlug?: string
  }

  gallery?: {
    sectionTitle: string
    sectionDescription: string
    enabled: boolean
    imageTypes?: { label: string; value: number }[]
  }

  customSections?: ReactNode[]
}

export function ServiceTemplate({
  serviceTypeId,
  hero,
  contacts,
  services,
  form,
  gallery,
  customSections,
}: ServiceTemplateProps) {
  const mergedForm = form
    ? {
        ...form,
        fields: form.fields,
        sections: form.sections,
        serviceTypeId,
        submitPath: form.submitPath,
        serviceTypeSlug: form.serviceTypeSlug,
        loadingFields: false,
        fieldsError: null,
      }
    : undefined

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="service-title">
        <ServiceHeroImage />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.intro}>
            <h1 id="service-title">{hero.title}</h1>
            {(hero.description || services?.sectionDescription) && (
              <p>{hero.description || services?.sectionDescription}</p>
            )}
          </div>
          <div className={styles.inquiryLayout}>
            {mergedForm && <FormSection form={mergedForm} />}
            {contacts && <ContactSection contacts={contacts} />}
          </div>
        </div>
      </section>
      <div className="container">
        {services && <ServicesSection services={services} />}
        {gallery?.enabled && serviceTypeId && (
          <GallerySection serviceTypeId={serviceTypeId} gallery={gallery} presentation="service" />
        )}

        {customSections?.map((node, i) => (
          <div key={i}>{node}</div>
        ))}
      </div>
    </div>
  )
}
