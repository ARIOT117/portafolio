import type { ProjectSlug } from './projects'

export type CertificateSlug = 'space-apps' | 'innovathon'

export type CertificateLinkKind = 'team' | 'site' | 'repo' | 'case'

export interface CertificateLink {
  kind: CertificateLinkKind
  /** https:// para enlaces externos; /p/<slug> para el caso dentro del portafolio. */
  href: string
}

export interface Certificate {
  slug: CertificateSlug
  /** Color de la carpeta y de los detalles del diálogo. */
  accent: string
  folderGradient: string
  /** Constancia en /public, con su tamaño real (para reservar el espacio). */
  image: string
  imageW: number
  imageH: number
  team: string
  /** Año del evento (igual en todos los idiomas). */
  year: string
  links: CertificateLink[]
  /** Imagen del proyecto para la segunda hoja de la carpeta (404 px) y cómo encaja en ella. */
  projectImage: string
  projectFit: 'cover' | 'contain'
  /** Logo oficial del evento, recortado cuadrado de la constancia (tercera hoja), y cómo encaja. */
  logo: string
  logoFit: 'cover' | 'contain'
  /** Miniaturas de 88 px (se pintan a 28 px, con margen para pantallas 3x): constancia, proyecto y logo. */
  minis: { cert: string; project: string; logo: string }
  /** Proyecto del portafolio hecho en ese evento, si existe. */
  projectSlug?: ProjectSlug
  /** Clave de texto bajo `certificates` en i18n. */
  i18nKey: 'spaceApps' | 'innovathon'
}

export const certificates: Certificate[] = [
  {
    slug: 'space-apps',
    accent: '#1E3FA8',
    folderGradient: 'linear-gradient(160deg, #3F6BEA 0%, #1E3FA8 55%, #062A91 100%)',
    image: '/certificates/space-apps-2026.webp',
    imageW: 1056,
    imageH: 816,
    team: 'DualDynamics',
    year: '2026',
    links: [
      { kind: 'case', href: '/p/eclipse-rojo' },
      { kind: 'team', href: 'https://www.spaceappschallenge.org/2026/find-a-team/gangbangers/' },
    ],
    projectImage: '/certificates/eclipse-rojo-tile.webp',
    projectFit: 'cover',
    logo: '/certificates/space-apps-logo.webp',
    logoFit: 'cover',
    minis: {
      cert: '/certificates/space-apps-cert-mini.webp',
      project: '/certificates/eclipse-rojo-mini.webp',
      logo: '/certificates/space-apps-logo-mini.webp',
    },
    projectSlug: 'eclipse-rojo',
    i18nKey: 'spaceApps',
  },
  {
    slug: 'innovathon',
    accent: '#2E7D32',
    folderGradient: 'linear-gradient(160deg,#5FA65A 0%,#2E7D32 55%,#1D5523 100%)',
    image: '/certificates/innovathon-2026.webp',
    imageW: 1600,
    imageH: 1132,
    team: 'Gangbangers',
    year: '2026',
    links: [
      { kind: 'repo', href: 'https://github.com/Gangbangers-Evolution/Zumek' },
      { kind: 'site', href: 'https://innovathon.innovacuu.xyz/' },
    ],
    projectImage: '/certificates/zumek-icon.webp',
    projectFit: 'contain',
    logo: '/certificates/innova-logo.webp',
    logoFit: 'contain',
    minis: {
      cert: '/certificates/innovathon-cert-mini.webp',
      project: '/certificates/zumek-mini.webp',
      logo: '/certificates/innova-logo-mini.webp',
    },
    i18nKey: 'innovathon',
  },
]
