import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
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
  const groupRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Al cruzar 390 px se esconde uno de los dos controles de idioma: si tenía el foco, pasa a su pareja visible.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(width < 390px)')
    const onChange = () => {
      const active = document.activeElement
      const group = groupRef.current
      const toggle = toggleRef.current
      if (!group || !toggle) return
      if (mq.matches && group.contains(active)) {
        void toggle.offsetWidth // aplica el estilo nuevo para que el botón ya sea enfocable
        toggle.focus({ preventScroll: true })
      } else if (!mq.matches && active === toggle) {
        void group.offsetWidth
        group.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({ preventScroll: true })
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const introRunning = phase === 'type'
  const options: { code: Lang; short: string; label: string }[] = [
    { code: 'es', short: t.nav.langEs, label: t.nav.langEsLabel },
    { code: 'en', short: t.nav.langEn, label: t.nav.langEnLabel },
  ]

  const other = options.find((o) => o.code !== lang) ?? options[0]!

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
            <Link to={{ pathname: '/', hash: '#constancias' }} className={styles.linkCerts}>{t.nav.certificates}</Link>
            <Link to={{ pathname: '/', hash: '#contacto' }}>{t.nav.contact}</Link>
          </nav>
          <div ref={groupRef} role="group" aria-label={t.nav.language} className={styles.lang}>
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
          {/* Menos de 390 px: un solo botón que cambia de idioma; nunca desaparece el elemento enfocado */}
          <button
            ref={toggleRef}
            type="button"
            lang={other.code}
            aria-label={other.label}
            className={`${styles.langBtn} ${styles.langToggle}`}
            onClick={() => setLang(other.code)}
          >
            {other.short}
          </button>
        </div>
      </div>
    </header>
  )
}
