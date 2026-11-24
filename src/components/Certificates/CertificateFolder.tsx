import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import type { Certificate } from '../../content/certificates'
import { useT } from '../../i18n/context'
import { useReducedMotionSafe } from '../../styles/motion'
import styles from './CertificateFolder.module.css'

/*
 * Carpeta de constancia: port de IconFolder (21st.dev, @romanvasnev) con tema claro.
 * Tres hojas en abanico salen de un bolsillo de vidrio; al pasar o enfocar se abren más.
 * Es un botón: al pulsarlo se abre el diálogo de la constancia (no alterna como la referencia).
 */

/** Contornos: el bolsillo frontal lleva la pestaña a la izquierda; la placa trasera, a la derecha. */
const pathL = (w: number, h: number, r: number, d: number, tw: number, s: number) =>
  `M0 ${r}A${r} ${r} 0 0 1 ${r} 0L${tw} 0C${tw + s * 0.55} 0 ${tw + s * 0.45} ${d} ${tw + s} ${d}L${w - r} ${d}A${r} ${r} 0 0 1 ${w} ${d + r}L${w} ${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}L${r} ${h}A${r} ${r} 0 0 1 0 ${h - r}Z`
const pathR = (w: number, h: number, r: number, d: number, tw: number, s: number) => {
  const x = w - tw
  return `M0 ${d + r}A${r} ${r} 0 0 1 ${r} ${d}L${x - s} ${d}C${x - s * 0.45} ${d} ${x - s * 0.55} 0 ${x} 0L${w - r} 0A${r} ${r} 0 0 1 ${w} ${r}L${w} ${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}L${r} ${h}A${r} ${r} 0 0 1 0 ${h - r}Z`
}

/** Dibuja el contorno a la medida real del elemento (se recalcula al cambiar de tamaño). */
function useShape(ref: RefObject<HTMLElement | null>, make: (w: number, h: number) => string) {
  const [d, setD] = useState('')
  const makeRef = useRef(make)
  makeRef.current = make
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setD(makeRef.current(el.offsetWidth, el.offsetHeight)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return d
}

interface Tile {
  label: string
  node: ReactNode
  /** Fondo cuando la hoja no es una imagen. */
  background?: string
}

const SPREAD = 70

export default function CertificateFolder({
  cert,
  onOpen,
}: {
  cert: Certificate
  onOpen: (el: HTMLButtonElement) => void
}) {
  const { t } = useT()
  const text = t.certificates[cert.i18nKey]
  const reduced = useReducedMotionSafe()
  const gid = useId().replace(/:/g, '')

  const rootRef = useRef<HTMLButtonElement>(null)
  const frontRef = useRef<HTMLSpanElement>(null)
  const backRef = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(false)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [hi, setHi] = useState<number | null>(null)

  // Entrada: la carpeta aparece al entrar en pantalla (sin movimiento, ya está visible).
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setShown(true), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const frontD = useShape(frontRef, (w, h) => pathL(w, h, 24, 24, Math.round(w * 0.42), 46))
  const backD = useShape(backRef, (w, h) => pathR(w, h, 24, 24, Math.round(w * 0.4), 46))

  const tiles: Tile[] = [
    {
      label: t.certificates.tileCert,
      node: <img src={cert.image} alt="" width={cert.imageW} height={cert.imageH} draggable={false} loading="lazy" decoding="async" className={styles.cover} />,
    },
    cert.projectImage
      ? {
          label: text.projectShort,
          node: <img src={cert.projectImage} alt="" draggable={false} loading="lazy" decoding="async" className={styles.cover} />,
        }
      : {
          label: text.projectShort,
          node: <span className={styles.word}>{text.projectShort}</span>,
          background: 'var(--accent)',
        },
    {
      label: text.markLabel,
      node: <span className={styles.mark}>{cert.mark}</span>,
      background: 'color-mix(in oklab, var(--accent) 10%, var(--color-surface))',
    },
  ]

  // Etiquetas que se iluminan al pasar por su hoja: la constancia (distinción) y el proyecto.
  const chips: { label: string; tile?: number }[] = [
    ...(text.distinction ? [{ label: text.distinction, tile: 0 }] : []),
    { label: text.projectShort, tile: 1 },
    { label: cert.year, tile: 2 },
  ]

  const n = tiles.length
  const rs = n > 1 ? 25 / (n - 1) : 0 // grados de giro por paso
  const wide = !reduced && (hover || focus)

  return (
    <button
      ref={rootRef}
      type="button"
      className={styles.root}
      aria-haspopup="dialog"
      data-cert={cert.slug}
      data-shown={shown || reduced || undefined}
      data-lift={wide || undefined}
      style={{ '--accent': cert.accent } as CSSProperties}
      onClick={(e) => onOpen(e.currentTarget)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => {
        setHover(false)
        setHi(null)
      }}
      onFocus={(e) => setFocus(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setFocus(false)}
    >
      <span className={styles.glow} aria-hidden />

      {/* Placa trasera: pestaña a la derecha */}
      <span ref={backRef} className={styles.back} style={{ clipPath: backD ? `path('${backD}')` : undefined }} aria-hidden>
        <svg className={styles.edge} aria-hidden>
          <path d={backD} fill="none" className={styles.backEdge} strokeWidth="2" />
        </svg>
      </span>

      {/* Hojas en arco: x = k·separación, y = k²·9, giro = k·paso */}
      <span className={styles.fan} aria-hidden>
        {tiles.map((tile, i) => {
          const k = i - (n - 1) / 2
          const gap = wide ? SPREAD * 1.15 : SPREAD
          const y = k * k * 9 - (wide ? 4 : 0)
          const rot = k * rs * (wide ? 1.2 : 1)
          const on = hi === i
          return (
            <span
              key={tile.label}
              className={styles.slot}
              style={
                {
                  '--tx': `${k * gap}px`,
                  '--ty': `${y}px`,
                  '--rot': `${rot}deg`,
                  '--from-x': `${k * SPREAD * 0.6}px`,
                  '--i': i,
                  zIndex: on ? 5 : undefined,
                } as CSSProperties
              }
            >
              <span
                className={styles.tile}
                data-on={on || undefined}
                data-dim={(hi !== null && !on) || undefined}
                style={{ '--rot': `${rot}deg` } as CSSProperties}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setHi(i)}
                onPointerLeave={() => setHi((h) => (h === i ? null : h))}
              >
                <span className={styles.face} style={{ background: tile.background }}>
                  {tile.node}
                </span>
                <span className={styles.label}>{tile.label}</span>
              </span>
            </span>
          )
        })}
      </span>

      {/* Bolsillo de vidrio: pestaña a la izquierda */}
      <span ref={frontRef} className={styles.front} style={{ clipPath: frontD ? `path('${frontD}')` : undefined }}>
        <svg className={styles.edge} aria-hidden>
          <defs>
            <linearGradient id={`edge-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgb(255 255 255)" />
              <stop offset=".35" stopColor="rgb(22 21 15 / .08)" />
              <stop offset="1" stopColor="rgb(22 21 15 / .05)" />
            </linearGradient>
          </defs>
          <path d={frontD} fill="none" stroke={`url(#edge-${gid})`} strokeWidth="2" />
        </svg>

        <span className={styles.title}>
          <span className="sr-only">{t.certificates.open}</span> {text.event}
        </span>
        <span className={styles.chips} aria-hidden>
          {chips.map((c) => (
            <span key={c.label} className={styles.chip} data-on={(hi !== null && hi === c.tile) || undefined}>
              {c.label}
            </span>
          ))}
        </span>
        <span className={styles.pill} aria-hidden>
          {tiles.map((tile) => (
            <span key={tile.label} className={styles.mini}>
              <span className={styles.miniFace} style={{ background: tile.background }}>
                {tile.node}
              </span>
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}
