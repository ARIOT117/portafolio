import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { LangProvider } from '../../i18n/LangProvider'
import Certificates from './index'

function renderSection() {
  return render(
    <MemoryRouter>
      <LangProvider>
        <Certificates />
      </LangProvider>
    </MemoryRouter>,
  )
}

// jsdom no implementa showModal/close: se simulan con el atributo `open`.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})

beforeEach(() => window.localStorage.setItem('lang', 'es'))

describe('Certificates', () => {
  it('muestra una carpeta por evento', () => {
    renderSection()
    expect(screen.getByRole('heading', { name: 'Constancias' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /NASA Space Apps Challenge 2026/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Innovathon 2026/ })).toBeInTheDocument()
  })

  it('el nombre del botón es el título visible (más el aviso para lectores)', () => {
    renderSection()
    expect(screen.getByRole('button', { name: 'Ver la constancia de NASA Space Apps Challenge 2026' })).toHaveTextContent('NASA Space Apps Challenge 2026')
    expect(screen.getByRole('button', { name: 'Ver la constancia de Innovathon 2026' })).not.toHaveAttribute('aria-label')
  })

  it('Space Apps abre la constancia con lo que hice, el equipo y los enlaces', () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: /NASA Space Apps Challenge 2026/ }))
    const dialog = screen.getByRole('dialog', { name: 'NASA Space Apps Challenge 2026', hidden: true })
    const d = within(dialog)
    expect(d.getByText('1er lugar local')).toBeInTheDocument()
    expect(d.getByText(/Galactic Problem Solver/)).toBeInTheDocument()
    expect(d.getByText('Lo que hice')).toBeInTheDocument()
    expect(d.getByText('DualDynamics')).toBeInTheDocument()
    expect(d.getByRole('img', { hidden: true })).toHaveAttribute('src', '/certificates/space-apps-2026.webp')
    const team = d.getByRole('link', { name: /Página del equipo/, hidden: true })
    expect(team).toHaveAttribute('href', 'https://www.spaceappschallenge.org/2026/find-a-team/gangbangers/')
    expect(team).toHaveAttribute('target', '_blank')
    expect(d.getByRole('link', { name: 'Ver el caso', hidden: true })).toHaveAttribute('href', '/p/eclipse-rojo')
  })

  it('Innovathon enlaza el repo de Zumek y el sitio oficial, sin distinción; Escape (cancel) cierra', () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: /Innovathon 2026/ }))
    const dialog = screen.getByRole('dialog', { name: 'Innovathon 2026', hidden: true })
    const d = within(dialog)
    expect(d.getByText('Gangbangers')).toBeInTheDocument()
    expect(d.getByRole('link', { name: /Ver repositorio/, hidden: true })).toHaveAttribute('href', 'https://github.com/Gangbangers-Evolution/Zumek')
    expect(d.getByRole('link', { name: /Sitio oficial/, hidden: true })).toHaveAttribute('href', 'https://innovathon.innovacuu.xyz/')
    expect(d.queryByText('1er lugar local')).not.toBeInTheDocument()
    expect(dialog).toHaveAttribute('open')
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument()
  })
})
