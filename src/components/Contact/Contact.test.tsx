import { render, screen } from '@testing-library/react'

async function renderContact(email: string, whatsapp = '') {
  vi.resetModules()
  vi.doMock('../../content/contact', () => ({
    CONTACT_EMAIL: email,
    WHATSAPP_NUMBER: whatsapp,
    LINKEDIN_URL: 'https://example.com/in/x',
    GITHUB_URL: 'https://example.com/gh',
  }))
  const { default: Contact } = await import('./index')
  const { LangProvider: LP } = await import('../../i18n/LangProvider')
  return render(
    <LP>
      <Contact />
    </LP>,
  )
}

beforeEach(() => window.localStorage.setItem('lang', 'es'))
afterEach(() => vi.doUnmock('../../content/contact'))

describe('Contact', () => {
  it('sin correo no muestra el botón de correo y dirige a LinkedIn', async () => {
    await renderContact('')
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /GitHub/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copiar correo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Escribir por correo' })).not.toBeInTheDocument()
    expect(screen.getByText(/por LinkedIn/)).toBeInTheDocument()
  })

  it('con correo muestra copiar y mailto, y la línea ya no menciona LinkedIn', async () => {
    await renderContact('hola@ejemplo.test')
    expect(screen.getByRole('button', { name: 'Copiar correo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Escribir por correo' })).toHaveAttribute('href', 'mailto:hola@ejemplo.test')
    expect(screen.queryByText(/por LinkedIn/)).not.toBeInTheDocument()
  })

  it('WhatsApp solo aparece con número y lleva el saludo codificado', async () => {
    await renderContact('')
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).not.toBeInTheDocument()
  })

  it('con número muestra el enlace wa.me', async () => {
    await renderContact('', '5215500000000')
    const a = screen.getByRole('link', { name: /WhatsApp/ })
    expect(a.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5215500000000\?text=Hola%20Diego/)
    expect(a).toHaveAttribute('target', '_blank')
  })
})
