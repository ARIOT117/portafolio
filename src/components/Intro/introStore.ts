import { useSyncExternalStore } from 'react'

/**
 * Fase de la intro, compartida entre Intro, Nav y Hero.
 * - type: letras de ARIOT117 entrando sobre el overlay
 * - fly: la palabra viaja a la Nav, el overlay se desvanece y el Hero entra
 * - done: intro terminada (o no hubo intro)
 */
export type IntroPhase = 'type' | 'fly' | 'done'

export const INTRO_STORAGE_KEY = 'intro-seen'
/** Tiempo que dura la fase `type` antes de volar (letras ~1.1 s + pausa). */
export const TYPE_MS = 1500
/** Duración del vuelo; coincide con el layout transition de la Nav. */
export const FLY_MS = 850

function shouldSkipIntro(): boolean {
  try {
    if (window.sessionStorage.getItem(INTRO_STORAGE_KEY)) return true
  } catch {
    /* sin sessionStorage: se muestra */
  }
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

let phase: IntroPhase | null = null
const listeners = new Set<() => void>()

export function getIntroPhase(): IntroPhase {
  if (phase === null) phase = shouldSkipIntro() ? 'done' : 'type'
  return phase
}

export function setIntroPhase(next: IntroPhase): void {
  if (phase === next) return
  phase = next
  listeners.forEach((l) => l())
}

/** Salta la intro: la palabra vuela directo a la Nav. */
export function skipIntro(): void {
  if (getIntroPhase() === 'type') setIntroPhase('fly')
}

export function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1')
  } catch {
    /* ignorar */
  }
}

/** Solo para pruebas. */
export function resetIntroForTests(): void {
  phase = null
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useIntroPhase(): IntroPhase {
  return useSyncExternalStore(subscribe, getIntroPhase, () => 'done' as IntroPhase)
}
