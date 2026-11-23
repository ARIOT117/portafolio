import { motion, useIsPresent } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { getProject, type Project } from '../../content/projects'
import { useT } from '../../i18n/LangProvider'
import { duration, easeOutExpo, spring, useReducedMotionSafe } from '../../styles/motion'
import { layouts } from '../layouts'
import { projectTitleId } from '../layouts/ProjectBasics'
import styles from './ProjectView.module.css'

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

function ProjectDialog({ project }: { project: Project }) {
  const { t } = useT()
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotionSafe()
  const isPresent = useIsPresent()
  const dialogRef = useRef<HTMLDivElement>(null)
  const { slug } = project
  const Layout = layouts[slug]

  // Se decide al montar: con la home debajo hay vuelo; entrando directo, un fade corto.
  const [fromHome] = useState(() => Boolean((location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation))
  const flight = fromHome && !reduced
  const [ready, setReady] = useState(!flight)

  // Respaldo por si onLayoutAnimationComplete no llega
  useEffect(() => {
    if (ready) return
    const id = window.setTimeout(() => setReady(true), 1100)
    return () => window.clearTimeout(id)
  }, [ready])

  const close = useCallback(() => {
    if (fromHome) navigate(-1)
    else navigate('/', { replace: true })
  }, [fromHome, navigate])

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

  // Foco de vuelta a la carpeta al empezar a cerrar
  useEffect(() => {
    if (isPresent) return
    document
      .querySelector<HTMLElement>(`[data-folder-slug="${slug}"]`)
      ?.focus({ preventScroll: true })
  }, [isPresent, slug])

  // Escape y focus trap básico
  useEffect(() => {
    if (!isPresent) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
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

  const fadeOnly = !flight
  const fadeTime = reduced ? 0.15 : duration.base
  const surface = `color-mix(in srgb, ${project.accent} 6%, var(--color-bg))`
  // Durante el vuelo la vista tiene el color de la carpeta y pasa a papel al llegar
  const folderTint = `color-mix(in srgb, ${project.accent} 20%, #d8d3c6)`

  return (
    <motion.div
      ref={dialogRef}
      layoutId={flight ? `folder-${slug}` : undefined}
      transition={flight ? spring.layout : undefined}
      onLayoutAnimationComplete={() => setReady(true)}
      initial={fadeOnly ? { opacity: 0, scale: reduced ? 1 : 0.985 } : undefined}
      animate={fadeOnly ? { opacity: 1, scale: 1, transition: { duration: fadeTime, ease: easeOutExpo } } : undefined}
      exit={fadeOnly ? { opacity: 0, scale: reduced ? 1 : 0.985, transition: { duration: reduced ? 0.15 : 0.2 } } : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={projectTitleId(slug)}
      className={styles.view}
      style={{ borderRadius: 0, background: ready && isPresent ? surface : folderTint }}
    >
      <motion.div
        className={styles.content}
        initial={false}
        animate={{ opacity: ready && isPresent ? 1 : 0 }}
        transition={{ duration: isPresent ? (reduced ? 0.15 : 0.35) : 0.12, ease: 'easeOut' }}
      >
        <div className={styles.scroller}>
          <Layout project={project} />
        </div>
        <button type="button" className={styles.close} onClick={close} aria-label={t.projects.backLabel}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 3.5 5.5 8l4.5 4.5" />
          </svg>
          {t.projects.back}
        </button>
      </motion.div>
    </motion.div>
  )
}
