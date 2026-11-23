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
    role: 'Desarrollador full-stack, con foco en bases de datos e integración de IA.',
    about:
      'Estudiante de desarrollo de software. Disponible para empleo y proyectos freelance.',
    location: 'Chihuahua, México',
    ctaProjects: 'Ver proyectos',
    ctaContact: 'Contacto',
  },
  projects: {
    title: 'Proyectos',
    intro: 'Una selección de lo que he construido, de juegos a APIs.',
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
    showcase: 'Ver la app',
    next: 'Siguiente proyecto',
    publication: 'Publicación',
    privateRepo: 'Repositorio privado',
    notFound: 'No encontré ese proyecto.',
    externalLink: 'Se abre en una pestaña nueva',
  },
  contact: {
    title: 'Hablemos',
    leadLinkedin: 'Busco empleo y proyectos freelance. Escríbeme por LinkedIn.',
    leadEmail: 'Busco empleo y proyectos freelance. Escríbeme.',
    copyEmail: 'Copiar correo',
    copied: 'Correo copiado',
    sendEmail: 'Escribir por correo',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
  footer: {
    copyright: '© 2026 Diego Esparza · ARIOT117',
    built: 'Hecho con React, TypeScript y Motion',
  },
  eclipseRojo: {
    name: 'Operación Eclipse Rojo',
    kicker: 'Juego de diseño de misiones a Marte, hecho en Unity',
    summary:
      'Juego para un jugador hecho en Unity para el NASA Space Apps Challenge 2026, reto Space Mission Design Game, con el equipo DualDynamics. Diseñas una misión a Marte, operas la nave y escaneas el planeta en busca de una anomalía térmica durante una tormenta de polvo. Se juega en el navegador.',
    role: [
      'Diseñé y programé las mecánicas del juego',
      'Hice el diseño visual',
      'Construí la interfaz y el HUD',
    ],
    highlights: [
      'Diseñas la misión: órbita, lanzador e instrumentos, dentro de límites de masa, potencia, costo y espacios.',
      'Operas la nave y escaneas Marte durante una tormenta de polvo.',
      'Al terminar recibes un informe de la misión. Corre en el navegador con WebGL.',
    ],
    award: '1er lugar local · NASA Space Apps 2026',
    awardSub: 'Etapa global: resultado pendiente',
  },
  gymZong: {
    name: 'Gym Zong',
    kicker: 'App Android de rutinas de fuerza, sin conexión',
    summary:
      'Abres la app, sabes qué toca, registras el entrenamiento y ves tu progreso. Está en español y funciona sin conexión con SQLite, así que entrenas aunque no tengas señal. Tiene rachas con congelaciones, estadísticas, calendario e historial.',
    role: [
      'Definí el producto',
      'Diseñé la app: pantallas e identidad visual',
      'Programé la app completa con Expo y React Native',
    ],
    credits:
      'Proyecto mío de principio a fin. Ideas, QA y propuestas de diseño: Irvin Chavez y Diego Soto.',
    highlights: [
      'Funciona sin conexión: tus datos viven en el teléfono con SQLite.',
      'Rachas con congelaciones, estadísticas, calendario e historial.',
      'Hecha con Expo, React Native y TypeScript.',
    ],
  },
  apigym: {
    name: 'ApiGym',
    kicker: 'Biblioteca de movimiento',
    summary:
      'La biblioteca de ejercicios detrás de Gym Zong, ya en línea: 1,257 ejercicios con imágenes y animaciones SVG, filtros por músculo, equipo y familia, y una API pública de lectura documentada.',
    role: [
      'Escribí las instrucciones de cómo construirla',
      'Generé los SVG animados',
      'Redacté la información de los ejercicios',
    ],
    highlights: [
      'En línea: 1,257 ejercicios con imágenes y animaciones SVG.',
      'API pública de lectura, documentada, sin llave para consultar.',
      'Filtros por músculo, equipo y familia.',
    ],
    ui: {
      countLabel: 'ejercicios',
      explorerTitle: 'Un ejercicio, tres cuadros',
      explorerLead: 'Cada ejercicio es una animación SVG de tres cuadros en bucle. Estos ocho vienen del catálogo.',
      explorerList: 'Ejercicios de muestra',
      explorerMeta: 'id · cuadros SVG · bucle',
      frames: 'cuadros',
      apiTitle: 'La API',
      apiLead: 'Lectura abierta bajo /api/v1. Esta es una respuesta real, recortada.',
      apiCaption: 'Respuesta recortada: se muestra 1 de 2 ejercicios y solo algunos campos.',
      apiDocs: 'Ver la documentación',
      factKey: 'Sin llave',
      factKeyBody: 'Los GET no piden API key.',
      factPage: 'Paginación',
      factPageBody: 'limit y offset; la respuesta trae total y nextOffset.',
      fact404: 'Errores claros',
      fact404Body: 'Un id inexistente responde 404 con error.code y error.message.',
      siteTitle: 'El sitio, en línea',
      siteLead: 'Inicio, catálogo con filtros y ficha de un ejercicio.',
      shots: ['Inicio', 'Catálogo', 'Ficha'],
      shotAlts: [
        'Página de inicio de ApiGym, Biblioteca de movimiento.',
        'Catálogo de ApiGym con filtros por músculo, equipo y familia.',
        'Ficha de un ejercicio en ApiGym con su animación.',
      ],
      showShot: 'Mostrar captura',
    },
  },
  catstore: {
    name: 'CATSTORE · Snacks and Cats',
    kicker: 'Sitio de una cafetería gatuna en Chihuahua',
    summary:
      'Sitio en PHP de una cafetería gatuna en Chihuahua. Tiene menú, ubicación y una tienda de demostración con cuentas, carrito persistente y pedidos. Cada cuenta puede subir una foto de perfil privada. Está en línea en Railway.',
    role: ['Desarrollo full-stack', 'Base de datos'],
    highlights: [
      'Menú, ubicación y tienda de demostración.',
      'Cuentas, carrito persistente y pedidos.',
      'Foto de perfil privada. PHP y MySQL, en línea en Railway.',
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
