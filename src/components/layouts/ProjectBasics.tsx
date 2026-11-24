import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { projects, type LinkKind, type Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/context'
import { Build, ScrollScene, useBuildStyle } from '../motion/ScrollScene'
import styles from './ProjectBasics.module.css'

/** Id del h1 del proyecto: lo usa la vista para aria-labelledby y para el foco. */
export const projectTitleId = (slug: string) => `project-title-${slug}`

const linkLabelKey = {
  live: 'viewSite',
  repo: 'viewRepo',
  play: 'play',
  showcase: 'showcase',
  instagram: 'publication',
} as const satisfies Record<LinkKind, string>

export interface ProjectLinksProps {
  project: Project
  className?: string
  /** Si se indica, los botones se construyen con el scroll en esa posición de la secuencia. */
  build?: number
}

/** Botones de enlaces externos (el primero es el principal). */
export function ProjectLinks({ project, className, build }: ProjectLinksProps) {
  const { t } = useT()
  const Wrap = build === undefined ? 'div' : Build
  return (
    <Wrap className={[styles.links, className].filter(Boolean).join(' ')} {...(build === undefined ? null : { i: build })}>
      {project.links.map((link, i) => (
        <a
          key={link.kind}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          data-kind={link.kind}
          className={i === 0 ? styles.primary : styles.secondary}
        >
          {t.projects[linkLabelKey[link.kind]]}
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 3.5h6.5V10M12.5 3.5 4 12" />
          </svg>
          <span className="sr-only">({t.projects.externalLink})</span>
        </a>
      ))}
    </Wrap>
  )
}

const MotionLink = motion.create(Link)

export interface ProjectBasicsProps {
  project: Project
  /** Para integrarlo en un diseño propio. Las variables --pb-* se pueden sobrescribir aquí. */
  className?: string
  /** `light` (por defecto) o `dark`: ajusta tinta, líneas y chips. */
  tone?: 'light' | 'dark'
  style?: CSSProperties
  /** Muestra los créditos bajo «Mi rol» (por defecto sí). Un layout puede pintarlos al final. */
  inlineCredits?: boolean
}

/**
 * Bloque base de una vista de proyecto: nombre (h1), kicker, resumen, rol,
 * stack y enlaces. Los layouts finales lo usan dentro de su diseño.
 */
export default function ProjectBasics({ project, className, tone = 'light', style, inlineCredits = true }: ProjectBasicsProps) {
  const { t } = useT()
  const text = useProjectText(project)
  const rootClass = [styles.root, tone === 'dark' ? styles.dark : '', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} style={{ '--pb-accent': project.accent, ...style } as CSSProperties}>
      <header className={styles.head}>
        {text.award && (
          <Build as="p" className={styles.award}>
            <span>{text.award}</span>
            {text.awardSub && <span className={styles.awardSub}>{text.awardSub}</span>}
          </Build>
        )}
        <Build as="h1" i={1} id={projectTitleId(project.slug)} tabIndex={-1} className={styles.title}>
          {text.name}
        </Build>
        <Build as="p" i={2} className={styles.kicker}>{text.kicker}</Build>
        <Build as="p" i={3} className={styles.summary}>{text.summary}</Build>
      </header>

      <div className={styles.cols}>
        <Build as="section" aria-labelledby={`${project.slug}-role`}>
          <h2 id={`${project.slug}-role`} className={styles.label}>{t.projects.role}</h2>
          <ul className={styles.list}>
            {text.role.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {inlineCredits && text.credits && <p className={styles.credits}>{text.credits}</p>}
          {project.team && (
            <p className={styles.team}>
              <span className={styles.teamLabel}>{t.projects.team}</span> {project.team}
            </p>
          )}
        </Build>

        <Build as="section" i={1} aria-labelledby={`${project.slug}-stack`}>
          <h2 id={`${project.slug}-stack`} className={styles.label}>{t.projects.stack}</h2>
          <ul className={styles.chips}>
            {project.stack.map((s) => (
              <li key={s} className={styles.chip}>{s}</li>
            ))}
          </ul>
        </Build>
      </div>

      <ProjectLinks project={project} build={4} />
    </div>
  )
}

/** Miniatura del proyecto siguiente, con su tamaño real. */
function thumbOf(project: Project): { src: string; width: number; height: number } {
  if (project.assets.manifest) return { src: '/projects/apigym/site-home.webp', width: 1440, height: 900 }
  const portrait = project.slug === 'gym-zong'
  return { src: project.assets.cover, width: portrait ? 1080 : 1440, height: portrait ? 2400 : 900 }
}

export interface ProjectClosingProps {
  project: Project
  /** El layout fija el orden/columna; los colores salen de las variables --pc-*. */
  className?: string
  /** Clase extra para los botones de enlaces (el layout los viste a su manera). */
  linksClassName?: string
}

/**
 * Cierre común de cada caso: enlaces principales repetidos y tarjeta del
 * proyecto siguiente (orden del arreglo, con vuelta al inicio). Se pinta con
 * --pc-ink, --pc-ink-2, --pc-line, --pc-card, --pc-accent, --pc-font y
 * --pc-radius, que cada layout define con su propio kit.
 */
/** Tarjeta del proyecto siguiente; vive dentro de la escena para construirse con el scroll. */
function NextCard({ next }: { next: Project }) {
  const { t } = useT()
  const location = useLocation()
  const backgroundLocation = (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation
  const nextText = useProjectText(next)
  const thumb = thumbOf(next)
  const { ref, style } = useBuildStyle({ i: 1 })
  return (
    <MotionLink
      ref={ref as never}
      style={style}
      to={`/p/${next.slug}`}
      // replace: «Volver» sigue llevando a la home aunque se salte de caso en caso
      replace={Boolean(backgroundLocation)}
      state={backgroundLocation ? { backgroundLocation } : undefined}
      className={styles.next}
    >
      <img
        className={styles.nextThumb}
        src={thumb.src}
        width={thumb.width}
        height={thumb.height}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span className={styles.nextBody}>
        <span className={styles.nextLabel}>
          {t.projects.next} <span aria-hidden>→</span>
        </span>
        <span className={styles.nextName}>{nextText.name}</span>
        <span className={styles.nextKicker}>{nextText.kicker}</span>
      </span>
    </MotionLink>
  )
}

export function ProjectClosing({ project, className, linksClassName }: ProjectClosingProps) {
  const { t } = useT()
  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]!

  return (
    <ScrollScene
      as="section"
      className={[styles.closing, className].filter(Boolean).join(' ')}
      aria-label={t.projects.next}
      style={{ '--pb-accent': project.accent } as CSSProperties}
    >
      <ProjectLinks project={project} build={0} className={[styles.closingLinks, linksClassName].filter(Boolean).join(' ')} />
      <NextCard next={next} />
    </ScrollScene>
  )
}
