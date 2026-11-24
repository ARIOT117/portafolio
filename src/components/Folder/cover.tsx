import { useEffect, useState, type CSSProperties } from 'react'
import '@fontsource-variable/fraunces/wght.css'
import '@fontsource-variable/fraunces/wght-italic.css'
import '@fontsource-variable/manrope'
import '@fontsource-variable/figtree'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/rajdhani/600.css'
import { gymZongKit, type Project } from '../../content/projects'
import { useT } from '../../i18n/context'
import styles from './covers.module.css'

let framesPromise: Promise<string[]> | null = null
let framesCache: string[] | null = null

/** ApiGym: los 3 frames del primer ejercicio del manifest (la portada los cicla). */
function loadApiGymFrames(url: string): Promise<string[]> {
  framesPromise ??= fetch(url)
    .then((r) => r.json() as Promise<{ frames: string[] }[]>)
    .then((list) => (framesCache = list[0]?.frames ?? []))
    .catch(() => [])
  return framesPromise
}

/** Imágenes de la portada: solo ApiGym las necesita (frames); el resto es [cover]. */
export function useCover(project: Project): string[] {
  const { manifest, cover } = project.assets
  const [srcs, setSrcs] = useState<string[]>(manifest ? (framesCache ?? []) : [cover])
  useEffect(() => {
    if (!manifest) return
    let alive = true
    loadApiGymFrames(manifest).then((s) => alive && setSrcs(s))
    return () => {
      alive = false
    }
  }, [manifest])
  return srcs
}

type Bi = { es: string; en: string }
const L = {
  place: { es: '1er lugar local', en: '1st place local' } satisfies Bi,
  gym: { es: 'Rutinas · sin conexión', en: 'Workouts · offline' } satisfies Bi,
  streak: { es: '12 días', en: '12 days' } satisfies Bi,
  exercises: { es: 'ejercicios', en: 'exercises' } satisfies Bi,
  ticketTotal: { es: 'TOTAL', en: 'TOTAL' } satisfies Bi,
  ticketFood: { es: 'Comida', en: 'Food' } satisfies Bi,
  cafe: { es: 'Cat café · Chihuahua', en: 'Cat café · Chihuahua' } satisfies Bi,
}

type Props = { project: Project; srcs: string[]; eager?: boolean }

function EclipseCover({ eager }: Pick<Props, 'eager'>) {
  const { lang } = useT()
  return (
    <>
      <span className={styles.erStars} />
      <span className={styles.erSphere}>
        <img
          className={styles.erMars}
          src="/projects/eclipse-rojo/mars-texture.webp"
          alt=""
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
        />
        <span className={styles.erShade} />
        <span className={styles.erAnomaly} />
      </span>
      <svg className={styles.erReticle} viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="49" />
        <path d="M50 0v6M50 94v6M0 50h6M94 50h6M14.6 14.6l4.2 4.2M85.4 14.6l-4.2 4.2" />
      </svg>
      <span className={styles.erTitle}>
        <span className={styles.erKicker}>OPERACIÓN</span>
        <span className={styles.erName}>ECLIPSE ROJO</span>
      </span>
      <span className={styles.erTag}>
        <span>NASA SPACE APPS 2026</span>
        <span className={styles.erPlace}>{L.place[lang]}</span>
      </span>
    </>
  )
}

function GymZongCover({ eager }: Pick<Props, 'eager'>) {
  const { lang } = useT()
  const kit = {
    '--bg': gymZongKit.background,
    '--ink': gymZongKit.text,
    '--mint': gymZongKit.primary,
    '--mint-ink': gymZongKit.accentText,
    '--streak': gymZongKit.chartStreak,
  } as CSSProperties
  return (
    <span className={styles.gzRoot} style={kit}>
      <span className={styles.gzBlob} />
      <span className={styles.gzBrand}>
        <img src="/projects/gym-zong/logo.svg" alt="" draggable={false} loading={eager ? 'eager' : 'lazy'} />
        <span className={styles.gzName}>Gym Zong</span>
      </span>
      <span className={styles.gzLine}>{L.gym[lang]}</span>
      <span className={styles.gzPhone}>
        <img
          src="/projects/gym-zong/screen-01.webp"
          alt=""
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
        />
      </span>
      <span className={styles.gzStreak}>
        <span className={styles.gzDot} />
        {L.streak[lang]}
      </span>
    </span>
  )
}

function ApiGymCover({ srcs, eager }: Pick<Props, 'srcs' | 'eager'>) {
  const { lang } = useT()
  return (
    <span className={styles.agRoot}>
      <img className={styles.agLogo} src="/projects/apigym/logo-b-menta.svg" alt="" draggable={false} />
      <span className={styles.agCount}>
        <span className={styles.agNum}>1,257</span>
        <span className={styles.agLabel}>{L.exercises[lang]}</span>
      </span>
      <span className={styles.agStage}>
        {srcs.map((s, i) => (
          <img
            key={s}
            src={s}
            alt=""
            draggable={false}
            decoding={eager ? 'sync' : 'async'}
            style={{ '--i': i } as CSSProperties}
          />
        ))}
      </span>
      <span className={styles.agChip}>GET /api/v1/exercises</span>
    </span>
  )
}

/** Un día del mes = una barra; la última (hoy) lleva el acento. Alturas en cqh. */
const DAYS = [3, 5, 4, 9, 4, 3, 6, 5, 11, 4, 3, 5, 7, 4, 6, 3, 10, 5, 4, 6, 8, 5, 14, 0, 0, 0, 0, 0, 0, 0]

function ImoneyCover({ eager }: Pick<Props, 'eager'>) {
  const { lang } = useT()
  return (
    <span className={styles.imRoot}>
      <span className={styles.imBrand}>
        <img
          src="/projects/imoney/ajolote-perfil.webp"
          alt=""
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
        />
        <span className={styles.imName}>iMoney</span>
      </span>
      <span className={styles.imDays}>
        {DAYS.map((h, i) => (
          <span
            key={i}
            className={styles.imDay}
            data-today={i === 22 || undefined}
            data-future={h === 0 || undefined}
            style={{ '--h': `${h || 2}cqh` } as CSSProperties}
          />
        ))}
      </span>
      <span className={styles.imChip}>
        <span className={styles.imDot} />
        $ 87.50 · {L.ticketFood[lang]}
      </span>
      <span className={styles.imSlot}>
        <span className={styles.imPaper}>
          <span className={styles.imShop}>ABARROTES</span>
          <span className={styles.imLine}>
            <span>TACOS x3</span>
            <span>60.00</span>
          </span>
          <span className={styles.imLine}>
            <span>HORCHATA</span>
            <span>17.50</span>
          </span>
          <span className={styles.imLine}>
            <span>REFRESCO</span>
            <span>10.00</span>
          </span>
          <span className={styles.imTotal}>
            <span>{L.ticketTotal[lang]}</span>
            <span>87.50</span>
          </span>
        </span>
      </span>
    </span>
  )
}

function CatstoreCover({ eager }: Pick<Props, 'eager'>) {
  const { lang } = useT()
  return (
    <span className={styles.csRoot}>
      <span className={styles.csSun} />
      <span className={styles.csArch}>
        <img
          src="/projects/catstore/home.webp"
          alt=""
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
        />
      </span>
      <span className={styles.csTitle}>
        Snacks <em>and</em>
        <br />
        Cats
      </span>
      <span className={styles.csPill}>{L.cafe[lang]}</span>
    </span>
  )
}

/**
 * Contenido de la hoja: lo usan la hoja de la carpeta y la hoja que vuela, para que
 * sean idénticas. Todo se mide en cqw/cqh del contenedor, así escala sin deformarse.
 * La versión `eager` es la de la hoja que vuela: se congela porque no cuelga de la carpeta.
 */
export function CoverArt({ project, srcs, eager }: Props) {
  return (
    <span className={styles.cover} data-cover={project.slug} data-eager={eager || undefined} aria-hidden>
      {project.slug === 'eclipse-rojo' && <EclipseCover eager={eager} />}
      {project.slug === 'gym-zong' && <GymZongCover eager={eager} />}
      {project.slug === 'apigym' && <ApiGymCover srcs={srcs} eager={eager} />}
      {project.slug === 'imoney' && <ImoneyCover eager={eager} />}
      {project.slug === 'catstore' && <CatstoreCover eager={eager} />}
    </span>
  )
}
