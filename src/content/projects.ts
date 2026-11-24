export type ProjectSlug = 'eclipse-rojo' | 'gym-zong' | 'apigym' | 'imoney' | 'catstore'

export type LinkKind = 'live' | 'demo' | 'repo' | 'play' | 'showcase' | 'instagram'

export interface ProjectLink {
  kind: LinkKind
  href: string
}

export interface Project {
  slug: ProjectSlug
  /** Color principal del proyecto (acento de su carpeta y su vista). */
  accent: string
  /** Segundo color opcional (p. ej. el cian de Eclipse Rojo). */
  accent2?: string
  /** Gradiente sutil de la carpeta. */
  folderGradient: string
  links: ProjectLink[]
  stack: string[]
  team?: string
  /** Rutas públicas bajo /projects/<slug>/. */
  assets: {
    cover: string
    images: string[]
    logo?: string
    /** Solo ApiGym: manifest con los ejercicios y sus frames SVG. */
    manifest?: string
  }
  /** Prefijo de las claves de texto en i18n (src/i18n). */
  i18nKey: string
}

const gymZongScreens = [1, 2, 3, 4, 5, 6].map(
  (n) => `/projects/gym-zong/screen-0${n}.webp`,
)

const imoneyScreens = [1, 2, 3, 4, 5, 6].map(
  (n) => `/projects/imoney/screen-0${n}.webp`,
)

export const projects: Project[] = [
  {
    slug: 'eclipse-rojo',
    accent: '#C1440E',
    accent2: '#2FB8D6',
    folderGradient: 'linear-gradient(160deg, #E0875A 0%, #C1440E 55%, #8E2F08 100%)',
    links: [
      { kind: 'play', href: 'https://pholis07.github.io/OperacionEclipseRojo/' },
      { kind: 'repo', href: 'https://github.com/Pholis07/OperacionEclipseRojo' },
      { kind: 'instagram', href: 'https://www.instagram.com/p/DgD1vnxmE5P/' },
    ],
    stack: ['Unity', 'C#', 'WebGL'],
    team: 'DualDynamics',
    assets: {
      cover: '/projects/eclipse-rojo/menu.webp',
      images: ['/projects/eclipse-rojo/menu.webp'],
    },
    i18nKey: 'eclipseRojo',
  },
  {
    slug: 'gym-zong',
    accent: '#3DD9B8',
    accent2: '#F2A65A',
    folderGradient: 'linear-gradient(160deg, #8FEAD3 0%, #3DD9B8 55%, #1FA98C 100%)',
    links: [{ kind: 'showcase', href: 'https://github.com/ARIOT117/Gym-Zong-showcase' }],
    stack: ['Expo', 'React Native', 'TypeScript', 'SQLite'],
    assets: {
      cover: gymZongScreens[0] ?? '/projects/gym-zong/screen-01.webp',
      images: gymZongScreens,
      logo: '/projects/gym-zong/logo.svg',
    },
    i18nKey: 'gymZong',
  },
  {
    slug: 'apigym',
    accent: '#3DD9B8',
    accent2: '#0B1B20',
    folderGradient: 'linear-gradient(160deg, #2A4750 0%, #12272D 55%, #0B1B20 100%)',
    links: [
      { kind: 'live', href: 'https://apigym-production-b297.up.railway.app/' },
      { kind: 'repo', href: 'https://github.com/5-5DE/ApiGym' },
    ],
    stack: ['Node.js', 'JavaScript', 'SVG'],
    team: '5-5DE',
    assets: {
      // Los ids de ejercicio salen del manifest; frames: /projects/apigym/<id>/frame-00.svg..frame-02.svg
      cover: '/projects/apigym/manifest.json',
      images: [],
      manifest: '/projects/apigym/manifest.json',
    },
    i18nKey: 'apigym',
  },
  {
    slug: 'imoney',
    accent: '#FF8A3D',
    accent2: '#111112',
    folderGradient: 'linear-gradient(160deg, #4A3223 0%, #231B16 55%, #111112 100%)',
    // El repositorio es privado: solo se enlaza la demo web pública.
    links: [{ kind: 'demo', href: 'https://imoney-demo.vercel.app' }],
    stack: ['React Native', 'Expo', 'Node.js', 'Express', 'Firestore'],
    assets: {
      cover: imoneyScreens[0] ?? '/projects/imoney/screen-01.webp',
      images: imoneyScreens,
      logo: '/projects/imoney/ajolote-perfil.webp',
    },
    i18nKey: 'imoney',
  },
  {
    slug: 'catstore',
    accent: '#C98A4B',
    folderGradient: 'linear-gradient(160deg, #EBC48F 0%, #C98A4B 55%, #9A6530 100%)',
    links: [
      { kind: 'live', href: 'https://web-production-1899fab5.up.railway.app/' },
      { kind: 'repo', href: 'https://github.com/ARIOT117/CATSTORE' },
    ],
    stack: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript'],
    assets: {
      cover: '/projects/catstore/home.webp',
      images: [
        '/projects/catstore/home.webp',
        '/projects/catstore/menu.webp',
        '/projects/catstore/tiendita.webp',
        '/projects/catstore/mobile.webp',
      ],
    },
    i18nKey: 'catstore',
  },
]

export const getProject = (slug: string | undefined): Project | undefined =>
  projects.find((p) => p.slug === slug)

/** Colores del kit de marca de Gym Zong, para su layout. */
export const gymZongKit = {
  background: '#FAF8F4',
  text: '#0F2E36',
  primary: '#3DD9B8',
  accentText: '#0B7A66',
  chartStreak: '#F2A65A',
} as const

/** Kit de marca de iMoney («cuaderno oscuro»), tomado de los tokens de la app. */
export const imoneyKit = {
  background: '#111112',
  surface: '#19191A',
  surfaceMuted: '#232324',
  text: '#F3F1EE',
  textSecondary: '#A29E98',
  primary: '#FF8A3D',
  border: '#2A2927',
  income: '#6FD39A',
} as const
