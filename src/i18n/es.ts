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
    viewDemo: 'Ver demo',
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
    leadWhatsapp: 'Busco empleo y proyectos freelance. Escríbeme por WhatsApp o LinkedIn.',
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
      'Programé las animaciones SVG de los ejercicios',
      'Traduje todo el contenido',
      'Colaboré en gran parte de la API',
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
  imoney: {
    name: 'iMoney',
    kicker: 'Finanzas personales para estudiantes',
    summary:
      'App de finanzas personales para estudiantes universitarios en México, pensada para quincenas, efectivo y tarjeta, y tickets en papel. Registras gastos e ingresos en pesos, lees tus tickets con la cámara, y la IA propone los datos para que tú los revises antes de guardar. Funciona en modo claro, oscuro o el del sistema.',
    role: [
      'Programé la lectura de tickets con IA, con revisión antes de guardar',
      'Programé los gastos hormiga, el alcance del dinero, los cambios de precio y dividir cuentas',
    ],
    credits:
      'Equipo: Adrian Robles, Jesús Castellanos y Diego Esparza',
    highlights: [
      'Lee tus tickets con la cámara: la IA propone y tú revisas antes de guardar.',
      'Gastos hormiga, meta de ahorro y cuánto dinero te queda en el mes.',
      'Compromisos recurrentes, cambios de precio y cuentas divididas.',
    ],
    ui: {
      context: 'Proyecto Integrador I · UTCH · Concurso «Juntos por tu Futuro» 2026',
      privateNote: 'demo web pública',
      shotsLabel: 'Capturas de la demo',
      shotsTitle: 'La demo, pantalla por pantalla',
      shotsLead: 'Capturas de la demo web pública, con datos de ejemplo. La app móvil es la misma idea en el teléfono.',
      shotAlts: [
        'iMoney, inicio: saldo registrado, efectivo y tarjeta, y la gráfica de gastos del mes.',
        'iMoney, añadir gasto: importe, descripción y categoría sugerida por la IA.',
        'iMoney, revisar ticket: comercio, fecha, total y productos leídos.',
        'iMoney, dividir cuenta: asignar cada producto y ver cuánto te deben.',
        'iMoney, aviso de gastos hormiga y pagos pendientes del mes.',
        'iMoney, cartera: meta de ahorro y lo ahorrado hasta hoy.',
      ],
      shots: ['Inicio', 'Añadir gasto', 'Revisar ticket', 'Dividir cuenta', 'Gastos hormiga', 'Meta de ahorro'],
      pause: 'Pausar las pantallas',
      play: 'Reanudar las pantallas',
      screen: 'Pantalla',
      ticketTitle: 'La IA propone, tú decides',
      ticketLead: 'Fotografías el ticket y la IA lee comercio, fecha y productos. Nada se guarda hasta que lo revisas y lo confirmas.',
      ticketSteps: ['El ticket se imprime', 'La IA lo lee', 'Tú lo revisas', 'Se guarda'],
      ticketCaption: 'Ejemplo ilustrativo: el ticket y el movimiento no son datos reales.',
      ticketMerchant: 'ABARROTES LA ESQUINA',
      ticketItems: ['Tacos de asada x3', 'Agua de horchata', 'Refresco'],
      ticketTotal: 'TOTAL',
      reviewTag: 'Por revisar',
      reviewEdit: 'Corrige lo que haga falta',
      reviewCategory: 'Comida',
      reviewSave: 'Guardar gasto',
      reviewSaved: 'Guardado',
      featuresTitle: 'Lo que programé',
      featuresLead: 'Las partes que construí en iMoney, con el dinero de un estudiante en mente.',
      features: [
        { title: 'Gastos hormiga', text: 'Encuentra los gastos chicos que se repiten (café, camión, botanas) en los últimos 30 días y te dice cuánto suman.' },
        { title: 'Alcance del dinero', text: 'Calcula hasta qué día te alcanza el saldo al ritmo de tus gastos recientes y lo compara con lo que falta del mes.' },
        { title: 'Cambios de precio', text: 'Compara el precio de un mismo producto entre tus tickets y te avisa cuando sube o baja.' },
        { title: 'Dividir cuentas', text: 'Reparte un ticket entre quienes lo comparten y guarda lo que te deben.' },
      ],
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
