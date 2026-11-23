import { useEffect, useRef, useState } from 'react'
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, WHATSAPP_NUMBER } from '../../content/contact'
import { useT } from '../../i18n/context'
import styles from './Contact.module.css'

const WHATSAPP_TEXT = {
  es: 'Hola Diego, vi tu portafolio y me gustaría platicar contigo.',
  en: "Hi Diego, I saw your portfolio and I'd like to talk.",
}
const WHATSAPP_LABEL = { es: 'WhatsApp', en: 'WhatsApp' }

const whatsappGlyph = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 13.5 3.4 10.6A5.6 5.6 0 1 1 5.4 12.6L2.5 13.5Z" />
  </svg>
)

const arrow = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
)

export default function Contact() {
  const { t, lang } = useT()
  const hasEmail = CONTACT_EMAIL !== ''
  const hasWhatsapp = WHATSAPP_NUMBER !== ''
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
    } catch {
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2400)
  }

  return (
    <section id="contacto" className={styles.root} aria-labelledby="contacto-titulo">
      <div className={styles.inner}>
        <h2 id="contacto-titulo" className={styles.title}>{t.contact.title}</h2>
        <p className={styles.lead}>{hasEmail ? t.contact.leadEmail : t.contact.leadLinkedin}</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            {t.contact.linkedin}
            {arrow}
          </a>
          <a className={styles.secondary} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            {t.contact.github}
            {arrow}
          </a>
          {hasWhatsapp && (
            <a
              className={styles.secondary}
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT[lang])}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {whatsappGlyph}
              {WHATSAPP_LABEL[lang]}
            </a>
          )}
          {hasEmail && (
            <>
              <button type="button" className={styles.secondary} onClick={copy}>
                {t.contact.copyEmail}
              </button>
              <a className={styles.secondary} href={`mailto:${CONTACT_EMAIL}`}>
                {t.contact.sendEmail}
              </a>
            </>
          )}
        </div>
        <p className={styles.status} role="status" aria-live="polite">
          {copied ? t.contact.copied : ''}
        </p>
      </div>
    </section>
  )
}
