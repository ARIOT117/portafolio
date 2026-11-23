import { motion, type Variants } from 'motion/react'
import { Link, useLocation } from 'react-router'
import { useT } from '../../i18n/context'
import { easeOutExpo, reducedTransition, useReducedMotionSafe } from '../../styles/motion'
import { ScrollScene } from '../motion/ScrollScene'
import { useIntroPhase } from '../Intro/introStore'
import styles from './Hero.module.css'

const PROOF = {
  es: '1er lugar local · NASA Space Apps 2026',
  en: '1st place (local) · NASA Space Apps 2026',
}

export default function Hero() {
  const { t, lang } = useT()
  const location = useLocation()
  const phase = useIntroPhase()
  const reduced = useReducedMotionSafe()

  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 14 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced
        ? reducedTransition
        : { duration: 0.8, ease: easeOutExpo, delay: 0.3 + i * 0.08 },
    }),
  }
  const state = phase === 'type' ? 'hidden' : 'show'

  return (
    <ScrollScene as="section" build={false} id="inicio" className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <motion.p className={styles.greeting} variants={item} custom={0} initial="hidden" animate={state}>
            {t.hero.greeting}
          </motion.p>
          <motion.h1 className={styles.name} variants={item} custom={1} initial="hidden" animate={state}>
            {t.hero.name}
          </motion.h1>
          <motion.p className={styles.role} variants={item} custom={2} initial="hidden" animate={state}>
            {t.hero.role}
          </motion.p>
          <motion.div variants={item} custom={3} initial="hidden" animate={state}>
            <Link to="/p/eclipse-rojo" state={{ backgroundLocation: location }} className={styles.proof}>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden>
                <path d="M8 1.5 9.7 6l4.8.3-3.7 3 1.2 4.7L8 11.4 4 14l1.2-4.7-3.7-3L6.3 6 8 1.5Z" />
              </svg>
              {PROOF[lang]}
              <span aria-hidden className={styles.proofArrow}>→</span>
            </Link>
          </motion.div>
          <motion.div className={styles.actions} variants={item} custom={4} initial="hidden" animate={state}>
            <a href="#proyectos" className={styles.primary}>
              {t.hero.ctaProjects}
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
              </svg>
            </a>
            <a href="#contacto" className={styles.secondary}>
              {t.hero.ctaContact}
            </a>
          </motion.div>
        </div>

        <motion.div className={styles.foot} variants={item} custom={5} initial="hidden" animate={state}>
          <p className={`mono ${styles.location}`}>{t.hero.location}</p>
          <p className={styles.about}>{t.hero.about}</p>
        </motion.div>
      </div>
    </ScrollScene>
  )
}
