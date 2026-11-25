import { LucideIcon, Phone, Mail, Headset } from 'lucide-react'
import styles from '../ServicePage.module.css'

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
  contacts
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
    <aside className={styles.contacts} aria-labelledby="service-contacts-title">
      <header className={styles.contactHeader}>
        <h2 id="service-contacts-title">{contacts.sectionTitle}</h2>
        <Headset size={24} strokeWidth={1.7} aria-hidden="true" />
      </header>
      {contacts.showEmergencyBadge && (
        <div className={styles.emergency}>
          <span className={styles.supportDot} aria-hidden="true" />
          24/7 Emergency Support
        </div>
      )}
      {contacts.teams.map(team => (
        <section key={team.title} className={styles.team} aria-label={team.title}>
          <h3>{team.title}</h3>
          <p className={styles.teamSubtitle}>{team.subtitle}</p>
          <ul className={styles.people}>
            {team.contacts.map(contact => (
              <li key={contact.name}>
                <a className={styles.person} href={`tel:${contact.mobile.replace(/[.\s]/g, '')}`} aria-label={`Call ${contact.name} at ${contact.mobile}`}>
                  <span className={styles.personDetails}>
                    <span className={styles.personName}>{contact.name}</span>
                    <span className={styles.personPhone}>{contact.mobile}</span>
                  </span>
                  <span className={styles.callIcon}><Phone size={17} strokeWidth={1.8} aria-hidden="true" /></span>
                </a>
              </li>
            ))}
          </ul>
          <a href={`mailto:${team.email}`} className={styles.email}>
            <Mail size={18} strokeWidth={1.7} aria-hidden="true" />
            <span>{team.email}</span>
          </a>
        </section>
      ))}
    </aside>
  )
}
