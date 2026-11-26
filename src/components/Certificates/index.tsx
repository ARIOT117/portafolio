import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { certificates, type Certificate } from '../../content/certificates'
import { useT } from '../../i18n/context'
import { Build, ScrollScene } from '../motion/ScrollScene'
import CertificateFolder from './CertificateFolder'
import styles from './Certificates.module.css'
import Picture from '../Picture'

const arrow = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
)

function CertificateDialog({ cert, onClose }: { cert: Certificate; onClose: (restoreFocus?: boolean) => void }) {
  const { t } = useT()
  const text = t.certificates[cert.i18nKey]
  const location = useLocation()
  const ref = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const downOnBackdrop = useRef(false)
  const titleId = `cert-${cert.slug}-titulo`

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (!d.open) d.showModal()
    // El foco inicial va en el título, no en el botón de cerrar.
    titleRef.current?.focus({ preventScroll: true })
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prev
      if (d.open) d.close()
    }
  }, [])

  // El fondo solo cierra si el clic empezó también en el fondo (arrastrar una selección hacia fuera no cierra).
  const onBackdropDown = (e: PointerEvent<HTMLDialogElement>) => {
    downOnBackdrop.current = e.target === e.currentTarget
  }
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    const started = downOnBackdrop.current
    downOnBackdrop.current = false
    if (started && e.target === e.currentTarget) onClose()
  }

  // «Ver el caso»: la navegación se queda con el foco; los clics con modificador los resuelve el navegador.
  const onCaseClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    onClose(false)
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      style={{ '--accent': cert.accent } as React.CSSProperties}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onPointerDown={onBackdropDown}
      onClick={onBackdropClick}
    >
      <div className={styles.card}>
        <button type="button" className={styles.close} onClick={() => onClose()} aria-label={t.certificates.close}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <figure className={styles.figure}>
          <Picture
            src={cert.image}
            width={cert.imageW}
            height={cert.imageH}
            sizes="(max-width: 64rem) 100vw, 60rem"
            loading="lazy"
            decoding="async"
            alt={text.alt}
            className={styles.image}
          />
        </figure>
        <div className={styles.body}>
          <div className={styles.dialogHead}>
            <h3 ref={titleRef} id={titleId} tabIndex={-1} className={styles.title}>
              {text.event}
            </h3>
            {text.distinction && <p className={styles.award}>{text.distinction}</p>}
            <p className={styles.org}>
              {text.org} · {text.kind} · {text.date}
            </p>
          </div>
          <div className={styles.meta}>
            <dl className={styles.facts}>
              <div>
                <dt>{t.certificates.project}</dt>
                <dd>{text.project}</dd>
              </div>
              <div>
                <dt>{t.certificates.team}</dt>
                <dd>{cert.team}</dd>
              </div>
            </dl>
            <ul className={styles.links}>
              {cert.links.map((l) => (
                <li key={l.kind}>
                  {l.kind === 'case' ? (
                    <Link to={l.href} state={{ backgroundLocation: location }} className={`${styles.link} ${styles.linkPrimary}`} onClick={onCaseClick}>
                      {t.certificates.links.case}
                    </Link>
                  ) : (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      {t.certificates.links[l.kind]}
                      {arrow}
                      <span className="sr-only"> ({t.projects.externalLink})</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.rest}>
            <p className={styles.summary}>{text.summary}</p>
            <h4 className={styles.subhead}>{t.certificates.whatIDid}</h4>
            <ul className={styles.did}>
              {text.did.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default function Certificates() {
  const { t } = useT()
  const [open, setOpen] = useState<Certificate | null>(null)
  const opener = useRef<HTMLButtonElement | null>(null)

  const close = (restoreFocus = true) => {
    setOpen(null)
    // Devuelve el foco a la carpeta que abrió el diálogo, sin saltar el scroll (salvo al navegar).
    if (restoreFocus) requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }))
  }

  return (
    <ScrollScene as="section" id="constancias" className={styles.root} aria-labelledby="constancias-titulo">
      <div className={styles.inner}>
        <header className={styles.head}>
          <Build as="h2" id="constancias-titulo" className={styles.heading}>
            {t.certificates.title}
          </Build>
          <Build as="p" i={1} className={styles.intro}>
            {t.certificates.intro}
          </Build>
        </header>
        <ul className={styles.row}>
          {certificates.map((c, i) => (
            <Build as="li" i={2 + i} key={c.slug} className={styles.item}>
              <CertificateFolder
                cert={c}
                onOpen={(el) => {
                  opener.current = el
                  setOpen(c)
                }}
              />
            </Build>
          ))}
        </ul>
      </div>
      {open && <CertificateDialog key={open.slug} cert={open} onClose={close} />}
    </ScrollScene>
  )
}
