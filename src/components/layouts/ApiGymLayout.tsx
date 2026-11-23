import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView } from 'motion/react'
import type { Project } from '../../content/projects'
import { useT } from '../../i18n/LangProvider'
import { tween, useReducedMotionSafe } from '../../styles/motion'
import ProjectBasics from './ProjectBasics'
import styles from './ApiGymLayout.module.css'

interface ManifestExercise {
  id: string
  name: string
  nameEn: string
  frames: string[]
}

type Lang = 'es' | 'en'
const bi = (lang: Lang, es: string, en: string) => (lang === 'es' ? es : en)

/** Secuencia de cuadros tal como la define la animación de ApiGym. */
const SEQUENCE = [0, 1, 2, 1]
const FRAME_MS = 400

function useInViewFlag<T extends Element>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, visible] as const
}

function ExerciseCard({ ex, lang, reduced }: { ex: ManifestExercise; lang: Lang; reduced: boolean }) {
  const [ref, visible] = useInViewFlag<HTMLLIElement>()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduced || !visible) return
    const id = window.setInterval(() => setStep((s) => (s + 1) % SEQUENCE.length), FRAME_MS)
    return () => window.clearInterval(id)
  }, [reduced, visible])

  const active = reduced ? 0 : (SEQUENCE[step] ?? 0)
  const name = lang === 'es' ? ex.name : ex.nameEn

  return (
    <li ref={ref} className={styles.card}>
      <div className={styles.stage} role="img" aria-label={name}>
        {ex.frames.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            width={627}
            height={627}
            loading="lazy"
            decoding="async"
            className={styles.frame}
            data-on={i === active}
          />
        ))}
      </div>
      <p className={styles.cardName}>{name}</p>
      <p className={styles.cardId}>id {ex.id}</p>
    </li>
  )
}

function Counter({ to, reduced }: { to: number; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [n, setN] = useState(reduced ? to : 0)
  useEffect(() => {
    if (reduced) {
      setN(to)
      return
    }
    if (!inView) return
    const c = animate(0, to, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, reduced, to])
  return (
    <span ref={ref} className={styles.bigNum}>
      <span className="sr-only">{to.toLocaleString('en-US')}</span>
      <span aria-hidden>{n.toLocaleString('en-US')}</span>
    </span>
  )
}

/* Resaltado de sintaxis JSON hecho a mano. */
function renderJson(value: unknown, depth = 0, key?: string, last = true): ReactNode[] {
  const pad = '  '.repeat(depth)
  const k = key !== undefined ? (
    <>
      <span className={styles.jKey}>"{key}"</span>
      <span className={styles.jP}>: </span>
    </>
  ) : null
  const comma = last ? '' : ','
  const line = (children: ReactNode, id: string) => (
    <span className={styles.jLine} key={id}>
      {pad}
      {k}
      {children}
      <span className={styles.jP}>{comma}</span>
      {'\n'}
    </span>
  )
  if (Array.isArray(value)) {
    if (value.length === 0) return [line(<span className={styles.jP}>[]</span>, `${depth}-${key}`)]
    const inner = value.flatMap((v, i) => renderJson(v, depth + 1, undefined, i === value.length - 1))
    return [
      <span className={styles.jLine} key={`${depth}-${key}-o`}>
        {pad}
        {k}
        <span className={styles.jP}>[</span>
        {'\n'}
      </span>,
      ...inner,
      <span className={styles.jLine} key={`${depth}-${key}-c`}>
        {pad}
        <span className={styles.jP}>]{comma}</span>
        {'\n'}
      </span>,
    ]
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
    const inner = entries.flatMap(([ek, ev], i) => renderJson(ev, depth + 1, ek, i === entries.length - 1))
    return [
      <span className={styles.jLine} key={`${depth}-${key}-o`}>
        {pad}
        {k}
        <span className={styles.jP}>{'{'}</span>
        {'\n'}
      </span>,
      ...inner,
      <span className={styles.jLine} key={`${depth}-${key}-c`}>
        {pad}
        <span className={styles.jP}>{'}'}{comma}</span>
        {'\n'}
      </span>,
    ]
  }
  const cls = typeof value === 'string' ? styles.jStr : typeof value === 'number' ? styles.jNum : styles.jLit
  return [line(<span className={cls}>{JSON.stringify(value)}</span>, `${depth}-${key}-${String(value).slice(0, 12)}`)]
}

export default function ApiGymLayout({ project }: { project: Project }) {
  const { lang } = useT()
  const reduced = useReducedMotionSafe()
  const [exercises, setExercises] = useState<ManifestExercise[]>([])
  const [sample, setSample] = useState<unknown>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const load = async (url: string, set: (d: never) => void) => {
      try {
        const r = await fetch(url, { signal: ctrl.signal })
        if (r.ok) set((await r.json()) as never)
      } catch {
        /* sin datos: la sección no se muestra */
      }
    }
    void load(project.assets.manifest ?? '/projects/apigym/manifest.json', setExercises as (d: never) => void)
    void load('/projects/apigym/sample.json', setSample as (d: never) => void)
    return () => ctrl.abort()
  }, [project.assets.manifest])

  const reveal = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '0px 0px -8% 0px' },
        transition: tween(0.6),
      }

  const stats = [
    { value: '3', label: bi(lang, 'cuadros SVG por ejercicio', 'SVG frames per exercise') },
    { value: '100%', label: bi(lang, 'de los ejercicios con animación', 'of exercises animated') },
  ]

  return (
    <div className={styles.root}>
      <ProjectBasics project={project} tone="dark" className={styles.basics} />

      <section className={styles.band} aria-labelledby="apigym-cover">
        <motion.div className={styles.bandInner} {...reveal}>
          <h2 id="apigym-cover" className={styles.sectionLabel}>
            {bi(lang, 'Cobertura del catálogo', 'Catalog coverage')}
          </h2>
          <div className={styles.stats}>
            <p className={styles.bigStat}>
              <Counter to={1257} reduced={reduced} />
              <span className={styles.bigUnit}>{bi(lang, 'ejercicios', 'exercises')}</span>
            </p>
            <ul className={styles.smallStats}>
              {stats.map((s) => (
                <li key={s.value}>
                  <span className={styles.smallNum}>{s.value}</span>
                  <span className={styles.smallLabel}>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {exercises.length > 0 && (
        <section className={styles.block} aria-labelledby="apigym-grid">
          <motion.div {...reveal}>
            <h2 id="apigym-grid" className={styles.sectionLabel}>
              {bi(lang, 'Ocho de los 1,257, en movimiento', 'Eight of the 1,257, in motion')}
            </h2>
            <ul className={styles.grid}>
              {exercises.map((ex) => (
                <ExerciseCard key={ex.id} ex={ex} lang={lang} reduced={reduced} />
              ))}
            </ul>
            <p className={styles.note}>
              {bi(
                lang,
                'Cada ejercicio son tres cuadros SVG en bucle.',
                'Each exercise is three SVG frames in a loop.',
              )}
            </p>
          </motion.div>
        </section>
      )}

      {sample !== null && (
        <section className={styles.block} aria-labelledby="apigym-json">
          <motion.div {...reveal}>
            <h2 id="apigym-json" className={styles.sectionLabel}>
              {bi(lang, 'Qué devuelve', 'What it returns')}
            </h2>
            <figure className={styles.code}>
              <figcaption className={styles.codeHead}>
                <span>{bi(lang, 'Ejemplo de ficha', 'Sample entry')}</span>
                <span className={styles.codeMeta}>application/json</span>
              </figcaption>
              <pre className={styles.pre} tabIndex={0} aria-label={bi(lang, 'Ficha de ejemplo en JSON', 'Sample entry as JSON')}>
                <code>{renderJson(sample)}</code>
              </pre>
            </figure>
          </motion.div>
        </section>
      )}
    </div>
  )
}
