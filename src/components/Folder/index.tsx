import { useContext, useRef, type PointerEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { projects, type Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/context'
import { useReducedMotionSafe } from '../../styles/motion'
import { OpenProjectContext } from '../ProjectView/context'
import { CoverArt, useCover } from './cover'
import FolderShell from './FolderShell'
import styles from './Folder.module.css'

const MAGNET_PX = 6

export default function Folder({ project, caption = true }: { project: Project; caption?: boolean }) {
  const { t } = useT()
  const text = useProjectText(project)
  const location = useLocation()
  const reduced = useReducedMotionSafe()
  const active = useContext(OpenProjectContext) === project.slug
  const srcs = useCover(project)
  const cardRef = useRef<HTMLAnchorElement>(null)
  const index = Math.max(0, projects.findIndex((p) => p.slug === project.slug))

  const setOffset = (x: number, y: number) => {
    cardRef.current?.style.setProperty('--mx', `${x}px`)
    cardRef.current?.style.setProperty('--my', `${y}px`)
  }

  // Mientras la hoja vuela, la carpeta queda congelada (la vista la marca con data-flying).
  const frozen = () => cardRef.current?.hasAttribute('data-flying') ?? false

  // Magnetismo leve: solo con puntero fino (ratón) y sin reducir movimiento.
  const onPointerMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (reduced || e.pointerType !== 'mouse' || frozen()) return
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
      style={
        {
          '--accent': project.accent,
          '--fg': project.folderGradient,
          '--bob-delay': `${-index * 0.95}s`,
        } as React.CSSProperties
      }
      onPointerMove={onPointerMove}
      onPointerLeave={() => !frozen() && setOffset(0, 0)}
    >
      <FolderShell sheet={<CoverArt project={project} srcs={srcs} />} />
      {caption && (
        <span className={styles.caption}>
          <span className={styles.name}>{text.name}</span>
          <span className={styles.kicker}>{text.kicker}</span>
        </span>
      )}
    </Link>
  )
}
