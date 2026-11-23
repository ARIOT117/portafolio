import { useEffect, useState } from 'react'
import type { Project } from '../../content/projects'
import styles from './Folder.module.css'

let manifestPromise: Promise<string[]> | null = null

/** ApiGym: la portada son los frame-00 de los primeros 4 ejercicios del manifest. */
function loadApiGymFrames(url: string): Promise<string[]> {
  manifestPromise ??= fetch(url)
    .then((r) => r.json() as Promise<{ frames: string[] }[]>)
    .then((list) => list.slice(0, 4).flatMap((e) => (e.frames[0] ? [e.frames[0]] : [])))
    .catch(() => [])
  return manifestPromise
}

/** Imágenes de la portada: una captura, o 4 frames para ApiGym. */
export function useCover(project: Project): string[] {
  const { manifest, cover } = project.assets
  const [srcs, setSrcs] = useState<string[]>(manifest ? [] : [cover])
  useEffect(() => {
    if (!manifest) return
    let alive = true
    loadApiGymFrames(manifest).then((s) => alive && setSrcs(s))
    return () => {
      alive = false
    }
  }, [manifest])
  return srcs
}

/**
 * Contenido de la hoja: lo usan la hoja de la carpeta y la hoja que vuela, para
 * que sean idénticas. Llena a su contenedor con object-fit, sin deformarse.
 */
export function CoverArt({ project, srcs, eager }: { project: Project; srcs: string[]; eager?: boolean }) {
  if (project.assets.manifest) {
    return (
      <span className={styles.frames}>
        {srcs.map((s) => (
          <img key={s} src={s} alt="" draggable={false} decoding={eager ? 'sync' : 'async'} />
        ))}
      </span>
    )
  }
  return (
    <>
      {srcs[0] && (
        <img
          className={styles.shot}
          src={srcs[0]}
          alt=""
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
        />
      )}
    </>
  )
}
