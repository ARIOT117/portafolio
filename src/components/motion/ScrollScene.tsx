import { motion, motionValue, useTransform, type MotionValue } from 'motion/react'
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type RefObject,
} from 'react'
import { useReducedMotionSafe } from '../../styles/motion'

/* Escena de scroll: cada elemento `Build` sigue SU propia posición en el visor
   (no la del bloque) y se construye al entrar por abajo y se borra al subir.
   Todo es función del scroll (reversible) y sale de MotionValues: sin
   re-render por fotograma.

   Posiciones en fracción del alto del visor (0 = arriba, 1 = abajo):
   - Construcción: el borde superior recorre 1 → 0.72 (opacidad 0→1, y 40→0,
     desenfoque 8→0). Cada índice de la secuencia se retrasa un poco.
   - Borrado: del borde superior en 0.22 al borde inferior en 0.02 (opacidad
     1→0, y 0→-24, escala 1→0.96, desenfoque 0→8). Lo que se lee más abajo no
     se toca. Un elemento más alto que ~0.7 del visor no se borra (se leería
     desvanecido), solo se construye.
   - Lo que ya está a la vista con scrollTop 0 nace construido y empieza a
     borrarse desde donde está. Si la página no llega a scroll suficiente para
     construir lo de abajo, la construcción se comprime al scroll disponible. */
const ENTER_FROM = 1
const ENTER_TO = 0.72
const ENTER_STEP = 0.025
const ERASE_FROM = 0.22
const ERASE_END = 0.02
const MAX_ERASE_HEIGHT = 0.7
const ENTER_Y = 40
const ERASE_Y = -24
const BLUR = 8
const MAX_BLUR_HEIGHT = 0.22

type Mode = 'static' | 'lite' | 'full'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Desenfoque solo en escritorio con puntero fino; en móvil, solo opacidad y transform. */
function useSceneMode(): Mode {
  const reduced = useReducedMotionSafe()
  const [fine] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 768px) and (pointer: fine)').matches,
  )
  if (reduced) return 'static'
  return fine ? 'full' : 'lite'
}

/* ---------- Scroll compartido por contenedor ---------- */

type Root = HTMLElement | Window

interface RootStore {
  y: MotionValue<number>
  stop: () => void
  users: number
}
const roots = new WeakMap<Root, RootStore>()

function scrollerOf(el: HTMLElement | null): Root {
  let n = el?.parentElement ?? null
  while (n) {
    const oy = getComputedStyle(n).overflowY
    if (oy === 'auto' || oy === 'scroll') return n
    n = n.parentElement
  }
  return window
}

const isWindow = (r: Root): r is Window => r === window
const readY = (r: Root) => (isWindow(r) ? r.scrollY : r.scrollTop)

function acquire(root: Root): RootStore {
  let s = roots.get(root)
  if (!s) {
    const y = motionValue(readY(root))
    const onScroll = () => y.set(readY(root))
    root.addEventListener('scroll', onScroll, { passive: true })
    s = { y, users: 0, stop: () => root.removeEventListener('scroll', onScroll) }
    roots.set(root, s)
  }
  s.users++
  return s
}

function release(root: Root) {
  const s = roots.get(root)
  if (!s) return
  if (--s.users <= 0) {
    s.stop()
    roots.delete(root)
  }
}

const pageTop = (el: HTMLElement | null) => {
  let y = 0
  while (el) {
    y += el.offsetTop
    el = el.offsetParent as HTMLElement | null
  }
  return y
}

interface Metrics {
  /** Borde superior en coordenadas del contenido desplazable. */
  top: number
  height: number
  vh: number
  max: number
  /** Medido con scrollTop 0 y ya a la vista: nace construido. */
  built0: boolean
  /** Fracción del visor donde empieza a borrarse. */
  eraseFrom: number
}

const NO_METRICS: Metrics = { top: 0, height: 0, vh: 0, max: 0, built0: true, eraseFrom: ERASE_FROM }

function measure(el: HTMLElement, root: Root): Metrics {
  const win = isWindow(root)
  const vh = win ? window.innerHeight : root.clientHeight
  if (!vh) return NO_METRICS
  const scrollH = win ? document.documentElement.scrollHeight : root.scrollHeight
  const top = win ? pageTop(el) : pageTop(el) - pageTop(root) - root.clientTop
  const y = readY(root)
  const rest = y < 2
  const topRel = (top - y) / vh
  return {
    top,
    height: el.offsetHeight,
    vh,
    max: Math.max(0, scrollH - vh),
    built0: rest && topRel < ENTER_FROM,
    eraseFrom: rest ? Math.min(ERASE_FROM, topRel) : ERASE_FROM,
  }
}

/** Progresos de construcción (0→1) y borrado (0→1) de un elemento para un scroll dado. */
function progress(m: Metrics, y: number, i: number, erase: boolean, enter: boolean): [number, number] {
  if (!m.vh) return [1, 0]
  const topRel = (m.top - y) / m.vh
  const hRel = m.height / m.vh

  let e = 1
  if (enter && !m.built0) {
    const from = ENTER_FROM - Math.min(i, 6) * ENTER_STEP
    const to = ENTER_TO - Math.min(i, 6) * ENTER_STEP
    const sFrom = m.top - from * m.vh
    // Al final de la página no hay más scroll: se comprime al disponible
    const sTo = Math.min(m.top - to * m.vh, m.max)
    e = sTo - sFrom < 1 ? (y >= sFrom ? 1 : 0) : clamp01((y - sFrom) / (sTo - sFrom))
  }

  let x = 0
  if (erase && hRel <= MAX_ERASE_HEIGHT) {
    const from = m.eraseFrom
    const span = Math.max(0.12, from - (ERASE_END - hRel))
    x = clamp01((from - topRel) / span)
  }
  return [e, x]
}

interface BuildOpts {
  i?: number
  line?: boolean
  blur?: boolean
  erase?: boolean
  enter?: boolean
}

/**
 * Estilo + ref de construcción/borrado de un elemento (también para
 * componentes que no son `<Build>`, p. ej. `Link`). El ref es obligatorio:
 * de él sale la posición del elemento.
 */
export function useBuildStyle({ i = 0, line = false, blur = true, erase = true, enter = true }: BuildOpts = {}): {
  ref: RefObject<HTMLElement | null>
  style: Record<string, unknown> | undefined
} {
  const mode = useSceneMode()
  const animate = mode !== 'static'
  const ref = useRef<HTMLElement>(null)
  const metrics = useRef<Metrics>(NO_METRICS)
  const [yMv] = useState(() => motionValue(0))
  const [ready] = useState(() => motionValue(0))
  /* Cambia cada vez que se vuelve a medir: fuerza a recalcular sin scroll */
  const pulse = useRef(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!animate || !el) return
    const root = scrollerOf(el)
    const store = acquire(root)
    const sync = () => {
      metrics.current = measure(el, root)
      yMv.set(readY(root))
      ready.set(++pulse.current)
    }
    sync()
    const unsub = store.y.on('change', (v) => yMv.set(v))
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync)
    ro?.observe(el)
    if (isWindow(root)) ro?.observe(document.documentElement)
    else {
      ro?.observe(root)
      for (const c of Array.from(root.children)) ro?.observe(c)
    }
    window.addEventListener('resize', sync)
    window.addEventListener('load', sync)
    void document.fonts?.ready.then(sync)
    return () => {
      unsub()
      ro?.disconnect()
      window.removeEventListener('resize', sync)
      window.removeEventListener('load', sync)
      release(root)
    }
  }, [animate, yMv, ready])

  const eraseOn = erase && !line
  const pair = useTransform([yMv, ready], () => progress(metrics.current, yMv.get(), i, eraseOn, enter))
  const e = useTransform(pair, (p) => p[0])
  const x = useTransform(pair, (p) => p[1])

  const opacity = useTransform([e, x], ([a, b]: number[]) => a! * (1 - b!))
  const y = useTransform([e, x], ([a, b]: number[]) => (1 - a!) * ENTER_Y + b! * ERASE_Y)
  const scale = useTransform(x, (b) => 1 - 0.04 * b)
  const scaleX = e
  const filter = useTransform([e, x], ([a, b]: number[]) => {
    // Rasterizar un desenfoque sobre piezas grandes es caro: ahí solo opacidad y movimiento
    const px = metrics.current.height > metrics.current.vh * MAX_BLUR_HEIGHT ? 0 : (1 - a!) * BLUR + b! * BLUR
    return px < 0.05 ? 'none' : `blur(${px.toFixed(2)}px)`
  })

  const lineOpacity = useTransform(x, (b) => 1 - b)

  if (!animate) return { ref, style: undefined }
  if (line) return { ref, style: { scaleX, opacity: lineOpacity, transformOrigin: '0% 50%' } }
  return { ref, style: { opacity, y, scale, ...(mode === 'full' && blur ? { filter } : null) } }
}

type SceneTag = 'section' | 'div' | 'header' | 'footer' | 'ul' | 'li'
const sceneTags = {
  section: motion.section,
  div: motion.div,
  header: motion.header,
  footer: motion.footer,
  ul: motion.ul,
  li: motion.li,
} satisfies Record<SceneTag, unknown>

type SceneProps = Omit<ComponentPropsWithoutRef<'section'>, 'children'> & {
  as?: SceneTag
  children?: ReactNode
}

/**
 * Agrupa un bloque semántico. No transforma nada por sí mismo: cada `<Build>`
 * hijo se construye y se borra solo.
 */
export function ScrollScene({ as = 'div', children, ...rest }: SceneProps) {
  const Tag = sceneTags[as] as ElementType
  return <Tag {...rest}>{children}</Tag>
}

type BuildTag = 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'ul' | 'li' | 'span' | 'figure' | 'section' | 'header' | 'a'
const buildTags = {
  div: motion.div,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  ul: motion.ul,
  li: motion.li,
  span: motion.span,
  figure: motion.figure,
  section: motion.section,
  header: motion.header,
  a: motion.a,
} satisfies Record<BuildTag, unknown>

type BuildProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  as?: BuildTag
  /** Posición en la secuencia: cada índice entra un poco después. */
  i?: number
  /** Variante línea: se dibuja con scaleX 0→1 desde la izquierda. */
  line?: boolean
  /** Desenfoque (apágalo sobre contenido 3D). */
  blur?: boolean
  /** Se borra al salir por arriba (por defecto sí). */
  erase?: boolean
  /** Se construye al entrar por abajo (por defecto sí). */
  enter?: boolean
  children?: ReactNode
}

export function Build({ as = 'div', i = 0, line = false, blur = true, erase = true, enter = true, style: userStyle, children, ...rest }: BuildProps) {
  const { ref, style } = useBuildStyle({ i, line, blur, erase, enter })
  const Tag = buildTags[as] as ElementType
  return (
    <Tag ref={ref as never} {...rest} style={userStyle || style ? { ...userStyle, ...style } : undefined}>
      {children}
    </Tag>
  )
}
