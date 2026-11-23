import { createContext } from 'react'

/** Slug del proyecto abierto en el overlay (o null). Lo provee App. */
export const OpenProjectContext = createContext<string | null>(null)
