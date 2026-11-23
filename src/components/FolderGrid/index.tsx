import { animate, AnimatePresence, motion, type Variants } from 'motion/react'
import { useContext, useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent } from 'react'
import { projects, type Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/context'
import { easeOutExpo, reducedTransition, useReducedMotionSafe } from '../../styles/motion'
import Folder from '../Folder'
import { OpenProjectContext } from '../ProjectView/context'
import { Build, ScrollScene } from '../motion/ScrollScene'
import styles from './FolderGrid.module.css'

const N = projects.length
const STEP = 360 / N
/** Milisegundos que cada carpeta reposa al frente antes de avanzar un paso. */
const DWELL_MS = 3500
/** Descanso extra tras una interacción del usuario. */
const USER_DWELL_MS = 5500
const DRAG_DEG_PER_PX = 0.32
const DRAG_THRESHOLD = 6
const RESUME_DELAY = 1400
/** Cuánto se inclinan hacia el centro las carpetas laterales (fracción de su ángulo). */
const TILT = 0.38

const labels = {
  es: { prev: 'Proyecto anterior', next: 'Proyecto siguiente', ring: 'Carrusel de proyectos', pause: 'Pausar el carrusel', play: 'Reanudar el carrusel', pick: 'Elegir proyecto' },
  en: { prev: 'Previous project', next: 'Next project', ring: 'Project carousel', pause: 'Pause the carousel', play: 'Resume the carousel', pick: 'Choose project' },
}

/** Nombres cortos para los chips. */
const chipNames: Record<string, { es: string; en: string }> = {
  'eclipse-rojo': { es: 'Eclipse Rojo', en: 'Red Eclipse' },
  'gym-zong': { es: 'Gym Zong', en: 'Gym Zong' },
  apigym: { es: 'ApiGym', en: 'ApiGym' },
  catstore: { es: 'CATSTORE', en: 'CATSTORE' },
}

const wrap180 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
const nearestTo = (angle: number, i: number) => i * STEP + 360 * Math.round((angle - i * STEP) / 360)
const frontIndex = (angle: number) => ((Math.round(angle / STEP) % N) + N) % N

function Caption({ project }: { project: Project }) {
  const text = useProjectText(project)
  return (
    <>
      <span className={styles.capName}>{text.name}</span>
      <span className={styles.capKicker}>{text.kicker}</span>
    </>
  )
}

export default function FolderGrid() {
  const { t, lang } = useT()
  const reduced = useReducedMotionSafe()
  const open = useContext(OpenProjectContext)
  const l = labels[lang === 'en' ? 'en' : 'es']

  const stageRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const faceRefs = useRef<(HTMLDivElement | null)[]>([])
  const [front, setFront] = useState(() => {
    const i = projects.findIndex((p) => p.slug === open)
    return i < 0 ? 0 : i
  })
  const [userPaused, setUserPaused] = useState(false)
  // El lector de pantalla solo anuncia el pie tras una interacción; el avance automático es mudo.
  const [live, setLive] = useState(false)

  // Estado mutable del carrusel: nada de esto provoca renders por fotograma.
  const c = useRef({
    angle: 0,
    target: 0,
    radius: 300,
    anim: null as null | { stop: () => void },
    dragging: false,
    moved: false,
    hover: false,
    focus: false,
    visible: true,
    resumeAt: 0,
    dwell: 0,
    userPaused: false,
    front: 0,
    open: null as string | null,
  })

  const render = (angle: number) => {
    const s = c.current
    s.angle = angle
    for (let i = 0; i < N; i++) {
      const el = itemRefs.current[i]
      const face = faceRefs.current[i]
      if (!el || !face) continue
      const th = wrap180(i * STEP - angle)
      const rad = (th * Math.PI) / 180
      const cos = Math.cos(rad)
      if (Math.abs(th) < 0.01) {
        el.style.transform = 'none'
        el.style.zIndex = '20'
        face.style.opacity = '1'
        face.style.filter = 'none'
      } else {
        const x = Math.sin(rad) * s.radius
        const z = (cos - 1) * s.radius
        const k = (1 + cos) / 2 // 1 al frente, 0 atrás
        // Las traseras se apagan y encogen para leerse «detrás» sin asomar junto a la frontal.
        el.style.transform = `translate3d(${x.toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${(-th * TILT).toFixed(2)}deg) scale(${(1 - 0.12 * (1 - k)).toFixed(3)})`
        el.style.zIndex = String(Math.round(cos * 10) + 10)
        face.style.opacity = (0.15 + 0.85 * Math.pow(k, 1.6)).toFixed(3)
        face.style.filter = `blur(${((1 - k) * 2.2).toFixed(2)}px)`
      }
      el.style.pointerEvents = cos < -0.2 ? 'none' : ''
    }
    // El pie cambia al aterrizar: durante un vuelo animado sigue al destino cuando ya está cerca.
    let fi = frontIndex(angle)
    if (s.anim) {
      if (Math.abs(angle - s.target) < 10) fi = frontIndex(s.target)
      else fi = s.front
    }
    if (fi !== s.front) {
      s.front = fi
      setFront(fi)
    }
  }

  const stopAnim = () => {
    c.current.anim?.stop()
    c.current.anim = null
  }

  /** Lleva el anillo a un ángulo con un muelle suave (sin rebote). */
  const animateTo = (target: number, velocity = 0, user = true) => {
    const s = c.current
    stopAnim()
    s.target = target
    s.dwell = user ? -(USER_DWELL_MS - DWELL_MS) : 0
    s.resumeAt = performance.now() + RESUME_DELAY
    const ctl = animate(s.angle, target, {
      type: 'spring',
      stiffness: 70,
      damping: 17,
      mass: 1,
      velocity,
      restDelta: 0.01,
      restSpeed: 0.05,
      onUpdate: render,
      onComplete: () => {
        s.anim = null
        render(target)
      },
    })
    s.anim = ctl
  }

  /** Congela el anillo con la carpeta i exactamente al frente (sin rotación residual). */
  const snapTo = (i: number) => {
    const s = c.current
    stopAnim()
    s.target = nearestTo(s.angle, i)
    s.dwell = 0
    render(s.target)
  }

  const paused = () => {
    const s = c.current
    return s.userPaused || s.hover || s.focus || s.dragging || !s.visible || document.hidden || s.open !== null
  }

  // Mide el radio según el ancho real de la carpeta.
  useLayoutEffect(() => {
    if (reduced) return
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const w = itemRefs.current[0]?.offsetWidth ?? 280
      c.current.radius = w * 1.15
      render(c.current.angle)
    }
    const i = projects.findIndex((p) => p.slug === open)
    if (i >= 0) {
      c.current.angle = i * STEP
      c.current.target = i * STEP
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  // Proyecto abierto (clic, entrada directa o botón atrás): el anillo se congela con esa carpeta al frente.
  useLayoutEffect(() => {
    const s = c.current
    s.open = open
    if (reduced) return
    const i = projects.findIndex((p) => p.slug === open)
    if (i >= 0) snapTo(i)
    else s.resumeAt = performance.now() + RESUME_DELAY
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduced])

  // Avance automático por pasos (reposa DWELL_MS al frente y gira un paso) + visibilidad de la sección.
  useEffect(() => {
    if (reduced) return
    const s = c.current
    const stage = stageRef.current
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const flying = stage?.querySelector('[data-flying]') != null
      if (flying) s.resumeAt = now + RESUME_DELAY
      if (!paused() && !flying && !s.anim && !drag.current.down && now >= s.resumeAt) {
        s.dwell += dt * 1000
        if (s.dwell >= DWELL_MS) animateTo((Math.round(s.target / STEP) + 1) * STEP, 0, false)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    let io: IntersectionObserver | undefined
    if (stage && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => {
        if (!e) return
        s.visible = e.isIntersecting
        if (e.isIntersecting) s.resumeAt = performance.now() + 400
      })
      io.observe(stage)
    }
    return () => {
      cancelAnimationFrame(raf)
      io?.disconnect()
      stopAnim()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  // Arrastre con inercia
  const drag = useRef({ x: 0, lastX: 0, lastT: 0, v: 0, angle: 0, id: -1, down: false })
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const d = drag.current
    d.down = true
    d.id = e.pointerId
    d.x = d.lastX = e.clientX
    d.lastT = performance.now()
    d.v = 0
    c.current.moved = false
    // Con el dedo/ratón abajo la rotación automática se detiene (un toque debe caer en una carpeta quieta).
    c.current.resumeAt = performance.now() + RESUME_DELAY
    if (c.current.anim == null) c.current.target = c.current.angle
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const s = c.current
    if (!d.down || e.pointerId !== d.id) return
    if (!s.dragging) {
      if (Math.abs(e.clientX - d.x) < DRAG_THRESHOLD) return
      s.dragging = true
      s.moved = true
      stopAnim()
      d.angle = s.angle
      d.x = e.clientX
      d.lastX = e.clientX
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const now = performance.now()
    const dt = Math.max(1, now - d.lastT)
    const inst = (-(e.clientX - d.lastX) * DRAG_DEG_PER_PX * 1000) / dt
    d.v = d.v * 0.6 + inst * 0.4
    d.lastX = e.clientX
    d.lastT = now
    s.target = d.angle - (e.clientX - d.x) * DRAG_DEG_PER_PX
    render(s.target)
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const s = c.current
    if (!d.down || e.pointerId !== d.id) return
    d.down = false
    if (!s.dragging) return
    s.dragging = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    const stale = performance.now() - d.lastT > 90
    const v = stale ? 0 : d.v
    const projected = s.angle + v * 0.22
    setLive(true)
    animateTo(Math.round(projected / STEP) * STEP, v)
  }

  // Clic: arrastre nunca navega; lateral se trae al frente; frontal abre.
  const onItemClick = (i: number) => (e: MouseEvent<HTMLLIElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    const s = c.current
    if (s.moved) {
      e.preventDefault()
      e.stopPropagation()
      s.moved = false
      return
    }
    const off = Math.abs(wrap180(i * STEP - s.angle))
    if (off > 30) {
      e.preventDefault()
      e.stopPropagation()
      setLive(true)
      animateTo(nearestTo(s.angle, i))
      return
    }
    snapTo(i) // el vuelo mide la hoja: rotación exacta, sin sesgo
  }

  const step = (dir: 1 | -1) => {
    const s = c.current
    setLive(true)
    animateTo((Math.round(s.target / STEP) + dir) * STEP)
  }

  const goTo = (i: number) => {
    const s = c.current
    setLive(true)
    animateTo(nearestTo(s.target, i))
  }

  const togglePause = () => {
    const s = c.current
    s.userPaused = !s.userPaused
    s.dwell = 0
    setUserPaused(s.userPaused)
  }

  const onFocus = (i: number) => (e: FocusEvent<HTMLLIElement>) => {
    const s = c.current
    // Solo foco de teclado: el foco por clic no debe dejar el anillo en pausa.
    if (e.target.matches(':focus-visible')) s.focus = true
    if (Math.abs(wrap180(i * STEP - s.target)) > 1) {
      setLive(true)
      animateTo(nearestTo(s.target, i))
    }
  }

  const list: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.09 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced ? reducedTransition : { duration: 0.8, ease: easeOutExpo },
    },
  }

  const head = (
    <header className={styles.head}>
      <Build as="h2" id="proyectos-titulo" className={styles.title}>{t.projects.title}</Build>
      <Build as="p" i={1} className={styles.intro}>{t.projects.intro}</Build>
    </header>
  )

  if (reduced) {
    return (
      <ScrollScene as="section" blur={false} id="proyectos" className={styles.root} aria-labelledby="proyectos-titulo">
        <div className={styles.inner}>
          {head}
          <ul className={styles.row}>
            {projects.map((p) => (
              <li key={p.slug} className={styles.rowItem}>
                <Folder project={p} />
              </li>
            ))}
          </ul>
        </div>
      </ScrollScene>
    )
  }

  return (
    <ScrollScene as="section" blur={false} id="proyectos" className={styles.root} aria-labelledby="proyectos-titulo">
      <div className={styles.inner}>{head}</div>
      <Build i={2} blur={false} className={styles.clip}>
        <div
          ref={stageRef}
          className={styles.stage}
          role="group"
          aria-label={l.ring}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={(e) => e.preventDefault()}
          onPointerEnter={(e) => {
            if (e.pointerType !== 'mouse') return
            const s = c.current
            s.hover = true
            if (!s.dragging && !s.open) animateTo(Math.round(s.angle / STEP) * STEP)
          }}
          onPointerLeave={(e) => {
            if (e.pointerType !== 'mouse') return
            c.current.hover = false
            c.current.resumeAt = performance.now() + RESUME_DELAY
          }}
          onBlur={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
            c.current.focus = false
            c.current.resumeAt = performance.now() + RESUME_DELAY
          }}
        >
          <motion.ul
            className={styles.ring}
            variants={list}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {projects.map((p, i) => (
              <li
                key={p.slug}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                className={styles.item}
                onClickCapture={onItemClick(i)}
                onFocus={onFocus(i)}
              >
                <motion.div variants={item}>
                  <div
                    ref={(el) => {
                      faceRefs.current[i] = el
                    }}
                    className={styles.face}
                  >
                    <Folder project={p} caption={false} />
                  </div>
                </motion.div>
              </li>
            ))}
          </motion.ul>
        </div>
      </Build>
      <Build i={3} className={styles.controls}>
        <div className={`${styles.cluster} ${styles.clusterStart}`}>
          <button type="button" className={styles.nav} aria-label={l.prev} onClick={() => step(-1)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <div className={styles.caption} aria-live={live ? 'polite' : 'off'}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={front}
              className={styles.capInner}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: easeOutExpo }}
            >
              <Caption project={projects[front] ?? projects[0]!} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={styles.cluster}>
          <button type="button" className={styles.nav} aria-label={l.next} onClick={() => step(1)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className={styles.nav} aria-label={userPaused ? l.play : l.pause} aria-pressed={userPaused} onClick={togglePause}>
            {userPaused ? (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8.5 5.5v13M15.5 5.5v13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </Build>
      <Build as="ul" i={4} className={styles.chips} aria-label={l.pick}>
        {projects.map((p, i) => (
          <li key={p.slug}>
            <button
              type="button"
              className={styles.chip}
              aria-current={i === front ? 'true' : undefined}
              onClick={() => goTo(i)}
            >
              {chipNames[p.slug]?.[lang === 'en' ? 'en' : 'es'] ?? p.slug}
            </button>
          </li>
        ))}
      </Build>
    </ScrollScene>
  )
}
