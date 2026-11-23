import { render, screen } from '@testing-library/react'
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
