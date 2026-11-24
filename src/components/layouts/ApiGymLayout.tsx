import '@fontsource-variable/manrope'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, animate, motion, useInView } from 'motion/react'
import type { Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/context'
import { tween, useReducedMotionSafe } from '../../styles/motion'
import { Build, ScrollScene } from '../motion/ScrollScene'
import { ProjectClosing, ProjectLinks, projectTitleId } from './ProjectBasics'
import styles from './ApiGymLayout.module.css'

interface ManifestExercise {
  id: string
  name: string
  nameEn: string
  frames: string[]
}

type Lang = 'es' | 'en'

const SITE = 'https://apigym-production-b297.up.railway.app'
const SITE_HOST = 'apigym-production-b297.up.railway.app'
const SHOTS = ['site-home', 'site-catalog', 'site-detail'] as const

/** Secuencia de cuadros tal como la define la animación de ApiGym. */
const SEQUENCE = [0, 1, 2, 1]
const FRAME_MS = 220

/** Respuesta real de GET /api/v1/exercises?limit=2, recortada. */
const SAMPLE = {
  data: [
    {
      id: 'flow-2312',
      name: 'Abdominal bicicleta con codo a rodilla contraria',
      nameEn: 'lying elbow to knee',
      primaryMuscles: ['abdominals'],
      equipment: 'body only',
      difficulty: 'beginner',
      mechanic: 'compound',
      force: 'mixed',
      popular: false,
    },
  ],
  pagination: { total: 1257, count: 2, limit: 2, offset: 0, nextOffset: 2 },
}

function AnimatedFrames({ frames, active }: { frames: string[]; active: number }) {
  return (
    <>
      {frames.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          width={627}
          height={627}
          decoding="async"
          draggable={false}
          className={styles.frame}
          data-on={i === active}
        />
      ))}
    </>
  )
}

function Explorer({ exercises, lang, reduced }: { exercises: ManifestExercise[]; lang: Lang; reduced: boolean }) {
  const { t } = useT()
  const ui = (t as unknown as { apigym: { ui: Record<string, string> } }).apigym.ui
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [ref, visible] = useInViewFlag<HTMLDivElement>()
  const ex = exercises[index] ?? exercises[0]!

  useEffect(() => {
    if (reduced || !visible) return
    const id = window.setInterval(() => setStep((s) => (s + 1) % SEQUENCE.length), FRAME_MS)
    return () => window.clearInterval(id)
  }, [reduced, visible])

  const active = reduced ? 0 : (SEQUENCE[step] ?? 0)
  const nameOf = (e: ManifestExercise) => (lang === 'es' ? e.name : e.nameEn)
  const secondary = lang === 'es' ? ex.nameEn : ex.name

  return (
    <div className={styles.explorer} ref={ref}>
      <div className={styles.stageWrap}>
        <div className={styles.stage} role="img" aria-label={nameOf(ex)}>
          <AnimatePresence initial={false}>
            <motion.div
              key={ex.id}
              className={styles.stageLayer}
              initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0.12 } : tween(0.5)}
            >
              <AnimatedFrames frames={ex.frames} active={active} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={styles.stageMeta} aria-live="polite">
          <p className={styles.stageName}>{nameOf(ex)}</p>
          <p className={styles.stageSub}>{secondary}</p>
          <dl className={styles.metaRow}>
            <div>
              <dt>id</dt>
              <dd>{ex.id}</dd>
            </div>
            <div>
              <dt>{ui.frames}</dt>
              <dd>{ex.frames.length}</dd>
            </div>
            <div className={styles.dots} aria-hidden>
              {ex.frames.map((f, i) => (
                <span key={f} data-on={i === active} />
              ))}
            </div>
          </dl>
        </div>
      </div>

      <div className={styles.chipsCol}>
        <p className={styles.chipsLabel} id="apigym-chips">
          {ui.explorerList}
        </p>
        <ul className={styles.chips} aria-labelledby="apigym-chips">
          {exercises.map((e, i) => (
            <li key={e.id}>
              <button
                type="button"
                className={styles.chip}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
              >
                <span>{nameOf(e)}</span>
                <span className={styles.chipId}>{e.id}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

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

function Counter({ to, reduced }: { to: number; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(reduced ? to : 0)
  useEffect(() => {
    if (reduced) {
      setN(to)
      return
    }
    if (!inView) return
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) })
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

function BrowserShots({ reduced }: { reduced: boolean }) {
  const { t } = useT()
  const ui = (t as unknown as { apigym: { ui: { shots: string[]; shotAlts: string[]; showShot: string } } }).apigym.ui
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ref, visible] = useInViewFlag<HTMLDivElement>()

  useEffect(() => {
    if (reduced || paused || !visible) return
    const id = window.setInterval(() => setI((v) => (v + 1) % SHOTS.length), 4500)
    return () => window.clearInterval(id)
  }, [reduced, paused, visible])

  return (
    <div className={styles.browserWrap} ref={ref}>
      <div className={styles.browser}>
        <div className={styles.browserBar}>
          <span className={styles.lights} aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <a className={styles.url} href={SITE} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <rect x="3" y="7" width="10" height="7" rx="1.5" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            <span>{SITE_HOST}</span>
          </a>
        </div>
        <div className={styles.viewport}>
          {SHOTS.map((name, k) => (
            <img
              key={name}
              src={`/projects/apigym/${name}.webp`}
              alt={ui.shotAlts[k]}
              width={1440}
              height={900}
              loading="lazy"
              decoding="async"
              className={styles.shot}
              data-on={k === i}
              aria-hidden={k !== i}
            />
          ))}
        </div>
      </div>
      <div className={styles.tabs} role="group" aria-label={ui.showShot}>
        {SHOTS.map((name, k) => (
          <button
            key={name}
            type="button"
            className={styles.tab}
            aria-pressed={k === i}
            onClick={() => {
              setI(k)
              setPaused(true)
            }}
          >
            {ui.shots[k]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ApiGymLayout({ project }: { project: Project }) {
  const { lang, t } = useT()
  const text = useProjectText(project)
  const ui = (t as unknown as { apigym: { ui: Record<string, string> } }).apigym.ui
  const reduced = useReducedMotionSafe()
  const [exercises, setExercises] = useState<ManifestExercise[]>([])

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        const r = await fetch(project.assets.manifest ?? '/projects/apigym/manifest.json', { signal: ctrl.signal })
        if (r.ok) setExercises((await r.json()) as ManifestExercise[])
      } catch {
        /* sin datos: el explorador no se muestra */
      }
    })()
    return () => ctrl.abort()
  }, [project.assets.manifest])

  const facts = [
    { k: ui.factKey, v: ui.factKeyBody },
    { k: ui.factPage, v: ui.factPageBody },
    { k: ui.fact404, v: ui.fact404Body },
  ]

  return (
    <div className={styles.root} style={{ '--ag-accent': project.accent } as CSSProperties}>
      <ScrollScene as="header" className={styles.hero}>
        <div className={styles.heroText}>
          <Build as="p" className={styles.kicker}>
            <img src="/projects/apigym/logo-b-menta.svg" alt="" width={36} height={32} className={styles.symbol} />
            <span>{text.kicker}</span>
          </Build>
          <Build as="h1" i={1} id={projectTitleId(project.slug)} tabIndex={-1} className={styles.title}>
            {text.name}
          </Build>
          <Build as="p" i={2} className={styles.summary}>{text.summary}</Build>
          <ProjectLinks project={project} className={styles.links} build={3} />
        </div>
        <Build i={2} className={styles.heroCount}>
          <Counter to={1257} reduced={reduced} />
          <span className={styles.countLabel}>{ui.countLabel}</span>
        </Build>
      </ScrollScene>

      {exercises.length > 0 && (
        <ScrollScene as="section" className={styles.block} aria-labelledby="apigym-explorer">
          <Build as="h2" id="apigym-explorer" className={styles.h2}>
            {ui.explorerTitle}
          </Build>
          <Build as="p" i={1} className={styles.lead}>{ui.explorerLead}</Build>
          <Build i={2}>
            <Explorer exercises={exercises} lang={lang} reduced={reduced} />
          </Build>
        </ScrollScene>
      )}

      <ScrollScene as="section" className={styles.block} aria-labelledby="apigym-api">
        <Build as="h2" id="apigym-api" className={styles.h2}>
          {ui.apiTitle}
        </Build>
        <Build as="p" i={1} className={styles.lead}>{ui.apiLead}</Build>
        <div className={styles.apiGrid}>
            <Build as="figure" i={2} className={styles.code}>
              <div className={styles.request}>
                <span className={styles.verb}>GET</span>
                <code>
                  <span className={styles.jP}>/api/v1/</span>exercises<span className={styles.jP}>?</span>
                  <span className={styles.jKey}>limit</span>
                  <span className={styles.jP}>=</span>
                  <span className={styles.jNum}>2</span>
                </code>
                <span className={styles.status}>200</span>
              </div>
              <pre className={styles.pre} tabIndex={0} aria-label="JSON">
                <code>{renderJson(SAMPLE)}</code>
              </pre>
              <figcaption className={styles.codeCap}>{ui.apiCaption}</figcaption>
            </Build>
            <Build i={3} className={styles.factsCol}>
              <ul className={styles.facts}>
                {facts.map((f) => (
                  <li key={f.k}>
                    <h3>{f.k}</h3>
                    <p>{f.v}</p>
                  </li>
                ))}
              </ul>
              <a className={styles.docs} href={`${SITE}/docs`} target="_blank" rel="noopener noreferrer">
                {ui.apiDocs}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 3.5h6.5V10M12.5 3.5 4 12" />
                </svg>
                <span className="sr-only">({t.projects.externalLink})</span>
              </a>
            </Build>
        </div>
      </ScrollScene>

      <ScrollScene as="section" className={styles.block} aria-labelledby="apigym-site">
        <Build as="h2" id="apigym-site" className={styles.h2}>
          {ui.siteTitle}
        </Build>
        <Build as="p" i={1} className={styles.lead}>{ui.siteLead}</Build>
        <Build i={2}>
          <BrowserShots reduced={reduced} />
        </Build>
      </ScrollScene>

      <ScrollScene as="section" className={styles.block} aria-labelledby={`${project.slug}-role`}>
        <div className={styles.cols}>
          <Build>
            <h2 id={`${project.slug}-role`} className={styles.label}>{t.projects.role}</h2>
            <ul className={styles.list}>
              {text.role.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Build>
          <Build i={1}>
            <h2 id={`${project.slug}-stack`} className={styles.label}>{t.projects.stack}</h2>
            <ul className={styles.stack}>
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {project.team && (
              <p className={styles.team}>
                <span>{t.projects.team}</span> {project.team}
              </p>
            )}
          </Build>
        </div>
      </ScrollScene>

      <section className={styles.block}>
        <ProjectClosing project={project} linksClassName={styles.links} />
      </section>
    </div>
  )
}
