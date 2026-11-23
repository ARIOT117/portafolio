import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * El visor de proyecto es un overlay con su propio contenedor de scroll: lo
 * localizamos subiendo por el DOM para que useScroll lea ese elemento y no la
 * ventana. Sin contenedor propio (home, tests en jsdom) se usa la ventana.
 */
export function useScroller(anchor: RefObject<HTMLElement | null>): { container?: RefObject<HTMLElement> } {
  const [scroller, setScroller] = useState<RefObject<HTMLElement> | null>(null)
  useLayoutEffect(() => {
    let el = anchor.current?.parentElement ?? null
    while (el) {
      const oy = getComputedStyle(el).overflowY
      if (oy === 'auto' || oy === 'scroll') break
      el = el.parentElement
    }
    if (el) setScroller({ current: el })
  }, [anchor])
  return scroller ? { container: scroller } : {}
}
