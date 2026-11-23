import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useT, type Lang } from '../../i18n/context'
import { brandFlight } from '../Intro'
import { useIntroPhase } from '../Intro/introStore'
import styles from './Nav.module.css'

export default function Nav() {
  const { t, lang, setLang } = useT()
  const phase = useIntroPhase()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const introRunning = phase === 'type'
  const options: { code: Lang; short: string; label: string }[] = [
    { code: 'es', short: t.nav.langEs, label: t.nav.langEsLabel },
    { code: 'en', short: t.nav.langEn, label: t.nav.langEnLabel },
  ]

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link
          to="/"
          className={styles.brandLink}
          aria-label={t.nav.home}
          tabIndex={introRunning ? -1 : undefined}
          onClick={(e) => {
            // Ya en la home: solo sube. Desde un proyecto, navega a "/".
            if (location.pathname === '/') {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          {introRunning ? (
            <span className={styles.brand} style={{ visibility: 'hidden' }} aria-hidden>
              {t.nav.brand}
            </span>
          ) : (
            <motion.span layoutId="brand" className={styles.brand} transition={brandFlight}>
              {t.nav.brand}
            </motion.span>
          )}
        </Link>

        <div
          className={styles.right}
          style={{
            opacity: introRunning ? 0 : 1,
            visibility: introRunning ? 'hidden' : 'visible',
          }}
        >
          <nav aria-label="Principal" className={styles.links}>
            <Link to={{ pathname: '/', hash: '#proyectos' }}>{t.nav.projects}</Link>
            <Link to={{ pathname: '/', hash: '#contacto' }}>{t.nav.contact}</Link>
          </nav>
          <div role="group" aria-label={t.nav.language} className={styles.lang}>
            {options.map((o) => (
              <button
                key={o.code}
                type="button"
                lang={o.code}
                aria-pressed={lang === o.code}
                aria-label={o.label}
                className={styles.langBtn}
                onClick={() => setLang(o.code)}
              >
                {o.short}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
