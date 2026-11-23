import { motion } from 'motion/react'
import { useContext, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link, useLocation } from 'react-router'
import type { Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/LangProvider'
import { useReducedMotionSafe } from '../../styles/motion'
import { OpenProjectContext } from '../ProjectView/context'
import styles from './Folder.module.css'

const MAGNET_PX = 6

let manifestPromise: Promise<string | null> | null = null

/** ApiGym: la portada es el frame-00 del primer ejercicio del manifest. */
function loadApiGymCover(url: string): Promise<string | null> {
  manifestPromise ??= fetch(url)
    .then((r) => r.json() as Promise<{ frames: string[] }[]>)
    .then((list) => list[0]?.frames[0] ?? null)
    .catch(() => null)
  return manifestPromise
}

function useCover(project: Project): string | null {
  const { manifest, cover } = project.assets
  const [src, setSrc] = useState<string | null>(manifest ? null : cover)
  useEffect(() => {
    if (!manifest) return
    let alive = true
    loadApiGymCover(manifest).then((s) => alive && setSrc(s))
    return () => {
      alive = false
    }
  }, [manifest])
  return src
}

export default function Folder({ project }: { project: Project }) {
  const { t } = useT()
  const text = useProjectText(project)
  const location = useLocation()
  const reduced = useReducedMotionSafe()
  const active = useContext(OpenProjectContext) === project.slug
  const cover = useCover(project)
  const cardRef = useRef<HTMLAnchorElement>(null)
  const light = Boolean(project.assets.manifest)

  const setOffset = (x: number, y: number) => {
    cardRef.current?.style.setProperty('--mx', `${x}px`)
    cardRef.current?.style.setProperty('--my', `${y}px`)
  }

  // Magnetismo leve: solo con puntero fino (ratón) y sin reducir movimiento.
  const onPointerMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (reduced || e.pointerType !== 'mouse') return
    if (!window.matchMedia?.('(pointer: fine)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)))
    const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)))
    setOffset(nx * MAGNET_PX, ny * MAGNET_PX)
  }

  return (
    <Link
      ref={cardRef}
      to={`/p/${project.slug}`}
      state={{ backgroundLocation: location }}
      data-folder-slug={project.slug}
      data-active={active || undefined}
      aria-label={`${t.projects.open} ${text.name}`}
      className={styles.card}
      style={{ '--accent': project.accent } as React.CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setOffset(0, 0)}
    >
      <motion.span layoutId={`folder-${project.slug}`} className={styles.art} style={{ borderRadius: 18 }}>
        <span className={styles.inner} aria-hidden>
          <span className={styles.tab} />
          <span className={styles.back} />
          <span className={`${styles.sheet} ${light ? styles.sheetLight : ''}`}>
            {cover && <img src={cover} alt="" draggable={false} loading="lazy" decoding="async" />}
          </span>
          <span className={styles.front} />
        </span>
      </motion.span>
      <span className={styles.caption}>
        <span className={styles.name}>{text.name}</span>
        <span className={styles.kicker}>{text.kicker}</span>
      </span>
    </Link>
  )
}
