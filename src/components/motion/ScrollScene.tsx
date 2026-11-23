import {
  motion,
  motionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from 'react'
import { useScroller } from '../../hooks/useScroller'
import { useReducedMotionSafe } from '../../styles/motion'

/* Escena de scroll: el bloque se construye al entrar por abajo y se borra al
   salir por arriba. Todo va ligado al scroll (reversible) y sale de
   MotionValues: no hay re-render por fotograma.

   - Construcción: la parte superior del bloque recorre de «borde inferior» a
     55 % de la altura del visor.
   - Borrado: empieza cuando el FINAL del bloque entra en el 38 % superior del
     visor y termina cuando sale por arriba. Medirlo contra el final (y no
     contra el inicio) garantiza que, sea cual sea la altura del bloque, nada
     de lo que aún se lee se desvanece: lo visible ya está en el tercio alto. */
const ENTER_OFFSET = ['start end', 'start 55%'] as const
const ERASE_OFFSET = ['end 38%', 'end start'] as const
const ENTER_AT = 0.55
const ERASE_FROM = 0.38

type Mode = 'static' | 'lite' | 'full'

interface SceneCtx {
  enter: MotionValue<number>
  mode: Mode
}

const SceneContext = createContext<SceneCtx | null>(null)
const ALWAYS_BUILT = motionValue(1)

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
  /** Construye los `<Build>` hijos al entrar. */
  build?: boolean
  /** Borra el bloque al salir por arriba. */
  erase?: boolean
  /** Permite desenfoque al borrar (se desactiva solo en móvil / movimiento reducido). */
  blur?: boolean
  children?: ReactNode
}

export function ScrollScene({ as = 'div', build = true, erase = true, blur = true, children, ...rest }: SceneProps) {
  const ref = useRef<HTMLElement>(null)
  const mode = useSceneMode()
  const scrollOpts = useScroller(ref)
  const container = scrollOpts.container

  const enterScroll = useScroll({ ...scrollOpts, target: ref, offset: [...ENTER_OFFSET] })
  const eraseScroll = useScroll({ ...scrollOpts, target: ref, offset: [...ERASE_OFFSET] })
  const live = useRef(false)

  /* Progreso inicial antes del primer pintado: lo que ya está a la vista nace
     visible y lo que está por debajo nace sin construir. Sin medidas (jsdom)
     todo queda visible. */
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const root = container?.current ?? null
    const vh = root ? root.clientHeight : window.innerHeight
    if (!vh) return
    const origin = root ? root.getBoundingClientRect().top : 0
    const r = el.getBoundingClientRect()
    enterScroll.scrollYProgress.set(clamp01((1 - (r.top - origin) / vh) / (1 - ENTER_AT)))
    eraseScroll.scrollYProgress.set(clamp01((ERASE_FROM - (r.bottom - origin) / vh) / ERASE_FROM))
    live.current = true
  }, [container, enterScroll.scrollYProgress, eraseScroll.scrollYProgress])

  const animate = mode !== 'static'
  const enter = useTransform(enterScroll.scrollYProgress, (v) => (live.current && build && animate ? v : 1))
  const out = useTransform(eraseScroll.scrollYProgress, (v) => (live.current && erase && animate ? v : 0))

  const opacity = useTransform(out, [0, 1], [1, 0.08])
  const scale = useTransform(out, [0, 1], [1, 0.94])
  const y = useTransform(out, [0, 1], [0, 56])
  const filter = useTransform(out, (v) => (v < 0.02 ? 'none' : `blur(${(v * 6).toFixed(2)}px)`))

  const Tag = sceneTags[as] as ElementType
  const style =
    animate && erase
      ? { opacity, scale, y, transformOrigin: '50% 100%', ...(mode === 'full' && blur ? { filter } : null) }
      : undefined

  return (
    <SceneContext.Provider value={{ enter, mode }}>
      <Tag ref={ref} style={style} {...rest}>
        {children}
      </Tag>
    </SceneContext.Provider>
  )
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
  /** Desenfoque al construir (apágalo sobre contenido 3D). */
  blur?: boolean
  children?: ReactNode
}

/** Estilo de construcción de un hijo de la escena (para componentes que no son `<Build>`, p. ej. `Link`). */
export function useBuildStyle(i = 0, line = false, blur = true): Record<string, unknown> | undefined {
  const scene = useContext(SceneContext)
  const mode = scene?.mode ?? 'static'
  const start = Math.min(i * 0.12, 0.5)
  const end = start + 0.5
  const p = scene?.enter ?? ALWAYS_BUILT

  const opacity = useTransform(p, [start, end], [0, 1], { clamp: true })
  const y = useTransform(p, [start, end], [32, 0], { clamp: true })
  const scaleX = useTransform(p, [start, end + 0.1], [0, 1], { clamp: true })
  const blurPx = useTransform(p, [start, end], [6, 0], { clamp: true })
  const filter = useTransform(blurPx, (b) => (b < 0.05 ? 'none' : `blur(${b.toFixed(2)}px)`))

  if (mode === 'static') return undefined
  if (line) return { scaleX, transformOrigin: '0% 50%' }
  return { opacity, y, ...(mode === 'full' && blur ? { filter } : null) }
}

export function Build({ as = 'div', i = 0, line = false, blur = true, style: userStyle, children, ...rest }: BuildProps) {
  const style = useBuildStyle(i, line, blur)
  const Tag = buildTags[as] as ElementType
  return (
    <Tag {...rest} style={userStyle || style ? { ...userStyle, ...style } : undefined}>
      {children}
    </Tag>
  )
}
