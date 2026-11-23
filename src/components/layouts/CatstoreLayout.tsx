import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import '@fontsource-variable/fraunces/wght.css'
import '@fontsource-variable/fraunces/wght-italic.css'
import '@fontsource-variable/inter'
import type { Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/LangProvider'
import { duration, easeOutExpo, useReducedMotionSafe } from '../../styles/motion'
import { ProjectLinks, projectTitleId } from './ProjectBasics'
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
  shots: {
    home: {
      es: 'Página de inicio de Catstore: un gatito esponjoso sobre fondo durazno y el título "Todo para consentir a tu michi"',
      en: 'Catstore home page: a fluffy kitten on a peach background with the headline "Todo para consentir a tu michi"',
    },
    products: {
      es: 'Página de productos de Catstore con buscador y tarjetas de productos',
      en: 'Catstore products page with a search bar and product cards',
    },
    mobile: {
      es: 'Inicio de Catstore en un teléfono',
      en: 'Catstore home page on a phone',
    },
  },
  stageLabel: {
    es: 'Capturas del sitio en computadora y teléfono',
    en: 'Site screenshots on desktop and phone',
  },
  features: [
    {
      t: { es: 'Menú con precios', en: 'Menu with prices' },
      d: { es: 'Lo que sirve la cafetería, con su precio.', en: 'What the cafe serves, with each price.' },
    },
    {
      t: { es: 'Ubicación', en: 'Location' },
      d: { es: 'Dónde encontrar la cafetería en Chihuahua.', en: 'Where to find the cafe in Chihuahua.' },
    },
    {
      t: { es: 'Tienda de demostración', en: 'Demo store' },
      d: { es: 'Productos para gatos con buscador.', en: 'Cat products with a search bar.' },
    },
    {
      t: { es: 'Cuentas de usuario', en: 'User accounts' },
      d: { es: 'Registro e inicio de sesión.', en: 'Sign up and sign in.' },
    },
    {
      t: { es: 'Carrito persistente', en: 'Persistent cart' },
      d: { es: 'El carrito sigue ahí cuando vuelves.', en: 'The cart is still there when you come back.' },
    },
    {
      t: { es: 'Pedidos', en: 'Orders' },
      d: { es: 'Cada compra queda guardada en la cuenta.', en: 'Each purchase is saved to the account.' },
    },
    {
      t: { es: 'Foto de perfil privada', en: 'Private profile photo' },
      d: { es: 'Cada cuenta sube la suya y solo se ve desde ella.', en: 'Each account uploads its own and it stays private.' },
    },
  ],
} as const

const URL_TEXT = 'catstore-puce.vercel.app'

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotionSafe()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: reduced ? 0.12 : duration.slow, ease: easeOutExpo, delay: reduced ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}

function Browser({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={[styles.browser, className].filter(Boolean).join(" ")}>
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
      <img src={src} alt={alt} width={1440} height={900} loading="eager" decoding="async" />
    </figure>
  )
}

export default function CatstoreLayout({ project }: { project: Project }) {
  const { t, lang } = useT()
  const text = useProjectText(project)
  const [brand, ...rest] = text.name.split('·')
  const sub = rest.join('·').trim()
  const reduced = useReducedMotionSafe()
  const [home, products] = project.assets.images

  return (
    <div
      className={styles.page}
      style={{ '--pb-ink': '#7a4632', '--pb-ink-2': '#6b4f43', '--pb-ink-3': '#7d5f52', '--pb-line': '#d9bfa8', '--pb-bg': '#fbf4ea', '--pb-accent': project.accent } as CSSProperties}
    >
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>{text.kicker}</p>
          <h1 id={projectTitleId(project.slug)} tabIndex={-1} className={styles.title}>
            <span className={styles.brand}>{brand?.trim()}</span>
            {sub && <span className={styles.sub}>{sub}</span>}
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
          <Browser className={styles.bProducts} src={products!} alt={pick(lang, local.shots.products)} />
          <Browser className={styles.bHome} src={home!} alt={pick(lang, local.shots.home)} />
          <figure className={styles.phone}>
            <img src="/projects/catstore/mobile.webp" alt={pick(lang, local.shots.mobile)} width={390} height={844} loading="eager" decoding="async" />
          </figure>
        </motion.div>
      </section>

      <section className={styles.features} aria-labelledby="catstore-features">
        <div className={styles.featuresInner}>
          <Reveal className={styles.featuresHead}>
            <h2 id="catstore-features" className={styles.h2}>{pick(lang, local.featuresTitle)}</h2>
            <p className={styles.lead}>{pick(lang, local.featuresLead)}</p>
          </Reveal>
          <ol className={styles.featureList}>
            {local.features.map((f, i) => (
              <li key={f.t.es}>
                <Reveal className={styles.feature} delay={Math.min(i, 4) * 0.04}>
                  <span className={styles.num} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.fTitle}>{pick(lang, f.t)}</span>
                  <span className={styles.fDesc}>{pick(lang, f.d)}</span>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.basics}>
        <Reveal className={styles.basicsInner}>
          <div>
            <h2 className={styles.label}>{t.projects.role}</h2>
            <ul className={styles.roles}>
              {text.role.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={styles.label}>{t.projects.stack}</h2>
            <ul className={styles.chips}>
              {project.stack.map((s) => (
                <li key={s} className={styles.chip}>{s}</li>
              ))}
            </ul>
          </div>
          <ProjectLinks project={project} className={styles.endLinks} />
        </Reveal>
      </section>
    </div>
  )
}
