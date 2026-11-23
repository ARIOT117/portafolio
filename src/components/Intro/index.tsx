import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { useT } from '../../i18n/context'
import Scramble from './Scramble'
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
const NAME = 'Diego Esparza'
/** Línea de tiempo (ms desde que arranca la intro). */
const PUNCH_AT = 880
const NAME_AT = 1060

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
            className={styles.flash}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 0.7, delay: PUNCH_AT / 1000, times: [0, 0.3, 1], ease: easeOutQuart }}
          />
          <div className={styles.lockup}>
            <motion.div
              layoutId="brand"
              className={styles.word}
              transition={brandFlight}
            >
              <motion.div
                className={styles.punch}
                animate={{ scale: [1, 1.07, 1] }}
                transition={{ duration: 0.45, delay: PUNCH_AT / 1000, times: [0, 0.4, 1], ease: easeOutExpo }}
              >
                <span className="sr-only">{WORD}</span>
                <Scramble text={WORD} start={0} step={85} cycle={260} />
                <motion.span
                  aria-hidden
                  className={styles.sweep}
                  initial={{ x: '-130%', opacity: 0 }}
                  animate={{ x: '130%', opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.6, delay: PUNCH_AT / 1000, ease: easeInOutQuart }}
                />
              </motion.div>
            </motion.div>
            <motion.p
              className={styles.name}
              initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -6], filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(4px)'] }}
              transition={{ duration: (TYPE_MS - NAME_AT) / 1000, delay: NAME_AT / 1000, times: [0, 0.22, 0.93, 1], ease: easeOutExpo }}
            >
              <span className="sr-only">{NAME}</span>
              <Scramble text={NAME} start={0} step={26} cycle={150} />
            </motion.p>
          </div>
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
