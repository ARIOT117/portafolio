import { useT } from '../../i18n/LangProvider'
import styles from './Footer.module.css'

export default function Footer() {
  const { t } = useT()
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <p>{t.footer.copyright}</p>
        <p>{t.footer.built}</p>
      </div>
    </footer>
  )
}
