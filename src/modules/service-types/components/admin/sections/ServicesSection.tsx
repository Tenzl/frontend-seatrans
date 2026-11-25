import { LucideIcon } from 'lucide-react'
import styles from '../ServicePage.module.css'

export interface ServiceItem {
  name: string
  description: string
  icon: LucideIcon
}

export function ServicesSection({
  services
}: {
  services: {
    sectionTitle: string
    sectionDescription: string
    items: ServiceItem[]
  }
}) {
  return (
    <section className={styles.services} aria-labelledby="service-offerings-title">
      <h2 id="service-offerings-title" className={styles.sectionTitle}>{services.sectionTitle}</h2>
      <ul className={styles.serviceList}>
        {services.items.map(service => (
          <li key={service.name} className={styles.serviceItem}>
            <span className={styles.serviceIcon}><service.icon size={27} strokeWidth={1.6} aria-hidden="true" /></span>
            <div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
