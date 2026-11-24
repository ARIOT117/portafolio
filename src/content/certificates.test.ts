import { en } from '../i18n/en'
import { es } from '../i18n/es'
import { certificates } from './certificates'

/** Archivos reales en public/certificates (Vite resuelve el glob en la prueba). */
const publicFiles = Object.keys(import.meta.glob('/public/certificates/*'))

describe('certificates', () => {
  it('tiene Space Apps e Innovathon, en ese orden', () => {
    expect(certificates.map((c) => c.slug)).toEqual(['space-apps', 'innovathon'])
  })

  it('cada constancia tiene su imagen en public/ y texto en ambos idiomas', () => {
    for (const c of certificates) {
      expect(publicFiles).toContain(`/public${c.image}`)
      for (const dict of [es, en]) {
        const text = dict.certificates[c.i18nKey]
        expect(text.event.length).toBeGreaterThan(0)
        expect(text.did.length).toBeGreaterThanOrEqual(3)
        expect(text.alt.length).toBeGreaterThan(0)
        expect(text.kind.length).toBeGreaterThan(0)
      }
    }
  })

  it('solo Space Apps tiene distinción', () => {
    expect(es.certificates.spaceApps.distinction).toBe('1er lugar local')
    expect(en.certificates.spaceApps.distinction).toBe('1st place locally')
    expect(es.certificates.innovathon.distinction).toBe('')
    expect(en.certificates.innovathon.distinction).toBe('')
  })

  it('las imágenes de las hojas existen en public/', () => {
    for (const c of certificates) {
      if (c.projectImage) expect(Object.keys(import.meta.glob('/public/projects/eclipse-rojo/*'))).toContain(`/public${c.projectImage}`)
    }
  })

  it('los enlaces son https o un caso interno del portafolio', () => {
    for (const c of certificates) {
      expect(c.links.length).toBeGreaterThan(0)
      for (const l of c.links) expect(l.href).toMatch(l.kind === 'case' ? /^\/p\/[a-z-]+$/ : /^https:\/\//)
    }
  })
})
