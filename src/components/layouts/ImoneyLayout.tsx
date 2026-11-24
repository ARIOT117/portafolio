import '@fontsource-variable/figtree'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import { useInView } from 'motion/react'
import { useRef, type CSSProperties } from 'react'
import { imoneyKit, type Project } from '../../content/projects'
import { useProjectText } from '../../content/useProjectText'
import { useT } from '../../i18n/context'
import { useReducedMotionSafe } from '../../styles/motion'
import { Build, ScrollScene } from '../motion/ScrollScene'
import { ProjectClosing, ProjectLinks, projectTitleId } from './ProjectBasics'
import styles from './ImoneyLayout.module.css'

interface Ui {
  context: string
  privateNote: string
  shotsLabel: string
  shotsTitle: string
  shotsLead: string
  shotAlts: string[]
  shots: string[]
  ticketTitle: string
  ticketLead: string
  ticketSteps: string[]
  ticketCaption: string
  ticketMerchant: string
  ticketItems: string[]
  ticketTotal: string
  reviewTag: string
  reviewEdit: string
  reviewCategory: string
  reviewSave: string
  reviewSaved: string
  featuresTitle: string
  featuresLead: string
  features: { title: string; text: string }[]
}

/** Importes del ticket de ejemplo (centavos de la suma: 60.00 + 17.50 + 10.00 = 87.50). */
const PRICES = ['60.00', '17.50', '10.00']

/** El mes como una línea de días: una barra por día; la 23.ª es «hoy». Alturas en rem. */
const DAYS = [3, 5, 4, 9, 4, 3, 6, 5, 11, 4, 3, 5, 7, 4, 6, 3, 10, 5, 4, 6, 8, 5, 14, 0, 0, 0, 0, 0, 0, 0]

function DaysLine() {
  return (
    <Build className={styles.days} aria-hidden>
      {DAYS.map((h, i) => (
        <span
          key={i}
          className={styles.day}
          data-today={i === 22 || undefined}
          data-future={h === 0 || undefined}
          style={{ '--h': `${(h || 2) * 0.16}rem` } as CSSProperties}
        />
      ))}
    </Build>
  )
}

function Phone({ src, alt, eager, width, height }: { src: string; alt: string; eager?: boolean; width: number; height: number }) {
  return (
    <div className={styles.phone}>
      <div className={styles.screen}>
        <img src={src} width={width} height={height} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} />
      </div>
    </div>
  )
}

/** Ticket que se imprime y se vuelve un movimiento revisado. Se mueve solo mientras está a la vista. */
function ReceiptMoment({ ui }: { ui: Ui }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotionSafe()
  const inView = useInView(ref, { amount: 0.35 })
  const playing = inView && !reduced
  return (
    <div ref={ref} className={styles.moment} data-playing={playing || undefined}>
      <div className={styles.slot} aria-hidden>
        <div className={styles.paper}>
          <p className={styles.shop}>{ui.ticketMerchant}</p>
          {ui.ticketItems.map((item, i) => (
            <p key={item} className={styles.row}>
              <span>{item}</span>
              <span>{PRICES[i]}</span>
            </p>
          ))}
          <p className={`${styles.row} ${styles.total}`}>
            <span>{ui.ticketTotal}</span>
            <span>87.50</span>
          </p>
        </div>
      </div>

      <svg className={styles.arrow} viewBox="0 0 48 16" aria-hidden>
        <path d="M0 8h44M38 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className={styles.entry} aria-hidden>
        <div className={styles.entryHead}>
          <span className={styles.entryName}>Abarrotes La Esquina</span>
          <span className={styles.status}>
            <span className={styles.reviewTag}>{ui.reviewTag}</span>
            <span className={styles.savedTag}>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3.5 8.5 3 3 6-7" />
              </svg>
              {ui.reviewSaved}
            </span>
          </span>
        </div>
        <p className={styles.entryAmount}>$ 87.50</p>
        <div className={styles.fields}>
          <span className={styles.field}>{ui.reviewCategory}</span>
          <span className={styles.fieldHint}>{ui.reviewEdit}</span>
        </div>
        <span className={styles.save}>{ui.reviewSave}</span>
      </div>
    </div>
  )
}

export default function ImoneyLayout({ project }: { project: Project }) {
  const { t } = useT()
  const text = useProjectText(project)
  const ui = (t as unknown as { imoney: { ui: Ui } }).imoney.ui
  const [first, ...rest] = project.assets.images

  return (
    <div
      className={styles.root}
      style={
        {
          '--im-bg': imoneyKit.background,
          '--im-surface': imoneyKit.surface,
          '--im-muted': imoneyKit.surfaceMuted,
          '--im-ink': imoneyKit.text,
          '--im-ink-2': imoneyKit.textSecondary,
          '--im-accent': imoneyKit.primary,
          '--im-line': imoneyKit.border,
          '--im-income': imoneyKit.income,
        } as CSSProperties
      }
    >
      <ScrollScene as="header" className={styles.hero}>
        <div className={styles.heroText}>
          <Build as="p" className={styles.kicker}>
            {project.assets.logo && (
              <img src={project.assets.logo} alt="" width={480} height={408} className={styles.logo} />
            )}
            <span>{text.kicker}</span>
          </Build>
          <Build as="h1" i={1} id={projectTitleId(project.slug)} tabIndex={-1} className={styles.title}>
            {text.name}
          </Build>
          <Build as="p" i={2} className={styles.summary}>{text.summary}</Build>
          <ProjectLinks project={project} className={styles.links} build={3} />
          <Build as="p" i={4} className={styles.note}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            {t.projects.privateRepo} · {ui.privateNote}
          </Build>
          <Build as="p" i={5} className={styles.context}>{ui.context}</Build>
        </div>
        {first && (
          <Build i={2} className={styles.heroPhone}>
            <div className={styles.float}>
              <Phone src={first} alt={ui.shotAlts[0] ?? ''} eager width={585} height={1266} />
            </div>
          </Build>
        )}
      </ScrollScene>

      <ScrollScene as="div" className={styles.band}>
        <DaysLine />
      </ScrollScene>

      <ScrollScene as="section" className={styles.block} aria-labelledby="im-shots">
        <Build as="h2" id="im-shots" className={styles.h2}>{ui.shotsTitle}</Build>
        <Build as="p" i={1} className={styles.lead}>{ui.shotsLead}</Build>
        <Build i={2}>
          <ul className={styles.gallery} tabIndex={0} aria-label={ui.shotsLabel}>
            {[first, ...rest].map((src, i) =>
              src ? (
                <li key={src} className={styles.shot}>
                  <figure>
                    <Phone src={src} alt={ui.shotAlts[i] ?? ''} eager={i < 2} width={585} height={1266} />
                    <figcaption className={styles.caption}>
                      <span className={styles.num} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                      {ui.shots[i]}
                    </figcaption>
                  </figure>
                </li>
              ) : null,
            )}
          </ul>
        </Build>
      </ScrollScene>

      <ScrollScene as="section" className={styles.block} aria-labelledby="im-ticket">
        <Build as="h2" id="im-ticket" className={styles.h2}>{ui.ticketTitle}</Build>
        <Build as="p" i={1} className={styles.lead}>{ui.ticketLead}</Build>
        <ol className={styles.steps}>
          {ui.ticketSteps.map((s, i) => (
            <Build as="li" key={s} i={i} className={styles.step}>
              <span className={styles.num} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              {s}
            </Build>
          ))}
        </ol>
        <Build i={2}>
          <ReceiptMoment ui={ui} />
          <p className={styles.fine}>{ui.ticketCaption}</p>
        </Build>
      </ScrollScene>

      <ScrollScene as="section" className={styles.block} aria-labelledby="im-features">
        <Build as="h2" id="im-features" className={styles.h2}>{ui.featuresTitle}</Build>
        <Build as="p" i={1} className={styles.lead}>{ui.featuresLead}</Build>
        <ol className={styles.features}>
          {ui.features.map((f, i) => (
            <Build as="li" key={f.title} i={i % 2} className={styles.feature}>
              <span className={styles.featureNum} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureText}>{f.text}</p>
            </Build>
          ))}
        </ol>
      </ScrollScene>

      <ScrollScene as="section" className={styles.block} aria-labelledby={`${project.slug}-role`}>
        <div className={styles.cols}>
          <Build>
            <h2 id={`${project.slug}-role`} className={styles.label}>{t.projects.role}</h2>
            <ul className={styles.list}>
              {text.role.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Build>
          <Build i={1}>
            <h2 id={`${project.slug}-stack`} className={styles.label}>{t.projects.stack}</h2>
            <ul className={styles.stack}>
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Build>
        </div>
        {text.credits && <Build as="p" i={2} className={styles.credits}>{text.credits}</Build>}
      </ScrollScene>

      <section className={styles.block}>
        <ProjectClosing project={project} linksClassName={styles.links} />
      </section>
    </div>
  )
}
