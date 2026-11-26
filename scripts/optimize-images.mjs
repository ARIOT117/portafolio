// Genera hermanos .avif y variantes redimensionadas (.webp + .avif) de las imágenes
// de public/projects y public/certificates, y escribe src/content/imageVariants.json
// (usado por src/components/Picture.tsx). Idempotente: no regenera lo que ya está al día.
// Uso: npm run images
import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const dirs = ['projects', 'certificates']
const manifestPath = join(root, 'src/content/imageVariants.json')

/** Anchos de variante según el ancho real de la imagen. Lo no listado solo recibe .avif. */
const VARIANTS_BY_WIDTH = {
  1440: [640, 960], // capturas de escritorio
  1080: [360, 540, 720], // pantallas de teléfono
  780: [360, 540],
  585: [360],
  2048: [1024], // textura de Marte
  1600: [800, 1200], // constancias
  1056: [640, 800],
}

const AVIF = { quality: 55, effort: 6 }
const WEBP = { quality: 80, effort: 6 }

// Una variante generada (foo-640.webp) tiene un original hermano (foo.webp); screen-01.webp no.
const isSource = (f) => f.endsWith('.webp') && !(/-\d+\.webp$/.test(f) && existsSync(f.replace(/-\d+\.webp$/, '.webp')))

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else yield p
  }
}

const upToDate = (out, src) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs

/** Escribe `out` si falta o está viejo y devuelve su tamaño. */
async function emit(pipeline, out, src) {
  if (!upToDate(out, src)) await pipeline.toFile(out)
  return statSync(out).size
}

const manifest = {}
let made = 0

for (const d of dirs) {
  for (const file of [...walk(join(publicDir, d))].filter(isSource).sort()) {
    const key = '/' + relative(publicDir, file).split('\\').join('/')
    const base = file.slice(0, -'.webp'.length)
    const meta = await sharp(file).metadata()
    const width = meta.width
    const webpSize = statSync(file).size
    const entry = { width, webp: [], avif: [] }

    // Original en AVIF
    const avifOut = `${base}.avif`
    const avifSize = await emit(sharp(file).avif(AVIF), avifOut, file)
    if (avifSize < webpSize) entry.avif.push(width)
    else unlinkSync(avifOut)

    for (const w of VARIANTS_BY_WIDTH[width] ?? []) {
      if (w >= width) continue
      const webpOut = `${base}-${w}.webp`
      const wSize = await emit(sharp(file).resize({ width: w }).webp(WEBP), webpOut, file)
      entry.webp.push(w)
      const aOut = `${base}-${w}.avif`
      const aSize = await emit(sharp(file).resize({ width: w }).avif(AVIF), aOut, file)
      if (aSize < wSize) entry.avif.push(w)
      else unlinkSync(aOut)
      made++
    }
    entry.avif.sort((a, b) => a - b)
    manifest[key] = entry
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Imágenes: ${Object.keys(manifest).length} fuentes, manifiesto en ${relative(root, manifestPath)}`)
