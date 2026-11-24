import { useId, type CSSProperties, type ReactNode } from 'react'
import styles from './Folder.module.css'

/*
 * Carpeta de vidrio: port de FolderComponent de RareUI. Todo se dibuja en una base de
 * 321 × 270 y se escala al ancho del contenedor (1 px base = 100cqw / 321, ver --u en el CSS).
 */

/** Contorno de la solapa frontal (321 × 241), con la pestaña incluida. */
const FLAP_PATH =
  'M0 25C0 11.1929 11.1929 0 25 0H136.084C143.044 0 149.689 2.90139 154.42 8.00608L178.08 33.5343C182.811 38.639 189.456 41.5404 196.416 41.5404H296C309.807 41.5404 321 52.7333 321 66.5404V216C321 229.807 309.807 241 296 241H25C11.1929 241 0 229.807 0 216V25Z'

/** Trazo interior de la solapa. */
const FLAP_EDGE =
  'M25 0.5H136.084C142.905 0.5 149.417 3.3431 154.054 8.3457L177.713 33.874C182.539 39.0808 189.317 42.04 196.416 42.04H296C309.531 42.04 320.5 53.0092 320.5 66.54V216C320.5 229.531 309.531 240.5 296 240.5H25C11.469 240.5 0.5 229.531 0.5 216V25C0.5 11.469 11.469 0.5 25 0.5Z'

/** Barras de la hoja: encabezado y dos columnas de nueve renglones. */
const ROWS = Array.from({ length: 9 }, (_, i) => 61 + i * 14.1)

/** Hoja de papel en esqueleto (164 × 214), la de los costados del abanico. */
function PaperCard({ filterId }: { filterId: string }) {
  return (
    <svg className={styles.paperSvg} viewBox="0 0 164 214" fill="none" aria-hidden>
      <g filter={`url(#${filterId})`}>
        <rect x="0.5" y="0.5" width="163" height="213" rx="19.5" fill="#F1F1F1" stroke="#E0E0E0" />
        <rect x="14" y="31" width="135" height="12" rx="6" fill="#D4D4D4" />
        {ROWS.map((y) => (
          <g key={y}>
            <rect x="14.8" y={y} width="64.5" height="5.9" rx="2.9" fill="#D4D4D4" />
            <rect x="84.4" y={y} width="64.5" height="5.9" rx="2.9" fill="#D4D4D4" />
          </g>
        ))}
      </g>
      <defs>
        <filter id={filterId} x="0" y="0" width="164" height="214" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feBlend in="SourceGraphic" in2="bg" result="shape" />
          <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hard" />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="erode" />
          <feOffset dx="3" dy="5" />
          <feGaussianBlur stdDeviation="3.05" />
          <feComposite in2="hard" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
          <feBlend in2="shape" result="inner" />
        </filter>
      </defs>
    </svg>
  )
}

interface Props {
  /** Lo que va en la hoja del centro (portada). Lleva `data-folder-sheet`. */
  sheet: ReactNode
}

/**
 * Dibujo de la carpeta. Solo presentación: quien lo usa pone el enlace y fija `--accent`,
 * `--fg` y `--bob-delay` en un ancestro con la clase `card`. La carpeta se abre con hover,
 * foco o `[data-lift]` (ver Folder.module.css).
 */
export default function FolderShell({ sheet }: Props) {
  const uid = useId().replace(/:/g, '')
  const clipId = `flap-clip-${uid}`
  const paperId = `paper-shadow-${uid}`
  const flapId = `flap-shadow-${uid}`
  return (
    <span className={styles.stage}>
      <span className={styles.art}>
        <span className={styles.base} aria-hidden>
          <span className={styles.back} />

          <span className={`${styles.pc} ${styles.pc1}`}>
            <PaperCard filterId={`${paperId}-a`} />
          </span>
          <span className={`${styles.pc} ${styles.pc3}`}>
            <PaperCard filterId={`${paperId}-b`} />
          </span>
          <span className={`${styles.pc} ${styles.pc2}`} data-folder-sheet>
            {sheet}
          </span>

          <span className={styles.flap}>
            <span className={styles.glass} style={{ clipPath: `url(#${clipId})` } as CSSProperties} />
            <svg className={styles.flapSvg} viewBox="0 0 321 241" preserveAspectRatio="none" fill="none">
              <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                <path d={FLAP_PATH} transform="scale(0.0031153 0.0041494)" />
              </clipPath>
              <g filter={`url(#${flapId})`}>
                <path className={styles.flapFill} d={FLAP_PATH} />
                <path className={styles.flapStroke} d={FLAP_EDGE} />
              </g>
              <defs>
                <filter id={flapId} x="-25.4" y="-25.4" width="371.8" height="291.8" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="bg" />
                  <feBlend in="SourceGraphic" in2="bg" result="shape" />
                  <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hard" />
                  <feOffset />
                  <feGaussianBlur stdDeviation="2.65" />
                  <feComposite in2="hard" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0" />
                  <feBlend in2="shape" result="inner" />
                </filter>
              </defs>
            </svg>
            {/* Cuerpo de la solapa sin la pestaña: la vista mide su borde superior al volar la hoja */}
            <span className={styles.flapBody} data-folder-front />
          </span>
        </span>
      </span>
      <span className={styles.floor} aria-hidden />
    </span>
  )
}
