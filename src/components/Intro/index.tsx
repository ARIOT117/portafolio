import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { useT } from '../../i18n/LangProvider'
import { easeInOutQuart, easeOutExpo, easeOutQuart } from '../../styles/motion'
import styles from './Intro.module.css'
import {
  FLY_MS,
  TYPE_MS,
  markIntroSeen,
  setIntroPhase,
  skipIntro,
  useIntroPhase,
} from './introStore'

const WORD = 'ARIOT117'
const STAGGER = 0.045

/** Transición de la palabra hacia la marca de la Nav (la lee también Nav). */
export const brandFlight = { duration: FLY_MS / 1000, ease: easeInOutQuart }

export default function Intro() {
  const phase = useIntroPhase()
  const { t } = useT()

  // Temporizadores de fase
  useEffect(() => {
    if (phase === 'type') {
      markIntroSeen()
      const id = window.setTimeout(() => setIntroPhase('fly'), TYPE_MS)
      return () => window.clearTimeout(id)
    }
    if (phase === 'fly') {
      const id = window.setTimeout(() => setIntroPhase('done'), FLY_MS)
      return () => window.clearTimeout(id)
    }
  }, [phase])

  // Bloquea el scroll mientras la intro está activa
  useEffect(() => {
    if (phase !== 'type') return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prev
    }
  }, [phase])

  // Saltar con teclado
  useEffect(() => {
    if (phase !== 'type') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        skipIntro()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  return (
    <>
      <AnimatePresence>
        {phase === 'type' && (
          <motion.div
            key="overlay"
            className={styles.overlay}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: easeOutQuart } }}
            onClick={skipIntro}
          />
        )}
      </AnimatePresence>
      {phase === 'type' && (
        <div className={styles.stage} onClick={skipIntro}>
          <motion.div
            layoutId="brand"
            className={styles.word}
            initial={{ letterSpacing: '0.3em' }}
            animate={{ letterSpacing: '-0.035em' }}
            transition={{ duration: 1.1, ease: easeOutExpo }}
          >
            <span className="sr-only">{WORD}</span>
            {WORD.split('').map((char, i) => (
              <motion.span
                key={i}
                aria-hidden
                className={styles.letter}
                initial={{ opacity: 0, y: 8, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.1 + i * STAGGER }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
          <button
            type="button"
            className={styles.skip}
            aria-label={t.intro.skipLabel}
            onClick={(e) => {
              e.stopPropagation()
              skipIntro()
            }}
          >
            {t.intro.skip}
          </button>
        </div>
      )}
    </>
  )
}
