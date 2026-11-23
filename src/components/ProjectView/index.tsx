import { animate, motion, usePresence } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { getProject, type Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/context'
import { duration, easeOutExpo, useReducedMotionSafe } from '../../styles/motion'
import { CoverArt, useCover } from '../Folder/cover'
import folderStyles from '../Folder/Folder.module.css'
import { layouts } from '../layouts'
import { projectTitleId } from '../layouts/ProjectBasics'
import styles from './ProjectView.module.css'

/** Vistas oscuras: la barra y el botón Volver toman su fondo y tinta. */
const DARK_SLUGS: readonly string[] = ['eclipse-rojo', 'apigym']

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function ProjectView({ slug }: { slug: string }) {
  const project = getProject(slug)
  return project ? <ProjectDialog project={project} /> : <NotFound />
}

function NotFound() {
  const { t } = useT()
  return (
    <div className={styles.notFound}>
      <p>{t.projects.notFound}</p>
      <Link to="/" className={styles.homeLink}>
        {t.nav.home}
      </Link>
    </div>
  )
}

/** Curva de la hoja: arranque decidido, aterrizaje suave. */
const FLIGHT_EASE = [0.32, 0.72, 0, 1] as const
const FLIGHT_S = 0.78
const LAND_S = 0.62

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

interface Flight {
  from: Rect
  /** Píxeles de la hoja que tapa el panel frontal de la carpeta */
  covered: number
  lift: boolean
}

const folderEl = (slug: string) =>
  document.querySelector<HTMLElement>(`[data-folder-slug="${slug}"]`)

const sheetRect = (el: HTMLElement | null): Rect | null => {
  const r = el?.querySelector('[data-folder-sheet]')?.getBoundingClientRect()
  return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null
}

/** Mide la hoja de la carpeta y cuánto tapa el panel frontal. Null si no hay carpeta visible. */
function measureFlight(slug: string): Flight | null {
  const card = folderEl(slug)
  const from = sheetRect(card)
  if (!card || !from || from.width === 0) return null
  const front = card.querySelector('[data-folder-front]')?.getBoundingClientRect()
  const covered = front ? Math.max(0, Math.min(from.height, from.top + from.height - front.top)) : 0
  return { from, covered, lift: card.matches(':hover, :focus-visible') }
}

const rectStyle = (r: Rect) => ({ left: r.left, top: r.top, width: r.width, height: r.height })
const insetBottom = (px: number) => `inset(0px 0px ${Math.round(px)}px 0px)`

function ProjectDialog({ project }: { project: Project }) {
  const { t } = useT()
  const baseTitle = useRef(t.meta.title)
  baseTitle.current = t.meta.title
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotionSafe()
  const [isPresent, safeToRemove] = usePresence()
  const dialogRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const flyerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const keyboardClose = useRef(false)
  const enter = useRef<{ stop: () => void }[]>([])
  const bgTimer = useRef(0)
  const { slug } = project
  const text = useProjectText(project)
  const tone = DARK_SLUGS.includes(slug) ? 'dark' : 'light'
  const Layout = layouts[slug]
  const srcs = useCover(project)

  // Se decide al montar: con la home debajo y movimiento normal hay vuelo; si no, un fade corto.
  const [fromHome] = useState(() => Boolean((location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation))
  const [flight] = useState<Flight | null>(() => (fromHome && !reduced ? measureFlight(slug) : null))
  const [ready, setReady] = useState(!flight)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [viewBg, setViewBg] = useState<string>()

  const close = useCallback(
    (byKeyboard = false) => {
      keyboardClose.current = byKeyboard
      if (fromHome) navigate(-1)
      else navigate('/', { replace: true })
    },
    [fromHome, navigate],
  )

  // La carpeta se congela con su pose actual mientras la hoja vuela. La hoja de la
  // carpeta solo se oculta cuando las imágenes de la que vuela ya están pintables
  // (si no, habría un hueco de un frame).
  useLayoutEffect(() => {
    if (!flight) return
    const card = folderEl(slug)
    const flyer = flyerRef.current
    card?.setAttribute('data-flying', '')
    if (flight.lift) card?.setAttribute('data-lift', '')
    // Se muestra la hoja que vuela cuando sus imágenes ya están decodificadas; solo
    // entonces (y un par de frames después) se oculta la hoja de la carpeta.
    let alive = true
    const imgs = Array.from(flyer?.querySelectorAll('img') ?? [])
    Promise.all(imgs.map((i) => i.decode().catch(() => undefined))).then(() => {
      if (!alive) return
      if (flyer) flyer.style.visibility = 'visible'
      requestAnimationFrame(() => requestAnimationFrame(() => alive && card?.setAttribute('data-hide', '')))
    })
    return () => {
      alive = false
      card?.removeAttribute('data-flying')
      card?.removeAttribute('data-lift')
      card?.removeAttribute('data-hide')
    }
  }, [flight, slug])

  // Barra superior: aparece al hacer scroll y toma el fondo del layout (claro u oscuro)
  useEffect(() => {
    const sc = scrollerRef.current
    if (!sc) return
    const onScroll = () => setScrolled(sc.scrollTop > 8)
    sc.addEventListener('scroll', onScroll, { passive: true })
    const id = requestAnimationFrame(() => {
      const el = sc.firstElementChild
      const bg = el ? getComputedStyle(el).backgroundColor : ''
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        setViewBg(bg)
      }
    })
    return () => {
      sc.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(id)
    }
  }, [])

  // Título de la pestaña: "<proyecto> · Diego Esparza"; al cerrar vuelve al título base
  // (LangProvider fija el título base en su efecto, que corre después del de este hijo:
  // por eso se reaplica en el siguiente frame al cambiar de idioma.)
  useEffect(() => {
    const set = () => {
      document.title = `${text.name} · Diego Esparza`
    }
    set()
    const id = requestAnimationFrame(set)
    return () => cancelAnimationFrame(id)
  }, [text.name])
  useEffect(
    () => () => {
      document.title = baseTitle.current
    },
    [],
  )

  // Bloqueo de scroll del body
  useEffect(() => {
    const root = document.documentElement
    const prev = { overflow: root.style.overflow, padding: root.style.paddingInlineEnd }
    // Compensa la barra de scroll que desaparece para que la home no se desplace
    const bar = window.innerWidth - root.clientWidth
    root.style.overflow = 'hidden'
    if (bar > 0) root.style.paddingInlineEnd = `${bar}px`
    return () => {
      root.style.overflow = prev.overflow
      root.style.paddingInlineEnd = prev.padding
    }
  }, [])

  // Foco al título al abrir
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      document.getElementById(projectTitleId(slug))?.focus({ preventScroll: true }),
    )
    return () => cancelAnimationFrame(id)
  }, [slug])

  // Entrada: la hoja sale de la carpeta y crece hasta ser la página
  useEffect(() => {
    const flyer = flyerRef.current
    const bg = bgRef.current
    if (!flight || !flyer || !bg) return
    const full = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
    const fly = animate(flyer, { ...full, borderRadius: 0 }, { duration: FLIGHT_S, ease: FLIGHT_EASE })
    // La hoja termina de salir del panel mientras empieza a crecer
    const reveal = animate(flyer, { clipPath: insetBottom(0) }, { duration: 0.34, ease: easeOutExpo })
    enter.current = [fly, reveal]
    // Crossfade al fondo de la vista cuando la imagen ya casi cubre la pantalla
    bgTimer.current = window.setTimeout(() => {
      enter.current.push(animate(bg, { opacity: 1 }, { duration: 0.32, ease: 'easeOut' }))
    }, 440)
    let alive = true
    fly.then(() => {
      if (!alive) return
      setReady(true)
      enter.current = [animate(flyer, { opacity: 0 }, { duration: 0.28, ease: 'easeOut' })]
    })
    return () => {
      alive = false
      window.clearTimeout(bgTimer.current)
    }
  }, [flight])

  // Salida: el contenido se apaga, la hoja se encoge a la carpeta y el dibujo reaparece
  useEffect(() => {
    if (isPresent) return
    // Foco de vuelta a la carpeta. Con ratón no se dibuja el anillo; con teclado sí.
    const card = folderEl(slug)
    if (card) {
      card.focus(
        keyboardClose.current
          ? { preventScroll: true }
          : ({ preventScroll: true, focusVisible: false } as FocusOptions),
      )
    }

    const flyer = flyerRef.current
    const bg = bgRef.current
    const root = dialogRef.current
    if (!flight || !flyer || !bg || !root) {
      if (!root) return safeToRemove?.()
      const fade = animate(root, { opacity: 0 }, { duration: reduced ? 0.15 : 0.2, ease: 'easeOut' })
      fade.then(() => safeToRemove?.())
      return () => fade.stop()
    }

    window.clearTimeout(bgTimer.current)
    enter.current.forEach((c) => c.stop())
    let alive = true
    const target = sheetRect(card) ?? flight.from
    const run = async () => {
      await animate(flyer, { opacity: 1 }, { duration: 0.16, ease: 'easeOut' })
      if (!alive) return
      animate(bg, { opacity: 0 }, { duration: 0 })
      await Promise.all([
        animate(flyer, { ...rectStyle(target), borderRadius: 8 }, { duration: LAND_S, ease: FLIGHT_EASE }),
        animate(flyer, { clipPath: insetBottom(flight.covered) }, { duration: 0.3, delay: LAND_S - 0.3, ease: 'easeIn' }),
      ])
      if (alive) safeToRemove?.()
    }
    run()
    const guard = window.setTimeout(() => safeToRemove?.(), 1600)
    return () => {
      alive = false
      window.clearTimeout(guard)
    }
  }, [isPresent]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape y focus trap básico
  useEffect(() => {
    if (!isPresent) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close(true)
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!
      const current = document.activeElement
      const inside = dialogRef.current?.contains(current)
      if (!inside || (e.shiftKey && current === first)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPresent, close])

  const fadeTime = reduced ? 0.15 : duration.base
  const surface = `color-mix(in srgb, ${project.accent} 6%, var(--color-bg))`
  const dark = Boolean(project.assets.manifest)

  return (
    <motion.div
      ref={dialogRef}
      initial={flight ? false : { opacity: 0, scale: reduced ? 1 : 0.985 }}
      animate={flight ? undefined : { opacity: 1, scale: 1, transition: { duration: fadeTime, ease: easeOutExpo } }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={projectTitleId(slug)}
      className={styles.view}
    >
      <div ref={bgRef} className={styles.bg} style={{ background: surface, opacity: flight ? 0 : 1 }} />
      {flight && (
        <div
          ref={flyerRef}
          aria-hidden
          className={`${styles.flyer} ${dark ? folderStyles.sheetDark : styles.flyerLight}`}
          style={{
            ...rectStyle(flight.from),
            borderRadius: 8,
            visibility: 'hidden',
            clipPath: insetBottom(flight.covered),
            ['--accent' as string]: project.accent,
          }}
        >
          <CoverArt project={project} srcs={srcs} eager />
        </div>
      )}
      <motion.div
        ref={contentRef}
        className={styles.content}
        initial={false}
        animate={{ opacity: ready && isPresent ? 1 : 0 }}
        transition={{ duration: isPresent ? (reduced ? 0.15 : 0.35) : 0.12, delay: isPresent && flight ? 0.16 : 0, ease: 'easeOut' }}
      >
        <div ref={scrollerRef} className={styles.scroller}>
          <Layout project={project} />
        </div>
        <div
          aria-hidden
          className={styles.bar}
          data-visible={scrolled || undefined}
          data-tone={tone}
          style={viewBg ? ({ '--view-bg': viewBg } as React.CSSProperties) : undefined}
        />
        <button type="button" className={styles.close} data-tone={tone} style={viewBg ? ({ '--view-bg': viewBg } as React.CSSProperties) : undefined} onClick={(e) => close(e.detail === 0)} aria-label={t.projects.backLabel}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 3.5 5.5 8l4.5 4.5" />
          </svg>
          {t.projects.back}
        </button>
      </motion.div>
    </motion.div>
  )
}
