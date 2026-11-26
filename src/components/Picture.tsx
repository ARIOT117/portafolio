import type { ImgHTMLAttributes } from 'react'
import variantsJson from '../content/imageVariants.json'

interface Entry {
  width: number
  /** Anchos de las variantes .webp redimensionadas (sin contar el original). */
  webp: number[]
  /** Anchos disponibles en .avif (el original incluido, si pesa menos que el .webp). */
  avif: number[]
}

const variants = variantsJson as Record<string, Entry>

const suffix = (base: string, w: number, width: number, ext: string) =>
  w === width ? `${base}.${ext}` : `${base}-${w}.${ext}`

/** Genera el srcset de un formato a partir de los anchos disponibles. */
function srcSet(base: string, widths: number[], width: number, ext: string): string {
  return widths.map((w) => `${suffix(base, w, width, ext)} ${w}w`).join(', ')
}

export type PictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  /** Ruta pública del .webp original (queda como `src` de respaldo). */
  src: string
}

/**
 * `<picture>` con AVIF y variantes responsivas. El `<img>` conserva className y atributos,
 * y `picture` se muestra con `display: contents` (global.css), así que el CSS no cambia.
 * Si la ruta no está en el manifiesto (p. ej. un SVG) se renderiza un `<img>` normal.
 */
export default function Picture({ src, sizes, ...rest }: PictureProps) {
  const entry = variants[src]
  if (!entry) return <img src={src} sizes={sizes} {...rest} />
  const base = src.replace(/\.webp$/, '')
  const { width } = entry
  const webpWidths = [...entry.webp, width].sort((a, b) => a - b)
  const hasVariants = entry.webp.length > 0
  return (
    <picture>
      {/* Un <source> elegido no cae al <img>: solo se ofrece AVIF si llega al ancho completo */}
      {entry.avif.includes(width) && (
        <source type="image/avif" srcSet={srcSet(base, entry.avif, width, 'avif')} sizes={sizes} />
      )}
      <img
        src={src}
        srcSet={hasVariants ? srcSet(base, webpWidths, width, 'webp') : undefined}
        sizes={hasVariants ? sizes : undefined}
        {...rest}
      />
    </picture>
  )
}
