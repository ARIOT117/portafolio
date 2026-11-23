import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import type { Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT, type Lang } from '../../i18n/LangProvider'
import { easeOutExpo, useReducedMotionSafe } from '../../styles/motion'
import { ProjectLinks, projectTitleId } from './ProjectBasics'
import styles from './EclipseRojoLayout.module.css'

type Bi = { es: string; en: string }
const pick = (b: Bi, lang: Lang) => b[lang]

/* Textos locales: no existen en i18n y este archivo es el único editable. */
const phases: { title: Bi; body: Bi }[] = [
  {
    title: { es: 'Briefing', en: 'Briefing' },
    body: {
      es: 'Lees el objetivo de la misión y eliges nivel: Entrenamiento, Misión estándar o Tormenta severa.',
      en: 'You read the mission objective and pick a level: Training, Standard mission or Severe storm.',
    },
  },
  {
    title: { es: 'Configuración y revisión', en: 'Setup and review' },
    body: {
      es: 'Eliges órbita, lanzador e instrumentos. Un semáforo avisa si te pasas de masa, potencia, costo o espacios.',
      en: 'You choose orbit, launcher and instruments. A traffic light warns you if you exceed mass, power, cost or slots.',
    },
  },
  {
    title: { es: 'Operación', en: 'Operation' },
    body: {
      es: 'Enciendes instrumentos sin pasarte de energía, escaneas Marte para hallar la anomalía térmica y resuelves eventos de la nave.',
      en: 'You switch on instruments within your energy budget, scan Mars to find the thermal anomaly and handle ship events.',
    },
  },
  {
    title: { es: 'Informe', en: 'Report' },
    body: {
      es: 'Conclusión, evidencias, recursos usados y puntos.',
      en: 'Conclusion, evidence, resources used and score.',
    },
  },
]

const L = {
  hudTitle: { es: 'Cómo se juega', en: 'How it plays' } as Bi,
  phase: { es: 'Fase', en: 'Phase' } as Bi,
  panelTitle: { es: 'Revisión de configuración', en: 'Setup review' } as Bi,
  panelNote: { es: 'Ilustrativo', en: 'Illustrative' } as Bi,
  ok: { es: 'En rango', en: 'In range' } as Bi,
  near: { es: 'Cerca del límite', en: 'Near the limit' } as Bi,
  honest: {
    es: 'Los valores del juego son ficticios, no son capacidades oficiales de NASA.',
    en: 'The game values are fictional, not official NASA capabilities.',
  } as Bi,
  screenAlt: {
    es: 'Pantalla de inicio del juego: Marte con una órbita y el título Operation Red Eclipse',
    en: 'Game start screen: Mars with an orbit line and the title Operation Red Eclipse',
  } as Bi,
}

const bars: { label: Bi; value: number; warn?: boolean }[] = [
  { label: { es: 'Masa', en: 'Mass' }, value: 64 },
  { label: { es: 'Potencia', en: 'Power' }, value: 82 },
  { label: { es: 'Costo', en: 'Cost' }, value: 94, warn: true },
]

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotionSafe()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.6, ease: easeOutExpo, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function EclipseRojoLayout({ project }: { project: Project }) {
  const { lang } = useT()
  const { t } = useT()
  const text = useProjectText(project)
  const reduced = useReducedMotionSafe()
  const vars = { '--er-red': project.accent, '--er-cyan': project.accent2 ?? '#2FB8D6' } as CSSProperties

  return (
    <div className={styles.root} style={vars}>
      <section className={styles.hero}>
        <img className={styles.heroImg} src={project.assets.cover} alt="" width={1440} height={900} fetchPriority="high" />
        <div className={styles.heroShade} aria-hidden />
        <div className={styles.heroInner}>
          {text.award && (
            <p className={styles.award}>
              <span className={styles.awardMain}>{text.award}</span>
              {text.awardSub && <span className={styles.awardSub}>{text.awardSub}</span>}
            </p>
          )}
          <h1 id={projectTitleId(project.slug)} tabIndex={-1} className={styles.title}>
            {text.name}
          </h1>
          <p className={styles.kicker}>{text.kicker}</p>
          <p className={styles.summary}>{text.summary}</p>
          <ProjectLinks project={project} className={styles.actions} />
        </div>
      </section>

      <div className={styles.body}>
        <section className={styles.hud} aria-labelledby="er-hud">
          <Reveal>
            <h2 id="er-hud" className={styles.h2}>{pick(L.hudTitle, lang)}</h2>
          </Reveal>
          <div className={styles.hudGrid}>
            <ol className={styles.phases}>
              {phases.map((p, i) => (
                <li key={p.title.en}>
                  <Reveal className={styles.phase} delay={reduced ? 0 : i * 0.06}>
                    <span className={styles.phaseNum} aria-hidden>0{i + 1}</span>
                    <div>
                      <h3 className={styles.phaseTitle}>
                        <span className="sr-only">{pick(L.phase, lang)} {i + 1}: </span>
                        {pick(p.title, lang)}
                      </h3>
                      <p className={styles.phaseBody}>{pick(p.body, lang)}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>

            <Reveal className={styles.panelWrap} delay={0.1}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3 className={styles.panelTitle}>{pick(L.panelTitle, lang)}</h3>
                  <span className={styles.panelNote}>{pick(L.panelNote, lang)}</span>
                </div>
                <ul className={styles.bars}>
                  {bars.map((b, i) => (
                    <li key={b.label.en} className={styles.bar} data-warn={b.warn || undefined}>
                      <div className={styles.barRow}>
                        <span>{pick(b.label, lang)}</span>
                        <span className={styles.barVal}>{b.value}%</span>
                      </div>
                      <motion.div
                        className={styles.track}
                        initial={reduced ? false : 'out'}
                        whileInView="in"
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: easeOutExpo, delay: 0.25 + i * 0.12 }}
                      >
                        <motion.span
                          className={styles.fill}
                          style={{ width: `${b.value}%`, transformOrigin: 'left' }}
                          variants={{ out: { scaleX: 0 }, in: { scaleX: 1 } }}
                        />
                      </motion.div>
                      <span className={styles.status}>
                        <span className={styles.dot} aria-hidden />
                        {pick(b.warn ? L.near : L.ok, lang)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <figure className={styles.shot}>
                <img src={project.assets.cover} alt={pick(L.screenAlt, lang)} loading="lazy" width={1440} height={900} />
              </figure>
            </Reveal>
          </div>
        </section>

        <Reveal>
          <div className={styles.cols}>
            <section aria-labelledby="er-role">
              <h2 id="er-role" className={styles.label}>{t.projects.role}</h2>
              <ul className={styles.list}>
                {text.role.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="er-stack">
              <h2 id="er-stack" className={styles.label}>{t.projects.stack}</h2>
              <ul className={styles.chips}>
                {project.stack.map((s) => (
                  <li key={s} className={styles.chip}>{s}</li>
                ))}
              </ul>
              {project.team && (
                <p className={styles.team}>
                  <span className={styles.teamLabel}>{t.projects.team}</span>
                  <span className={styles.teamName}>{project.team}</span>
                </p>
              )}
            </section>
          </div>
        </Reveal>

        <Reveal>
          <section aria-labelledby="er-hl">
            <h2 id="er-hl" className={styles.label}>{t.projects.highlights}</h2>
            <ul className={styles.list}>
              {text.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
        </Reveal>

        <p className={styles.honest}>{pick(L.honest, lang)}</p>
      </div>
    </div>
  )
}
