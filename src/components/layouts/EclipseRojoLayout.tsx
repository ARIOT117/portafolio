import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import type { Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT, type Lang } from '../../i18n/context'
import { easeOutExpo, useReducedMotionSafe } from '../../styles/motion'
import { ProjectLinks, projectTitleId } from './ProjectBasics'
import EclipseRojoPlanet from './EclipseRojoPlanet'
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
  hudTitle: { es: 'Línea de misión', en: 'Mission line' } as Bi,
  setupTitle: { es: 'Antes del despegue', en: 'Before launch' } as Bi,
  awardCta: { es: 'Ver la publicación del premio', en: 'See the award post' } as Bi,
  scanTitle: { es: 'Escaneo de la anomalía', en: 'Scanning the anomaly' } as Bi,
  scanIntro: {
    es: 'Durante la operación escaneas el terreno con la cámara térmica. Cuando el barrido pasa por la anomalía, el mapa de calor la delata.',
    en: 'During operation you scan the terrain with the thermal camera. When the sweep passes over the anomaly, the heat map gives it away.',
  } as Bi,
  scanning: { es: 'Escaneando', en: 'Scanning' } as Bi,
  found: { es: 'Anomalía térmica detectada', en: 'Thermal anomaly detected' } as Bi,
  scanAlt: {
    es: 'Imagen orbital en gris de cárcavas en la pared de un cráter, con el mapa térmico revelándose sobre ella',
    en: 'Grayscale orbital image of gullies on a crater wall, with the thermal map being revealed over it',
  } as Bi,
  evTitle: { es: 'Evidencias del juego', en: 'Game evidence' } as Bi,
  evCredit: { es: 'Arte del juego: equipo DualDynamics', en: 'Game art: DualDynamics team' } as Bi,
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

const evidence: { src: string; name: Bi; caption: Bi; alt: Bi }[] = [
  {
    src: 'termica',
    name: { es: 'Cámara térmica', en: 'Thermal camera' },
    caption: { es: 'Mapa de calor donde la anomalía resalta entre zonas frías.', en: 'Heat map where the anomaly stands out among cold zones.' },
    alt: { es: 'Mapa térmico en naranja y morado de un terreno de Marte', en: 'Orange and purple thermal map of a Martian terrain' },
  },
  {
    src: 'radar',
    name: { es: 'Radar', en: 'Radar' },
    caption: { es: 'Corte del subsuelo con montículos en forma de domo.', en: 'Subsurface cross-section with dome-shaped mounds.' },
    alt: { es: 'Corte de radar en grises con montículos en forma de domo', en: 'Grayscale radar cross-section with dome-shaped mounds' },
  },
  {
    src: 'espectrometro',
    name: { es: 'Espectrómetro', en: 'Spectrometer' },
    caption: { es: 'Compuesto en falso color de laderas con cárcavas.', en: 'False-color composite of gullied slopes.' },
    alt: { es: 'Imagen en falso color turquesa y magenta de laderas con cárcavas', en: 'Teal and magenta false-color image of gullied slopes' },
  },
  {
    src: 'alta-res',
    name: { es: 'Alta resolución', en: 'High resolution' },
    caption: { es: 'Vista orbital de terreno en capas con borde de acantilado.', en: 'Orbital view of layered terrain with a cliff edge.' },
    alt: { es: 'Vista orbital de alta resolución de terreno en capas', en: 'High-resolution orbital view of layered terrain' },
  },
  {
    src: 'region',
    name: { es: 'Región', en: 'Region' },
    caption: { es: 'Cárcavas en la pared de un cráter, en escala de grises.', en: 'Gullies on a crater wall, in grayscale.' },
    alt: { es: 'Imagen orbital en grises de cárcavas en la pared de un cráter', en: 'Grayscale orbital image of gullies on a crater wall' },
  },
  {
    src: 'atmosferico',
    name: { es: 'Atmosférico', en: 'Atmospheric' },
    caption: { es: 'Volcanes con columnas de polvo y nubes.', en: 'Volcanoes with plumes of dust and clouds.' },
    alt: { es: 'Volcanes de Marte con columnas de polvo y nubes', en: 'Martian volcanoes with dust and cloud plumes' },
  },
]

/* El visor es un overlay con su propio contenedor de scroll: lo localizamos
   subiendo por el DOM para que useScroll lea ese elemento y no la ventana. */
function useScroller(anchor: RefObject<HTMLElement | null>): { container?: RefObject<HTMLElement> } {
  const [scroller, setScroller] = useState<RefObject<HTMLElement> | null>(null)
  useLayoutEffect(() => {
    let el = anchor.current?.parentElement ?? null
    while (el) {
      const oy = getComputedStyle(el).overflowY
      if (oy === 'auto' || oy === 'scroll') break
      el = el.parentElement
    }
    // Sin contenedor propio (p. ej. en tests) se usa el scroll de la ventana.
    if (el) setScroller({ current: el })
  }, [anchor])
  return scroller ? { container: scroller } : {}
}

function Timeline({ reduced, lang }: { reduced: boolean; lang: Lang }) {
  const ref = useRef<HTMLOListElement>(null)
  const scrollOpts = useScroller(ref)
  const { scrollYProgress } = useScroll({
    ...scrollOpts,
    target: ref,
    offset: ['start 78%', 'end 55%'],
  })
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1], { clamp: true })
  const [active, setActive] = useState(reduced ? phases.length - 1 : -1)
  useMotionValueEvent(progress, 'change', (v) => {
    if (reduced) return
    setActive(v <= 0 ? -1 : Math.min(phases.length - 1, Math.floor(v * (phases.length - 1) + 0.001)))
  })
  const style = { '--p': reduced ? 1 : progress } as unknown as CSSProperties
  return (
    <motion.ol ref={ref} className={styles.timeline} style={style}>
      <li className={styles.rail} aria-hidden>
        <span className={styles.railFill} />
      </li>
      {phases.map((p, i) => (
        <li key={p.title.en} className={styles.step} data-on={i <= active || undefined}>
          <span className={styles.node} aria-hidden>
            <span className={styles.nodeNum}>0{i + 1}</span>
          </span>
          <h3 className={styles.phaseTitle}>
            <span className="sr-only">{pick(L.phase, lang)} {i + 1}: </span>
            {pick(p.title, lang)}
          </h3>
          <p className={styles.phaseBody}>{pick(p.body, lang)}</p>
        </li>
      ))}
    </motion.ol>
  )
}

/* Posición de la anomalía dentro de la imagen térmica (zona oscura central). */
const ANOMALY = { x: 31 } /* y: ver --er-my en el CSS */

function ScanFrame({ reduced, lang }: { reduced: boolean; lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollOpts = useScroller(ref)
  const { scrollYProgress } = useScroll({
    ...scrollOpts,
    target: ref,
    offset: ['start 88%', 'center 48%'],
  })
  const fixed = useMotionValue(1)
  const p: MotionValue<number> = reduced ? fixed : scrollYProgress
  const clip = useTransform(p, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`)
  const left = useTransform(p, (v) => `${v * 100}%`)
  const [pct, setPct] = useState(reduced ? 100 : 0)
  useMotionValueEvent(p, 'change', (v) => setPct(Math.round(Math.min(1, Math.max(0, v)) * 100)))
  const done = pct >= ANOMALY.x + 4
  const complete = pct >= 100
  return (
    <figure className={styles.scan}>
      <div ref={ref} className={styles.scanFrame}>
        <img className={styles.scanBase} src="/projects/eclipse-rojo/evidencias/region.webp" alt={pick(L.scanAlt, lang)} width={1024} height={640} loading="lazy" />
        <motion.img
          className={styles.scanHeat}
          src="/projects/eclipse-rojo/evidencias/termica.webp"
          alt=""
          aria-hidden
          width={1024}
          height={640}
          loading="lazy"
          style={{ clipPath: clip }}
        />
        <motion.span className={styles.sweep} style={{ left }} aria-hidden data-off={complete || pct === 0 || undefined} />
        <svg className={styles.reticle} viewBox="0 0 100 62.5" preserveAspectRatio="none" aria-hidden>
          <path className={styles.rBracket} d="M3 9V3h6M91 3h6v6M97 53.5v6h-6M9 59.5H3v-6" vectorEffect="non-scaling-stroke" />
          <path className={styles.rCross} d="M50 3v5M50 54.5v5M3 31.25h5M92 31.25h5" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className={styles.marker} data-on={done || undefined} style={{ left: `${ANOMALY.x}%`, top: 'var(--er-my)' }} aria-hidden>
          <span className={styles.markerRing} />
          <span className={styles.markerBox} />
          <span className={styles.markerTag}>T-01</span>
        </span>
        <div className={styles.readout} role="status" data-found={done || undefined}>
          <span className={styles.readoutDot} aria-hidden />
          <span>{done ? pick(L.found, lang) : `${pick(L.scanning, lang)} ${pct}%`}</span>
        </div>
      </div>
    </figure>
  )
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
  const postHref = text.award ? project.links.find((l) => l.kind === 'instagram')?.href : undefined
  const heroProject = postHref ? { ...project, links: project.links.filter((l) => l.kind !== 'instagram') } : project
  const awardBody = (
    <>
      <span className={styles.awardMark} aria-hidden>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="m12 2.8 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.6 3.1 1.2-6.3L3 9.4l6.3-.8z" /></svg>
      </span>
      <span className={styles.awardText}>
        <span className={styles.awardMain}>{text.award}</span>
        {text.awardSub && <span className={styles.awardSub}>{text.awardSub}</span>}
        {postHref && (
          <span className={styles.awardCta}>
            {pick(L.awardCta, lang)}
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 3.5h6.5V10M12.5 3.5 4 12" />
            </svg>
            <span className="sr-only">({t.projects.externalLink})</span>
          </span>
        )}
      </span>
    </>
  )

  return (
    <div className={styles.root} style={vars}>
      <section className={styles.hero}>
        <EclipseRojoPlanet />
        <div className={styles.heroShade} aria-hidden />
        <p className={styles.heroCredit}>{lang === 'es' ? 'Textura de Marte' : 'Mars texture'}: Solar System Scope (CC BY 4.0)</p>
        <div className={styles.heroInner}>
          {text.award &&
            (postHref ? (
              <a className={styles.award} href={postHref} target="_blank" rel="noopener noreferrer">
                {awardBody}
              </a>
            ) : (
              <p className={styles.award}>{awardBody}</p>
            ))}
          <h1 id={projectTitleId(project.slug)} tabIndex={-1} className={styles.title}>
            {text.name}
          </h1>
          <p className={styles.kicker}>{text.kicker}</p>
          <p className={styles.summary}>{text.summary}</p>
          <ProjectLinks project={heroProject} className={styles.actions} />
        </div>
      </section>

      <div className={styles.body}>
        <section aria-labelledby="er-hud">
          <Reveal>
            <h2 id="er-hud" className={styles.h2}>{pick(L.hudTitle, lang)}</h2>
          </Reveal>
          <Timeline reduced={reduced} lang={lang} />
        </section>

        <section aria-labelledby="er-setup">
          <Reveal>
            <h2 id="er-setup" className={styles.h2}>{pick(L.setupTitle, lang)}</h2>
          </Reveal>
          <Reveal className={styles.setupGrid} delay={0.05}>
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
        </section>

        <section aria-labelledby="er-scan">
          <Reveal>
            <h2 id="er-scan" className={styles.h2}>{pick(L.scanTitle, lang)}</h2>
            <p className={styles.lead}>{pick(L.scanIntro, lang)}</p>
          </Reveal>
          <ScanFrame reduced={reduced} lang={lang} />
        </section>

        <section aria-labelledby="er-ev">
          <Reveal>
            <h2 id="er-ev" className={styles.h2}>{pick(L.evTitle, lang)}</h2>
          </Reveal>
          <ul className={styles.board}>
            {evidence.map((e, i) => (
              <li key={e.src}>
                <Reveal delay={reduced ? 0 : (i % 3) * 0.08}>
                  <figure className={styles.card}>
                    <div className={styles.cardMedia}>
                      <img
                        src={`/projects/eclipse-rojo/evidencias/${e.src}.webp`}
                        alt={pick(e.alt, lang)}
                        width={1024}
                        height={640}
                        loading="lazy"
                      />
                      <span className={styles.scanline} aria-hidden />
                      <span className={styles.cardTag}>0{i + 1}</span>
                    </div>
                    <figcaption className={styles.cardCap}>
                      <span className={styles.cardName}>{pick(e.name, lang)}</span>
                      <span className={styles.cardText}>{pick(e.caption, lang)}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className={styles.credit}>{pick(L.evCredit, lang)}</p>
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
