# Portafolio de Diego Esparza (ARIOT117) + mejora del perfil de GitHub

## Contexto
Diego quiere su primer portafolio para **reclutadores y clientes freelance**. Estilo minimalista premium tipo Apple con animaciones fluidas: una entrada animada con **ARIOT117** que da paso a "Diego Esparza", y después una **carpeta por proyecto**. Al abrirla, la carpeta se transforma en una vista con un layout propio del proyecto y enlaces a la web o al repo. Va en dos idiomas (ES/EN). Después hay que actualizar el perfil de GitHub para que apunte al portafolio y muestre estos proyectos.

`~/Escritorio/Proyectos/Portafolio` está vacío y todavía no es un repositorio git.

## Decisiones tomadas
- **Stack (lo eligió Diego):** Vite + React + TypeScript (strict) + Motion (`motion/react`) + React Router. Deploy en Vercel.
- **Idioma:** ES + EN con selector. Por defecto se usa el idioma del navegador y la elección se guarda en localStorage.
- **Contacto:** correo y LinkedIn, más el GitHub. **Faltan los datos**, así que van con marcadores hasta que Diego los dé.
- **Nombre de la intro:** ARIOT117.
- **Proyectos:** se quedan fuera ARIOTIFI ("hasta que lo tenga bien"), ARDANG, Zumek y Mi Linux. Diego solo pidió estos 4:

| Proyecto | Repo | Enlaces | Rol de Diego (en sus palabras) | Material |
|---|---|---|---|---|
| **Operación Eclipse Rojo** | `Pholis07/OperacionEclipseRojo` (C#, Unity) | Jugar: pholis07.github.io/OperacionEclipseRojo · Repo · Post de Instagram del premio | Mecánicas, diseño e interfaz. **1er lugar NASA Space Apps 2026** (equipo DualDynamics) | Dirección de arte en `hakaton space/OperacionEclipseRojo/GUIA-INTERFAZ.md`: rojo marciano para acciones, cian para datos, Rajdhani / Barlow / IBM Plex Mono. Captura de la build en vivo |
| **Gym Zong** | `ARIOT117/Gym-Zong` (privado) → nueva vitrina `ARIOT117/Gym-Zong-showcase` | Vitrina | App Android de rutinas de fuerza, sin conexión (Expo, SQLite) | `~/Gym-Zong-entrega/Kit-de-marca-Gym-Zong/`: 36 capturas, `colores/paleta.json`, logos SVG, Manrope e Inter, guía de marca |
| **ApiGym** | `5-5DE/ApiGym` (JS, de equipo) | Repo | Instrucciones de cómo hacerla, generó los SVG animados y la información. Catálogo de 1,257 ejercicios | SVG de `~/Escritorio/Proyectos/gym-zong-entrega/ApiGym` |
| **CATSTORE / Snacks and Cats** | `ARIOT117/CATSTORE` (PHP) | En vivo: catstore-puce.vercel.app · Repo | Sitio de una cafetería gatuna con menú, tienda, carrito y cuentas | Captura del sitio en vivo |

## Diseño de la experiencia
1. **Intro (~2.5 s, se puede saltar con clic o tecla, solo la primera visita de la sesión).** Fondo casi blanco. "ARIOT117" entra letra por letra, de desenfocado a nítido, mientras se cierra el espaciado entre letras. Luego se encoge y vuela hasta el logo de la barra de navegación (layoutId), y aparece "Diego Esparza". Con `prefers-reduced-motion` se usa solo un fundido.
2. **Hero.** "Hola, soy Diego Esparza", con su rol (Full-stack · bases de datos e integración de IA), Chihuahua, MX, y botones a Proyectos y Contacto. Selector ES/EN en la barra.
3. **Proyectos.** Cuadrícula de 4 carpetas estilo macOS (pestaña, gradiente sutil con el color de cada proyecto). Al pasar el cursor, la tapa se inclina y asoma una hoja con la captura. Al hacer clic, una animación de layout compartido transforma la carpeta en la vista completa del proyecto en `/p/:slug`. Si alguien entra directo a la URL, la vista carga sin la animación. Escape o el botón Atrás la cierran con la animación inversa.
4. **Vistas de proyecto.** Comparten una estructura (título, qué hace, mi rol, stack, enlaces), pero cada una tiene su propio layout:
   - *Eclipse Rojo:* estética HUD oscura en rojo y cian, con su tipografía. Insignia "1er lugar · NASA Space Apps 2026" destacada y botones Jugar, Repo e Instagram.
   - *Gym Zong:* paleta del kit (blanco cálido, cacao, durazno). Carrusel de 5 o 6 mockups de teléfono con las capturas y enlace a la vitrina.
   - *ApiGym:* layout técnico con una cuadrícula de SVG de ejercicios animándose, contador de 1,257 ejercicios y una tarjeta con una respuesta JSON de ejemplo.
   - *CATSTORE:* tono cálido de cafetería, mockup de navegador con capturas, botones Ver sitio y Repo.
5. **Contacto y footer.** Correo (copiar o mailto), LinkedIn y GitHub.

Lo decidí yo y se puede cambiar: CSS Modules + variables CSS (sin Tailwind, para que el código sea fácil de leer), fuente base Geist Variable autoalojada (aspecto tipo Apple), sin librería de i18n (diccionarios tipados). El pulido visual se hace con la skill de diseño **impeccable**.

## Estructura de archivos
- `src/main.tsx`, `src/App.tsx`: router y `AnimatePresence`.
- `src/i18n/{es,en}.ts` + `LangProvider.tsx`: `en` usa el tipo de `es`, así que si falta una clave, TypeScript marca error.
- `src/content/projects.ts`: datos de los 4 proyectos (slug, colores, enlaces, rol, stack, assets). Los textos salen de i18n.
- `src/components/`: `Intro/`, `Nav/`, `Hero/`, `FolderGrid/`, `Folder/`, `ProjectView/`, `Contact/`.
- `src/components/layouts/`: `EclipseRojoLayout.tsx`, `GymZongLayout.tsx`, `ApiGymLayout.tsx`, `CatstoreLayout.tsx`.
- `src/styles/tokens.css`: colores, tipografía, radios, curvas de animación.
- `public/projects/<slug>/`: imágenes optimizadas en webp y SVG.
- `docs/superpowers/specs/2026-11-23-portafolio-design.md`: este diseño, guardado en el repo.

## Pasos
1. `git init`, guardar el spec y crear el proyecto con Vite (`react-ts`, Node 24 ya instalado). Instalar `motion`, `react-router`, `@fontsource-variable/geist`, vitest y testing-library.
2. **Assets:** copiar unas 6 capturas, el logo y la paleta de Gym Zong. Elegir unos 8 SVG de ApiGym. Sacar capturas con Playwright de CATSTORE y Eclipse Rojo en vivo y convertir todo a webp.
3. **Pase de diseño con impeccable:** tokens, escala tipográfica y principios de movimiento (curvas spring, duraciones).
4. Intro → Nav + Hero + selector de idioma → carpetas con la transformación → las 4 vistas → Contacto, meta y OG en ambos idiomas, favicon con las iniciales A117.
5. Responsive (móvil primero en carpetas y vistas), teclado y foco, `prefers-reduced-motion`.
6. **Vitrina de Gym Zong:** preparar en local `Gym-Zong-showcase` (README bilingüe, capturas, kit de marca, sin código). **Se la muestro a Diego antes de crearla en GitHub.**
7. **Deploy:** repo público `ARIOT117/portafolio` y Vercel. **Le confirmo a Diego antes de publicar.**
8. **Perfil de GitHub:** reescribir el README de `ARIOT117/ARIOT117` con el enlace al portafolio, las secciones de Eclipse Rojo (premio), Gym Zong, ApiGym y CATSTORE, y conservar ARDANG, Mi Linux y Zumek. Poner el campo `blog` del perfil con la URL del portafolio y ajustar la bio. **Le muestro el diff antes de hacer push.** Los repos fijados se cambian a mano (no hay API para eso): le digo cuáles fijar.

## Reparto del trabajo (Diego lo pidió así)
Yo (Opus) superviso. Escribo el spec y los encargos de cada agente, reviso cada entrega (leo el diff y reviso las capturas de Playwright) y decido si se acepta o se devuelve con correcciones. Yo no escribo el código ni las pruebas: eso lo hacen subagentes con `Agent` y el parámetro `model`.

| Tarea | Modelo | Cuándo |
|---|---|---|
| Crear el proyecto, tokens y estructura base (paso 1 y tokens del 3) | Sonnet | Primero, uno solo |
| Assets: copiar, convertir a webp y sacar capturas con Playwright (paso 2) | Haiku | Al mismo tiempo que lo anterior |
| Intro + Nav + Hero + i18n | Sonnet | Al terminar la base |
| Carpetas + transformación a la vista (`FolderGrid`, `Folder`, `ProjectView`) | Sonnet | Después de la Intro |
| Los 4 layouts de proyecto | 4 Sonnet en paralelo (cada uno en su archivo) | Cuando `ProjectView` esté listo |
| Contacto, meta, OG, favicon y responsive | Sonnet | Al final |
| Pruebas de Vitest | Sonnet | Al cerrar cada etapa |
| Correr build, tsc y tests, revisar enlaces 404, Lighthouse, recorridos y capturas con Playwright | Haiku | Después de cada etapa, reporta resultados |
| README de la vitrina de Gym Zong y del perfil de GitHub | Sonnet (texto) | Al final, yo reviso antes de mostrárselo a Diego |

Reglas: cada encargo lleva el spec, los archivos que toca y el criterio de aceptado. Nunca hay dos agentes en el mismo archivo. Los subagentes no hacen push, no publican nada y no crean repos en GitHub: las acciones externas las hago yo cuando Diego confirma.

## Verificación
- `npm run build` y `tsc --noEmit` sin errores. Vitest: el idioma persiste, cada proyecto tiene enlaces válidos y en todo `projects.ts` hay assets que existen.
- Playwright (MCP): recorrer la intro, la transformación de las carpetas, abrir y cerrar cada vista, entrar directo a `/p/eclipse-rojo`, cambiar ES/EN y probar en 390 px y 1440 px, con capturas para revisar.
- Probar con reduced motion emulado y navegación solo con teclado.
- Lighthouse en local: rendimiento y accesibilidad de 90 o más.
- Antes del deploy, comprobar que ningún enlace dé 404 (en especial el de la vitrina de Gym Zong).

## Datos confirmados
- LinkedIn: https://www.linkedin.com/in/diego-isai-esparza-barron-56a38a43b/
- Premio: **1er lugar en la sede local** de NASA Space Apps 2026. Diego sigue compitiendo en la fase global. En la insignia: "1er lugar local · NASA Space Apps 2026" y un subtexto "En competencia global". Cuando haya resultado global, se cambia en un solo lugar (`projects.ts` / i18n).

## Pendiente de Diego (no bloquea)
- **Correo:** el botón de correo lee `CONTACT_EMAIL` de `src/content/contact.ts`. Mientras esté vacío, el botón se oculta y quedan LinkedIn y GitHub. El correo personal actual **no** se publica en ningún lado hasta que Diego decida (recomendación: crear un Gmail profesional y reenviarlo al actual).
