/** Diccionario en español: fuente de verdad. `en.ts` debe cubrir las mismas claves. */
export const es = {
  meta: {
    title: 'Diego Esparza (ARIOT117) · Desarrollador full-stack',
    description:
      'Portafolio de Diego Esparza, desarrollador full-stack en Chihuahua, México. Bases de datos e integración de IA.',
  },
  nav: {
    brand: 'ARIOT117',
    projects: 'Proyectos',
    contact: 'Contacto',
    language: 'Idioma',
    langEs: 'ES',
    langEn: 'EN',
    langEsLabel: 'Español',
    langEnLabel: 'English',
    home: 'Ir al inicio',
  },
  intro: {
    skip: 'Saltar',
    skipLabel: 'Saltar la animación de entrada',
  },
  hero: {
    greeting: 'Hola, soy',
    name: 'Diego Esparza',
    role: 'Desarrollador full-stack. Fuerte en bases de datos e integración de IA.',
    about:
      'Estudio desarrollo de software y trabajo en empleo y con clientes freelance.',
    location: 'Chihuahua, México',
    ctaProjects: 'Ver proyectos',
    ctaContact: 'Contacto',
  },
  projects: {
    title: 'Proyectos',
    intro: 'Cuatro proyectos en los que participé.',
    open: 'Abrir',
    close: 'Cerrar',
    back: 'Volver',
    backLabel: 'Volver a los proyectos',
    role: 'Mi rol',
    stack: 'Stack',
    highlights: 'Lo esencial',
    team: 'Equipo',
    viewSite: 'Ver sitio',
    viewRepo: 'Ver repositorio',
    play: 'Jugar',
    showcase: 'Vitrina',
    publication: 'Publicación',
    privateRepo: 'Repositorio privado',
    notFound: 'No encontré ese proyecto.',
    externalLink: 'Se abre en una pestaña nueva',
  },
  contact: {
    title: 'Contacto',
    lead: 'Si tienes un proyecto o una vacante, escríbeme.',
    email: 'Correo',
    copyEmail: 'Copiar correo',
    copied: 'Copiado',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
  footer: {
    rights: 'Diego Esparza (ARIOT117)',
    built: 'Hecho con Vite, React y Motion',
    top: 'Volver arriba',
  },
  eclipseRojo: {
    name: 'Operación Eclipse Rojo',
    kicker: 'Juego de diseño de misiones a Marte, hecho en Unity',
    summary:
      'Juego para un jugador hecho en Unity para el NASA Space Apps Challenge 2026, reto Space Mission Design Game, con el equipo DualDynamics. Diseñas una misión a Marte, operas la nave y escaneas el planeta en busca de una anomalía térmica durante una tormenta de polvo. Se juega en el navegador.',
    role: ['Mecánicas de juego', 'Diseño', 'Interfaz'],
    highlights: [
      'Diseñas la misión: órbita, lanzador e instrumentos, dentro de límites de masa, potencia, costo y espacios.',
      'Operas la nave y escaneas Marte durante una tormenta de polvo.',
      'Al terminar recibes un informe de la misión. Corre en el navegador con WebGL.',
    ],
    award: '1er lugar local · NASA Space Apps 2026',
    awardSub: 'En competencia global',
  },
  gymZong: {
    name: 'Gym Zong',
    kicker: 'App Android de rutinas de fuerza, sin conexión',
    summary:
      'Abres la app, sabes qué toca, registras el entrenamiento y ves tu progreso. Está en español y funciona sin conexión con SQLite. Tiene rachas con congelaciones, estadísticas, calendario e historial. Tiene identidad propia: una flor, blanco cálido y menta.',
    role: ['Producto', 'Diseño', 'Desarrollo'],
    highlights: [
      'Funciona sin conexión: tus datos viven en el teléfono con SQLite.',
      'Rachas con congelaciones, estadísticas, calendario e historial.',
      'Hecha con Expo, React Native y TypeScript.',
    ],
  },
  apigym: {
    name: 'ApiGym',
    kicker: 'API de 1,257 ejercicios con animaciones SVG',
    summary:
      'API de ejercicios en español con 1,257 entradas, cada una con animaciones SVG. Se filtra y trae metadatos como dificultad, mecánica, fuerza y equipo. Es un proyecto del equipo 5-5DE.',
    role: [
      'Escribí las instrucciones de cómo construirla',
      'Generé los SVG animados',
      'Redacté la información de los ejercicios',
    ],
    highlights: [
      '1,257 ejercicios, todos con animación SVG.',
      'Información en español, con filtros.',
      'Metadatos de dificultad, mecánica, fuerza y equipo.',
    ],
  },
  catstore: {
    name: 'CATSTORE · Snacks and Cats',
    kicker: 'Sitio de una cafetería gatuna en Chihuahua',
    summary:
      'Sitio en PHP de una cafetería gatuna en Chihuahua. Tiene menú, ubicación y una tienda de demostración con cuentas, carrito persistente y pedidos. Cada cuenta puede subir una foto de perfil privada. Está en línea en Vercel.',
    role: ['Desarrollo full-stack', 'Base de datos'],
    highlights: [
      'Menú, ubicación y tienda de demostración.',
      'Cuentas, carrito persistente y pedidos.',
      'Foto de perfil privada. PHP y MySQL, en línea en Vercel.',
    ],
  },
} as const

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T

export type Dict = Widen<typeof es>
