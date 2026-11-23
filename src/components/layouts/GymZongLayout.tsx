import '@fontsource-variable/manrope'
import '@fontsource-variable/inter'
import { motion } from 'motion/react'
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
  prev: { es: 'Pantalla anterior', en: 'Previous screen' },
  next: { es: 'Pantalla siguiente', en: 'Next screen' },
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

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === 'left' ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'} />
    </svg>
  )
}

function Screens({ images }: { images: string[] }) {
  const { lang } = useT()
  const reduced = useReducedMotionSafe()
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ x: 0, left: 0 })
  const raf = useRef(0)
  const total = images.length

  const nearest = useCallback(() => {
    const track = trackRef.current
    if (!track) return 0
    const mid = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    Array.from(track.children).forEach((el, i) => {
      const c = el as HTMLElement
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }, [])

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current
      const el = track?.children[Math.max(0, Math.min(total - 1, i))] as HTMLElement | undefined
      if (!track || !el) return
      track.scrollTo({
        left: el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2,
        behavior: reduced ? 'auto' : 'smooth',
      })
    },
    [reduced, total],
  )

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const onScroll = () => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => setActive(nearest()))
  }

  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !trackRef.current) return
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    if (!dragging || !trackRef.current) return
    trackRef.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
  }
  const endDrag = (e: PointerEvent<HTMLUListElement>) => {
    if (!dragging) return
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
    goTo(nearest())
  }

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(active + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(active - 1)
    }
  }

  return (
    <div className={styles.carousel} role="region" aria-roledescription="carousel" aria-label={L.carousel[lang]}>
      <ul
        ref={trackRef}
        className={[styles.track, dragging ? styles.dragging : ''].filter(Boolean).join(' ')}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {images.map((src, i) => (
          <li
            key={src}
            className={styles.slide}
            data-active={i === active}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${total}`}
          >
            <figure className={styles.figure}>
              <div className={styles.phone}>
                <img
                  src={src}
                  width={1080}
                  height={2400}
                  alt={`Gym Zong, ${captions[i]?.[lang] ?? `${L.slide[lang]} ${i + 1}`}`}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
              <figcaption className={styles.caption}>
                <span className={styles.num}>{i + 1}</span>
                {captions[i]?.[lang]}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className={styles.controls}>
        <p className={styles.counter}>
          <span>{active + 1}</span> / {total}
        </p>
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={L.prev[lang]}>
            <Chevron dir="left" />
          </button>
          <button type="button" className={styles.arrow} onClick={() => goTo(active + 1)} disabled={active === total - 1} aria-label={L.next[lang]}>
            <Chevron dir="right" />
          </button>
        </div>
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
