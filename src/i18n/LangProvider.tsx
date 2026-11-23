import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { en } from './en'
import { es, type Dict } from './es'
import { LangContext, type Lang } from './context'

const dictionaries: Record<Lang, Dict> = { es, en }
const STORAGE_KEY = 'lang'

export function detectLang(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'es' || saved === 'en') return saved
  } catch {
    /* almacenamiento no disponible */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'es'
  return nav?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignorar */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = dictionaries[lang].meta.title
  }, [lang])

  const value = useMemo(() => ({ t: dictionaries[lang], lang, setLang }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
