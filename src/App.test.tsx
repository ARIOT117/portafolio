import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'
import { resetIntroForTests } from './components/Intro/introStore'
import { LangProvider } from './i18n/LangProvider'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LangProvider>
        <App />
      </LangProvider>
    </MemoryRouter>,
  )
}

beforeAll(() => {
  // jsdom no trae matchMedia ni IntersectionObserver. Se simula reduced motion.
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  window.IntersectionObserver = IO as unknown as typeof IntersectionObserver
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

beforeEach(() => {
  window.localStorage.setItem('lang', 'es')
  window.sessionStorage.setItem('intro-seen', '1')
  resetIntroForTests()
})

describe('carpetas y vista de proyecto', () => {
  it('un clic en una carpeta abre el diálogo con el nombre correcto', async () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Abrir Gym Zong' }))
    const dialog = await screen.findByRole('dialog', { name: 'Gym Zong' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('Escape cierra la vista', async () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Abrir CATSTORE · Snacks and Cats' }))
    await screen.findByRole('dialog')
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('entrar directo a /p/catstore muestra la vista', async () => {
    renderAt('/p/catstore')
    expect(await screen.findByRole('dialog', { name: 'CATSTORE · Snacks and Cats' })).toBeInTheDocument()
    // La home queda montada debajo
    expect(screen.getByRole('link', { name: 'Abrir Gym Zong' })).toBeInTheDocument()
  })

  it('un slug inválido muestra el aviso y un enlace a la home', () => {
    renderAt('/p/no-existe')
    expect(screen.getByText('No encontré ese proyecto.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Ir al inicio' }).some((a) => a.getAttribute('href') === '/')).toBe(true)
  })

  it.each(['eclipse-rojo', 'gym-zong', 'apigym', 'imoney', 'catstore'])(
    'los enlaces externos de %s abren en pestaña nueva con rel seguro',
    async (slug) => {
      renderAt(`/p/${slug}`)
      const dialog = await screen.findByRole('dialog')
      // Solo los enlaces que salen del sitio; «Siguiente proyecto» es interno.
      const links = within(dialog)
        .getAllByRole('link')
        .filter((a) => /^https?:\/\//.test(a.getAttribute('href') ?? ''))
      expect(links.length).toBeGreaterThan(0)
      for (const a of links) {
        expect(a).toHaveAttribute('target', '_blank')
        expect(a).toHaveAttribute('rel', 'noopener noreferrer')
        expect(a.getAttribute('href')).toMatch(/^https:\/\//)
      }
    },
  )

  it('Eclipse Rojo muestra el premio', async () => {
    renderAt('/p/eclipse-rojo')
    expect((await screen.findAllByText(/1er lugar local/)).length).toBeGreaterThan(0)
  })

  it('iMoney muestra mi rol, enlaza solo la demo y marca el repositorio como privado', async () => {
    renderAt('/p/imoney')
    const dialog = await screen.findByRole('dialog', { name: 'iMoney' })
    expect(within(dialog).getByText('Programé la lectura de tickets con IA, con revisión antes de guardar')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Programé los gastos hormiga, el alcance del dinero, los cambios de precio y dividir cuentas'),
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Equipo: Adrian Robles, Jesús Castellanos y Diego Esparza')).toBeInTheDocument()
    const external = within(dialog)
      .getAllByRole('link')
      .filter((a) => /^https?:\/\//.test(a.getAttribute('href') ?? ''))
    expect(external.length).toBeGreaterThan(0)
    for (const a of external) expect(a).toHaveAttribute('href', 'https://imoney-demo.vercel.app')
    expect(within(dialog).queryByRole('link', { name: /github/i })).not.toBeInTheDocument()
    expect(within(dialog).getByText(/Repositorio privado/)).toBeInTheDocument()
  })
})
