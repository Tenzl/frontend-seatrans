import Image from 'next/image'
import styles from '../ServicePage.module.css'

export function ServiceHeroImage() {
  return (
    <Image
      src="/services/maritime-inquiry.webp"
      alt=""
      fill
      priority
      sizes="100vw"
      className={styles.heroImage}
    />
  )
}
