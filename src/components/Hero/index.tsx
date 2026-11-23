import { motion, type Variants } from 'motion/react'
import { useT } from '../../i18n/context'
import { easeOutExpo, reducedTransition, useReducedMotionSafe } from '../../styles/motion'
import { useIntroPhase } from '../Intro/introStore'
import styles from './Hero.module.css'

export default function Hero() {
  const { t } = useT()
  const phase = useIntroPhase()
  const reduced = useReducedMotionSafe()

  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 14 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced
        ? reducedTransition
        : { duration: 0.8, ease: easeOutExpo, delay: 0.12 + i * 0.08 },
    }),
  }
  const state = phase === 'type' ? 'hidden' : 'show'

  return (
    <section id="inicio" className={styles.hero}>
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
          <motion.div className={styles.actions} variants={item} custom={3} initial="hidden" animate={state}>
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

        <motion.div className={styles.foot} variants={item} custom={4} initial="hidden" animate={state}>
          <p className={`mono ${styles.location}`}>{t.hero.location}</p>
          <p className={styles.about}>{t.hero.about}</p>
        </motion.div>
      </div>
    </section>
  )
}
