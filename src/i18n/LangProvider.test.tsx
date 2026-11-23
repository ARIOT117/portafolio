import { act, render, screen } from '@testing-library/react'
import { LangProvider, detectLang, useT } from './LangProvider'

function setNavigatorLanguage(value: string) {
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(value)
}

function Probe() {
  const { t, lang, setLang } = useT()
  return (
    <>
      <p data-testid="lang">{lang}</p>
      <p data-testid="text">{t.hero.ctaProjects}</p>
      <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')}>toggle</button>
    </>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('i18n', () => {
  it('usa español si el navegador empieza con es', () => {
    setNavigatorLanguage('es-MX')
    expect(detectLang()).toBe('es')
  })

  it('usa inglés para cualquier otro idioma', () => {
    setNavigatorLanguage('fr-FR')
    expect(detectLang()).toBe('en')
  })

  it('prefiere el idioma guardado sobre el del navegador', () => {
    setNavigatorLanguage('es-MX')
    window.localStorage.setItem('lang', 'en')
    expect(detectLang()).toBe('en')
  })

  it('setLang cambia el texto, persiste y actualiza <html lang>', () => {
    setNavigatorLanguage('es-MX')
    render(
      <LangProvider>
        <Probe />
      </LangProvider>,
    )
    expect(screen.getByTestId('text')).toHaveTextContent('Ver proyectos')
    expect(document.documentElement.lang).toBe('es')

    act(() => screen.getByText('toggle').click())

    expect(screen.getByTestId('text')).toHaveTextContent('See projects')
    expect(window.localStorage.getItem('lang')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })
})
