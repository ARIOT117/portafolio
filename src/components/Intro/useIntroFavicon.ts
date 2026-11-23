import { useEffect } from 'react'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@*/<>'
const STEP_MS = 330

/** Favicon de un glifo al azar: mismo cuadrado azul de la marca. */
const glyphIcon = (g: string): string =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2a479a"/><text x="32" y="48" font-family="monospace" font-size="42" font-weight="800" text-anchor="middle" fill="#f8f6f1">${g
      .replace('&', '&amp;')
      .replace('<', '&lt;')
      .replace('>', '&gt;')}</text></svg>`,
  )

/**
 * Mientras suena la intro, el favicon cicla glifos al azar (eco del decode) y
 * al final vuelve al icono real. No hace nada si la intro no está activa.
 */
export function useIntroFavicon(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) return
    const original = link.getAttribute('href') ?? '/favicon.svg'
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      if (n > 4) {
        window.clearInterval(id)
        link.setAttribute('href', original)
        return
      }
      link.setAttribute('href', glyphIcon(GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length))))
    }, STEP_MS)
    return () => {
      window.clearInterval(id)
      link.setAttribute('href', original)
    }
  }, [active])
}
