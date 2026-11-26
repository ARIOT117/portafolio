import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { Project, ProjectSlug } from '../../content/projects'

type LayoutModule = { default: ComponentType<{ project: Project }> }

/** Importadores de cada layout: un chunk por proyecto, con sus fuentes y su CSS. */
const loaders: Record<ProjectSlug, () => Promise<LayoutModule>> = {
  'eclipse-rojo': () => import('./EclipseRojoLayout'),
  'gym-zong': () => import('./GymZongLayout'),
  apigym: () => import('./ApiGymLayout'),
  imoney: () => import('./ImoneyLayout'),
  catstore: () => import('./CatstoreLayout'),
}

const RELOAD_KEY = 'layout-chunk-reload-at'
const RELOAD_WINDOW_MS = 30_000

/**
 * Tras un deploy nuevo, una pestaña abierta pide chunks con hash viejo que ya no existen.
 * Se recarga la página una vez (como mucho cada 30 s) para traer el index nuevo; si no se
 * puede o ya se intentó, el error llega al LayoutErrorBoundary del diálogo.
 */
function lazyLayout(load: () => Promise<LayoutModule>) {
  return lazy(() =>
    load().catch((err: unknown) => {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
        if (Date.now() - last > RELOAD_WINDOW_MS) {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
          window.location.reload()
          return new Promise<LayoutModule>(() => {})
        }
      } catch {
        // sessionStorage bloqueado: sin recarga automática
      }
      throw err
    }),
  )
}

/** Layout de cada proyecto (carga diferida). Cada archivo exporta un componente por defecto. */
export const layouts: Record<ProjectSlug, LazyExoticComponent<ComponentType<{ project: Project }>>> = {
  'eclipse-rojo': lazyLayout(loaders['eclipse-rojo']),
  'gym-zong': lazyLayout(loaders['gym-zong']),
  apigym: lazyLayout(loaders.apigym),
  imoney: lazyLayout(loaders.imoney),
  catstore: lazyLayout(loaders.catstore),
}

/** Empieza a descargar el layout de un proyecto (el import() se comparte con lazy). */
export function preloadLayout(slug: string): void {
  if (slug in loaders) void loaders[slug as ProjectSlug]().catch(() => undefined)
}

/** Descarga todos los layouts cuando el navegador está ocioso. */
export function preloadAllLayouts(): void {
  // Con ahorro de datos solo se descarga el layout que se abre.
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (conn?.saveData) return
  const run = () => (Object.keys(loaders) as ProjectSlug[]).forEach(preloadLayout)
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 4000 })
  else window.setTimeout(run, 1500)
}
