import '@fontsource-variable/manrope'
import '@fontsource-variable/inter'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type PointerEvent, type KeyboardEvent, type ReactNode } from 'react'
import type { Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/context'
import { duration, easeOutExpo, useReducedMotionSafe } from '../../styles/motion'
import ProjectBasics from './ProjectBasics'
import styles from './GymZongLayout.module.css'

type Bi = { es: string; en: string }

/* Textos locales (no existen en i18n). */
const L = {
  privateNote: { es: 'vitrina pública', en: 'public showcase' },
  carousel: { es: 'Capturas de la app', en: 'App screenshots' },
  slide: { es: 'Pantalla', en: 'Screen' },
  pause: { es: 'Pausar animación de pantallas', en: 'Pause screen animation' },
  play: { es: 'Reanudar animación de pantallas', en: 'Play screen animation' },
  features: { es: 'Rasgos clave', en: 'Key features' },
} satisfies Record<string, Bi>

const captions: Bi[] = [
  { es: 'Inicio', en: 'Home' },
  { es: 'Inicio con tu semana', en: 'Home with your week' },
  { es: 'Empezar entrenamiento', en: 'Start workout' },
  { es: 'Descanso entre series', en: 'Rest between sets' },
  { es: 'Estadísticas de la semana', en: 'Week stats' },
  { es: 'Récords', en: 'Records' },
]

const svgProps = {
  viewBox: '0 0 24 24',
  width: 22,
  height: 22,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const features: { icon: ReactNode; tone?: 'streak'; title: Bi; text: Bi }[] = [
  {
    icon: (
      <svg {...svgProps}>
        <ellipse cx="12" cy="5.5" rx="7.5" ry="2.75" />
        <path d="M4.5 5.5v13c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75v-13M4.5 12c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75" />
      </svg>
    ),
    title: { es: 'Sin conexión, con SQLite', en: 'Offline, with SQLite' },
    text: { es: 'Tus datos viven en el teléfono.', en: 'Your data lives on the phone.' },
  },
  {
    icon: (
      <svg {...svgProps}>
        <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
        <path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2" />
      </svg>
    ),
    tone: 'streak',
    title: { es: 'Rachas con congelaciones', en: 'Streaks with freezes' },
    text: { es: 'Congela un día sin perder la racha.', en: 'Freeze a day without losing the streak.' },
  },
  {
    icon: (
      <svg {...svgProps}>
        <path d="M5 20v-8M12 20V4M19 20v-5M3 20h18" />
      </svg>
    ),
    title: { es: 'Estadísticas y récords', en: 'Stats and records' },
    text: { es: 'Tu semana y tus mejores marcas.', en: 'Your week and your best marks.' },
  },
  {
    icon: (
      <svg {...svgProps}>
        <rect x="7" y="2.5" width="10" height="19" rx="2.75" />
        <path d="M11 18.25h2" />
      </svg>
    ),
    title: { es: 'Español y Android primero', en: 'Spanish and Android first' },
    text: { es: 'Pensada en español, para Android.', en: 'Built in Spanish, for Android.' },
  },
]

const SLOT_MS = 3500

/** Posición de cada teléfono según su distancia circular a la pantalla activa. */
const slotFor = (rel: number) => {
  const side = Math.sign(rel)
  if (rel === 0) return { x: '0%', scale: 1, rotateY: 0, opacity: 1, zIndex: 3 }
  if (Math.abs(rel) === 1) return { x: `${side * 74}%`, scale: 0.8, rotateY: -side * 26, opacity: 0.62, zIndex: 2 }
  return { x: `${side * 118}%`, scale: 0.62, rotateY: -side * 34, opacity: 0, zIndex: 1 }
}

function PauseIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      {playing ? (
        <>
          <rect x="3.5" y="3" width="3" height="10" rx="1" />
          <rect x="9.5" y="3" width="3" height="10" rx="1" />
        </>
      ) : (
        <path d="M4.5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.4 2.7a.6.6 0 0 0-.9.5Z" />
      )}
    </svg>
  )
}

function Screens({ images }: { images: string[] }) {
  const { lang } = useT()
  const reduced = useReducedMotionSafe()
  const total = images.length
  const [active, setActive] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const [tabHidden, setTabHidden] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const swipe = useRef<{ x: number; id: number } | null>(null)

  const paused = userPaused || !inView || tabHidden
  const alt = (i: number) => `Gym Zong, ${captions[i]?.[lang] ?? `${L.slide[lang]} ${i + 1}`}`
  const go = useCallback((i: number) => setActive(((i % total) + total) % total), [total])

  useEffect(() => {
    if (reduced) return
    const onVis = () => setTabHidden(document.hidden)
    onVis()
    document.addEventListener('visibilitychange', onVis)
    let io: IntersectionObserver | undefined
    if (stageRef.current && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => setInView(entries[0]?.isIntersecting ?? true), { threshold: 0.25 })
      io.observe(stageRef.current)
    }
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      io?.disconnect()
    }
  }, [reduced])

  if (reduced) {
    return (
      <div className={styles.carousel} role="region" aria-roledescription="carousel" aria-label={L.carousel[lang]}>
        <ul className={styles.gallery} tabIndex={0} aria-label={L.carousel[lang]}>
          {images.map((src, i) => (
            <li key={src} className={styles.galleryItem}>
              <figure className={styles.figure}>
                <div className={styles.phone}>
                  <div className={styles.screen}>
                    <img src={src} width={1080} height={2400} alt={alt(i)} loading={i < 3 ? 'eager' : 'lazy'} draggable={false} />
                  </div>
                </div>
                <figcaption className={styles.caption}>
                  <span className={styles.num}>{i + 1}</span>
                  {captions[i]?.[lang]}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    swipe.current = { x: e.clientX, id: e.pointerId }
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current
    swipe.current = null
    if (!start || start.id !== e.pointerId) return
    const dx = e.clientX - start.x
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1))
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') go(active + 1)
    else if (e.key === 'ArrowLeft') go(active - 1)
  }

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label={L.carousel[lang]}
      data-paused={paused}
    >
      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        onKeyDown={onKeyDown}
      >
        <ul className={styles.deck}>
          {images.map((src, i) => {
            let rel = (((i - active) % total) + total) % total
            if (rel > total / 2) rel -= total
            const isActive = rel === 0
            return (
              <motion.li
                key={src}
                className={styles.slide}
                data-pos={Math.abs(rel) > 1 ? 'far' : rel}
                initial={false}
                animate={slotFor(rel)}
                transition={{ type: 'spring', stiffness: 105, damping: 17, mass: 1 }}
                aria-hidden={isActive ? undefined : true}
              >
                <div className={styles.float} style={{ animationDelay: `${-i * 0.9}s` }}>
                  <div className={styles.phone}>
                    <div className={styles.screen}>
                      <img
                        src={src}
                        width={1080}
                        height={2400}
                        alt={alt(i)}
                        loading={i < 3 ? 'eager' : 'lazy'}
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ul>
      </div>

      <div className={styles.caption} aria-live={paused && userPaused ? 'polite' : 'off'} aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={active}
            className={styles.captionText}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: easeOutExpo }}
          >
            {captions[active]?.[lang]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className={styles.controls}>
        <div className={styles.bars} role="group" aria-label={L.slide[lang]}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.bar}
              aria-label={`${L.slide[lang]} ${i + 1}: ${captions[i]?.[lang] ?? ''}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => go(i)}
            >
              <span
                className={[styles.fill, i === active ? styles.fillActive : '', i < active ? styles.fillDone : '']
                  .filter(Boolean)
                  .join(' ')}
                style={{ animationDuration: `${SLOT_MS}ms` }}
                onAnimationEnd={(e) => {
                  if (i === active && e.target === e.currentTarget) go(active + 1)
                }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setUserPaused((v) => !v)}
          aria-pressed={userPaused}
          aria-label={userPaused ? L.play[lang] : L.pause[lang]}
        >
          <PauseIcon playing={!userPaused} />
        </button>
      </div>
    </div>
  )
}

export default function GymZongLayout({ project }: { project: Project }) {
  const { t, lang } = useT()
  const text = useProjectText(project)
  const reduced = useReducedMotionSafe()
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduced ? 0.12 : duration.slow, ease: easeOutExpo, delay: reduced ? 0 : delay },
  })

  return (
    <div className={styles.page}>
      {/* ProjectBasics usa display: contents; su CSS reparte cabecera, enlaces y datos en la rejilla */}
      <ProjectBasics project={project} className={styles.pb} />

      <img
        className={styles.logo}
        src="/projects/gym-zong/logo-horizontal.svg"
        width={400}
        height={100}
        alt="Gym Zong"
      />

      <p className={styles.note}>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
        </svg>
        {t.projects.privateRepo} · {L.privateNote[lang]}
      </p>

      <motion.section className={styles.band} aria-label={text.name} {...reveal(0.05)}>
        <Screens images={project.assets.images} />
      </motion.section>

      <ul className={styles.features} aria-label={L.features[lang]}>
        {features.map((f, i) => (
          <motion.li key={f.title.en} className={styles.feature} {...reveal(i * 0.06)}>
            <span className={[styles.icon, f.tone === 'streak' ? styles.streak : ''].filter(Boolean).join(' ')}>{f.icon}</span>
            <h2 className={styles.featureTitle}>{f.title[lang]}</h2>
            <p className={styles.featureText}>{f.text[lang]}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
