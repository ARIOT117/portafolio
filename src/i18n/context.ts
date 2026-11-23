import { createContext, useContext } from 'react'
import type { Dict } from './es'

export type Lang = 'es' | 'en'

export interface LangContextValue {
  t: Dict
  lang: Lang
  setLang: (lang: Lang) => void
}

export const LangContext = createContext<LangContextValue | null>(null)

export function useT(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT debe usarse dentro de <LangProvider>')
  return ctx
}
