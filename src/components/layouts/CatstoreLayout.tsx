import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import '@fontsource-variable/fraunces/wght.css'
import '@fontsource-variable/fraunces/wght-italic.css'
import '@fontsource-variable/inter'
import type { Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/context'
import { duration, easeOutExpo, useReducedMotionSafe } from '../../styles/motion'
import { Build, ScrollScene } from '../motion/ScrollScene'
import { ProjectClosing, ProjectLinks, projectTitleId } from './ProjectBasics'
import styles from './CatstoreLayout.module.css'

type Lang = 'es' | 'en'
const pick = (lang: Lang, v: { es: string; en: string }) => v[lang]

/* Textos propios de esta vista (no existen en i18n). */
const local = {
  featuresTitle: { es: 'Qué tiene', en: 'What it has' },
  featuresLead: {
    es: 'Un sitio completo de principio a fin: lo que ve quien visita la cafetería y lo que pasa detrás de una cuenta.',
    en: 'A site that works end to end: what a visitor to the cafe sees, and what happens behind an account.',
  },
  shots: [
    {
      tab: { es: 'Inicio', en: 'Home' },
      alt: {
        es: 'Inicio de snacks & cats: "Un cafecito. Un antojo. Muchos michis." con un gato negro con moño rosa',
        en: 'snacks & cats home page: "Un cafecito. Un antojo. Muchos michis." with a black cat wearing a pink bow tie',
      },
    },
    {
      tab: { es: 'El menú', en: 'Menu' },
      alt: {
        es: 'Página El menú: bebidas con café, como latte y capuchino, con precios en pesos mexicanos y categorías a la izquierda',
        en: 'Menu page: coffee drinks such as latte and cappuccino with prices in Mexican pesos and categories on the left',
      },
    },
    {
      tab: { es: 'Tiendita', en: 'Shop' },
      alt: {
        es: 'Tiendita: productos para gatos como alimento y juguetes, con filtros y buscador',
        en: 'Shop page: cat products such as food and toys, with filters and a search bar',
      },
    },
  ],
  mobile: {
    es: 'Inicio de snacks & cats en un teléfono',
    en: 'snacks & cats home page on a phone',
  },
  tablist: { es: 'Páginas del sitio', en: 'Site pages' },
  stageLabel: {
    es: 'Capturas del sitio en computadora y teléfono',
    en: 'Site screenshots on desktop and phone',
  },
  features: [
    {
      t: { es: 'El menú', en: 'The menu' },
      d: {
        es: 'Bebidas con café, sin café, limonadas y antojos, con precios en pesos.',
        en: 'Coffee drinks, non-coffee drinks, lemonades and treats, priced in pesos.',
      },
    },
    {
      t: { es: 'La cafetería', en: 'The cafe' },
      d: {
        es: 'Ubicación en el centro de Chihuahua, mapa en Maps y contacto por WhatsApp.',
        en: 'Location in downtown Chihuahua, a Maps link and WhatsApp contact.',
      },
    },
    {
      t: { es: 'Tiendita', en: 'Shop' },
      d: {
        es: 'Productos para tu gato: alimento, juguetes y premios, con buscador.',
        en: 'Products for your cat: food, toys and treats, with a search bar.',
      },
    },
    {
      t: { es: 'Cuentas', en: 'Accounts' },
      d: { es: 'Registro e inicio de sesión desde Acceder.', en: 'Sign up and sign in from Acceder.' },
    },
    {
      t: { es: 'Carrito persistente', en: 'Persistent cart' },
      d: { es: 'El carrito se guarda al iniciar sesión.', en: 'The cart is saved once you sign in.' },
    },
    {
      t: { es: 'Mis pedidos', en: 'My orders' },
      d: { es: 'Cada compra queda guardada en la cuenta.', en: 'Each purchase is saved to the account.' },
    },
    {
      t: { es: 'Foto de perfil privada', en: 'Private profile photo' },
      d: { es: 'Cada cuenta sube la suya y solo se ve desde ella.', en: 'Each account uploads its own and it stays private.' },
    },
  ],
} as const

const URL_TEXT = 'web-production-1899fab5.up.railway.app'

export default function CatstoreLayout({ project }: { project: Project }) {
  const { t, lang } = useT()
  const text = useProjectText(project)
  const [brand, ...rest] = text.name.split('·')
  const sub = rest.join('·').trim()
  const reduced = useReducedMotionSafe()
  const [home, menu, shop, mobile] = project.assets.images
  const shotSrc = [home!, menu!, shop!]
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduced || paused) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % shotSrc.length), 4800)
    return () => window.clearInterval(id)
    // shotSrc.length es constante
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, paused])

  return (
    <div
      className={styles.page}
      style={{ '--pb-ink': '#322f25', '--pb-ink-2': '#55513f', '--pb-ink-3': '#6b6753', '--pb-line': '#ddd3c0', '--pb-bg': '#f8f3e9', '--pb-accent': '#b04a2c' } as CSSProperties}
    >
      <ScrollScene as="section" build={false} className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>{text.kicker}</p>
          <h1 id={projectTitleId(project.slug)} tabIndex={-1} className={styles.title}>
            <span className={styles.brand}>{brand?.trim()}</span>
            {sub && (
              <>
                {/* Espacios como nodos de texto (el título es flex, no se ven) para que el nombre accesible sea "CATSTORE · Snacks and Cats" */}
                {' '}
                <span className="sr-only">·</span>{' '}
                <span className={styles.sub}>{sub}</span>
              </>
            )}
          </h1>
          <p className={styles.summary}>{text.summary}</p>
          <ProjectLinks project={project} />
        </div>

        <motion.div
          className={styles.stage}
          role="group"
          aria-label={pick(lang, local.stageLabel)}
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.12 : duration.slow, ease: easeOutExpo, delay: reduced ? 0 : 0.1 }}
        >
          <div className={styles.tabs} role="group" aria-label={pick(lang, local.tablist)}>
            {local.shots.map((sh, i) => (
              <button
                key={sh.tab.es}
                type="button"
                className={styles.tab}
                aria-pressed={active === i}
                onClick={() => {
                  setActive(i)
                  setPaused(true)
                }}
              >
                {pick(lang, sh.tab)}
              </button>
            ))}
          </div>
          <figure className={styles.browser}>
            <div className={styles.bar} aria-hidden>
              <span className={styles.dots}>
                <i />
                <i />
                <i />
              </span>
              <span className={styles.url}>
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
                  <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
                </svg>
                {URL_TEXT}
              </span>
            </div>
            <div className={styles.screens}>
              {shotSrc.map((src, i) => (
                <img
                  key={src}
                  className={styles.screen}
                  data-active={active === i}
                  src={src}
                  alt={pick(lang, local.shots[i]!.alt)}
                  aria-hidden={active === i ? undefined : true}
                  width={1440}
                  height={900}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ))}
            </div>
          </figure>
          <figure className={styles.phone}>
            <img src={mobile!} alt={pick(lang, local.mobile)} width={780} height={1688} loading="lazy" decoding="async" />
          </figure>
        </motion.div>
      </ScrollScene>

      <ScrollScene as="section" className={styles.features} aria-labelledby="catstore-features">
        <div className={styles.featuresInner}>
          <Build className={styles.featuresHead}>
            <h2 id="catstore-features" className={styles.h2}>{pick(lang, local.featuresTitle)}</h2>
            <p className={styles.lead}>{pick(lang, local.featuresLead)}</p>
          </Build>
          <ol className={styles.featureList}>
            {local.features.map((f, i) => (
              <ScrollScene as="li" key={f.t.es} erase={false}>
                <Build className={styles.feature}>
                  <span className={styles.num} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.fTitle}>{pick(lang, f.t)}</span>
                  <span className={styles.fDesc}>{pick(lang, f.d)}</span>
                </Build>
              </ScrollScene>
            ))}
          </ol>
        </div>
      </ScrollScene>

      <ScrollScene as="section" className={styles.basics} erase={false}>
        <div className={styles.basicsInner}>
          <Build>
            <h2 className={styles.label}>{t.projects.role}</h2>
            <ul className={styles.roles}>
              {text.role.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Build>
          <Build i={1}>
            <h2 className={styles.label}>{t.projects.stack}</h2>
            <ul className={styles.chips}>
              {project.stack.map((s) => (
                <li key={s} className={styles.chip}>{s}</li>
              ))}
            </ul>
          </Build>
        </div>
        <div className={styles.closingWrap}>
          <ProjectClosing project={project} />
        </div>
      </ScrollScene>
    </div>
  )
}
