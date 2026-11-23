import type { CSSProperties } from 'react'
import type { LinkKind, Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/LangProvider'
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
}

/** Botones de enlaces externos (el primero es el principal). */
export function ProjectLinks({ project, className }: ProjectLinksProps) {
  const { t } = useT()
  return (
    <div className={[styles.links, className].filter(Boolean).join(' ')}>
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
    </div>
  )
}

export interface ProjectBasicsProps {
  project: Project
  /** Para integrarlo en un diseño propio. Las variables --pb-* se pueden sobrescribir aquí. */
  className?: string
  /** `light` (por defecto) o `dark`: ajusta tinta, líneas y chips. */
  tone?: 'light' | 'dark'
  style?: CSSProperties
}

/**
 * Bloque base de una vista de proyecto: nombre (h1), kicker, resumen, rol,
 * stack, puntos clave y enlaces. Los layouts finales lo usan dentro de su diseño.
 */
export default function ProjectBasics({ project, className, tone = 'light', style }: ProjectBasicsProps) {
  const { t } = useT()
  const text = useProjectText(project)
  const rootClass = [styles.root, tone === 'dark' ? styles.dark : '', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} style={{ '--pb-accent': project.accent, ...style } as CSSProperties}>
      <header className={styles.head}>
        {text.award && (
          <p className={styles.award}>
            <span>{text.award}</span>
            {text.awardSub && <span className={styles.awardSub}>{text.awardSub}</span>}
          </p>
        )}
        <h1 id={projectTitleId(project.slug)} tabIndex={-1} className={styles.title}>
          {text.name}
        </h1>
        <p className={styles.kicker}>{text.kicker}</p>
        <p className={styles.summary}>{text.summary}</p>
      </header>

      <div className={styles.cols}>
        <section aria-labelledby={`${project.slug}-role`}>
          <h2 id={`${project.slug}-role`} className={styles.label}>{t.projects.role}</h2>
          <ul className={styles.list}>
            {text.role.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {project.team && (
            <p className={styles.team}>
              <span className={styles.teamLabel}>{t.projects.team}</span> {project.team}
            </p>
          )}
        </section>

        <section aria-labelledby={`${project.slug}-stack`}>
          <h2 id={`${project.slug}-stack`} className={styles.label}>{t.projects.stack}</h2>
          <ul className={styles.chips}>
            {project.stack.map((s) => (
              <li key={s} className={styles.chip}>{s}</li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby={`${project.slug}-highlights`}>
        <h2 id={`${project.slug}-highlights`} className={styles.label}>{t.projects.highlights}</h2>
        <ul className={styles.list}>
          {text.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <ProjectLinks project={project} />
    </div>
  )
}
