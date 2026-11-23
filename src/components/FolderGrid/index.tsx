import { motion, type Variants } from 'motion/react'
import { projects } from '../../content/projects'
import { useT } from '../../i18n/LangProvider'
import { easeOutExpo, reducedTransition, useReducedMotionSafe } from '../../styles/motion'
import Folder from '../Folder'
import styles from './FolderGrid.module.css'

export default function FolderGrid() {
  const { t } = useT()
  const reduced = useReducedMotionSafe()

  const list: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.09 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced ? reducedTransition : { duration: 0.8, ease: easeOutExpo },
    },
  }

  return (
    <section id="proyectos" className={styles.root} aria-labelledby="proyectos-titulo">
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 id="proyectos-titulo" className={styles.title}>{t.projects.title}</h2>
          <p className={styles.intro}>{t.projects.intro}</p>
        </header>
        <motion.ul
          className={styles.grid}
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {projects.map((p) => (
            <motion.li key={p.slug} variants={item}>
              <Folder project={p} />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
