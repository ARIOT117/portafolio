import { act, fireEvent, render, screen } from '@testing-library/react'
import { LangProvider } from '../../i18n/LangProvider'
import Intro from '.'
import { resetIntroForTests } from './introStore'

function renderIntro() {
  return render(
    <LangProvider>
      <Intro />
    </LangProvider>,
  )
}

beforeEach(() => {
  window.sessionStorage.clear()
  resetIntroForTests()
})

describe('Intro', () => {
  it('se muestra en la primera visita de la sesión', () => {
    renderIntro()
    expect(screen.getByRole('button', { name: /saltar|skip/i })).toBeInTheDocument()
    expect(window.sessionStorage.getItem('intro-seen')).toBe('1')
  })

  it('no aparece si sessionStorage ya tiene intro-seen', () => {
    window.sessionStorage.setItem('intro-seen', '1')
    resetIntroForTests()
    renderIntro()
    expect(screen.queryByRole('button', { name: /saltar|skip/i })).not.toBeInTheDocument()
  })
})

describe('Intro (decodificado)', () => {
  it('conserva el nombre accesible real aunque los glifos cambien', () => {
    renderIntro()
    expect(screen.getByText('ARIOT117', { selector: '.sr-only' })).toBeInTheDocument()
    expect(screen.getByText('Diego Esparza', { selector: '.sr-only' })).toBeInTheDocument()
  })

  it('al saltar con Escape pasa a done y desmonta la intro', async () => {
    const { getIntroPhase } = await import('./introStore')
    renderIntro()
    expect(getIntroPhase()).toBe('type')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(getIntroPhase()).toBe('fly')
  })

  it('avanza sola a done con temporizadores y no actualiza tras desmontar', async () => {
    vi.useFakeTimers()
    try {
      const { getIntroPhase, TYPE_MS, FLY_MS } = await import('./introStore')
      const { unmount } = renderIntro()
      act(() => {
        vi.advanceTimersByTime(TYPE_MS + 1)
      })
      expect(getIntroPhase()).toBe('fly')
      act(() => {
        vi.advanceTimersByTime(FLY_MS + 1)
      })
      expect(getIntroPhase()).toBe('done')
      unmount()
      act(() => {
        vi.advanceTimersByTime(2000)
      })
    } finally {
      vi.useRealTimers()
    }
  })
})
