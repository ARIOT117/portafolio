import { useReducedMotion, type Transition } from 'motion/react'

/** Curvas cubic-bezier (mismas que las variables CSS de tokens.css). */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const
export const easeOutQuart = [0.25, 1, 0.5, 1] as const
export const easeInOutQuart = [0.76, 0, 0.24, 1] as const

/** Duraciones en segundos. */
export const duration = {
  fast: 0.18,
  base: 0.32,
  slow: 0.6,
  intro: 1.1,
} as const

/** Springs reutilizables. */
export const spring = {
  /** Sensación táctil por defecto: sin rebote visible. */
  soft: { type: 'spring', stiffness: 260, damping: 32, mass: 1 },
  /** Transformaciones de layout compartido (carpeta a vista). */
  layout: { type: 'spring', stiffness: 220, damping: 30, mass: 1 },
  /** Respuesta rápida para hover y pulsaciones. */
  snappy: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 },
} as const satisfies Record<string, Transition>

/** Transición por tiempo con ease-out-expo. */
export const tween = (seconds: number = duration.base): Transition => ({
  duration: seconds,
  ease: easeOutExpo,
})

/** Transición de reemplazo cuando se pide reducir el movimiento: solo fundido breve. */
export const reducedTransition: Transition = { duration: 0.12, ease: 'linear' }

/**
 * Devuelve `true` si hay que reducir el movimiento. Trata `null` (estado aún
 * desconocido durante SSR/primer render) como falso.
 */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false
}

/** Elige la transición según la preferencia del usuario. */
export function useMotionTransition(normal: Transition): Transition {
  return useReducedMotionSafe() ? reducedTransition : normal
}
