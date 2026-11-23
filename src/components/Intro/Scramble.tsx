import { useEffect, useState } from 'react'
import styles from './Intro.module.css'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@*/<>'
const TICK_MS = 55

const randomGlyph = (): string => GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length))

interface Props {
  text: string
  /** Retraso (ms) antes de empezar a decodificar. */
  start: number
  /** Ms entre el bloqueo de una letra y la siguiente. */
  step: number
  /** Ms que cada letra cicla caracteres antes de fijarse (a partir de su turno). */
  cycle: number
}

/**
 * Decodifica `text` letra a letra de izquierda a derecha. Cada letra reserva su
 * ancho real (copia invisible) y el glifo cambiante se superpone centrado, así
 * la palabra no tiembla. Solo es decorativo: el texto real va en un sr-only fuera.
 */
export default function Scramble({ text, start, step, cycle }: Props) {
  const chars = text.split('')
  const [shown, setShown] = useState<(string | null)[]>(() => chars.map(() => null))

  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    let last = -TICK_MS
    const frame = (now: number) => {
      const t = now - t0
      if (t - last >= TICK_MS) {
        last = t
        const next = chars.map((c, i) => {
          const lockAt = start + i * step + cycle
          if (c === ' ' || t >= lockAt) return c
          return t >= start + i * step ? randomGlyph() : null
        })
        setShown((prev) => (prev.every((p, i) => p === next[i]) ? prev : next))
        if (t >= start + (chars.length - 1) * step + cycle) return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, start, step, cycle])

  return (
    <>
      {chars.map((c, i) => {
        const g = shown[i]
        const locked = g === c
        return (
          <span key={i} aria-hidden className={styles.letter}>
            <span className={styles.ghost}>{c === ' ' ? ' ' : c}</span>
            {g && c !== ' ' && (
              <span className={`${styles.glyph} ${locked ? styles.locked : ''}`}>{g}</span>
            )}
          </span>
        )
      })}
    </>
  )
}
