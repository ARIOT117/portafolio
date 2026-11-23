import { useEffect, useRef } from 'react'
import styles from './EclipseRojoPlanet.module.css'

/* Marte en CSS: la textura equirrectangular se desplaza dentro de un círculo
   (transform, compuesto en GPU) y se pausa cuando el hero sale de vista. */
export default function EclipseRojoPlanet() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      el.dataset.paused = e?.isIntersecting === false ? 'true' : 'false'
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={styles.planet} aria-hidden>
      <div className={styles.sphere}>
        <div className={styles.map} />
        <div className={styles.shade} />
      </div>
      <div className={styles.rim} />
    </div>
  )
}
