import { render, screen } from '@testing-library/react'
import { getProject } from '../../content/projects'
import { LangProvider } from '../../i18n/LangProvider'
import ProjectBasics from './ProjectBasics'

const credits = {
  es: 'Proyecto mío de principio a fin. Ideas, QA y propuestas de diseño: Irvin Chavez y Diego Soto.',
  en: 'My project end to end. Ideas, QA and design proposals: Irvin Chavez and Diego Soto.',
}

function renderBasics(slug: string, lang: 'es' | 'en') {
  window.localStorage.setItem('lang', lang)
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(lang)
  render(
    <LangProvider>
      <ProjectBasics project={getProject(slug)!} />
    </LangProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('ProjectBasics credits', () => {
  it.each(['es', 'en'] as const)('muestra los créditos de Gym Zong en %s', (lang) => {
    renderBasics('gym-zong', lang)
    expect(screen.getByText(credits[lang])).toBeInTheDocument()
  })

  it('los proyectos sin credits no muestran el párrafo', () => {
    renderBasics('catstore', 'es')
    expect(screen.queryByText(/Irvin Chavez/)).not.toBeInTheDocument()
  })
})
