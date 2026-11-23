import type { Project } from './projects'
import { useT } from '../i18n/LangProvider'

/** Textos de un proyecto en el idioma activo (claves bajo `project.i18nKey`). */
export interface ProjectText {
  name: string
  kicker: string
  summary: string
  role: readonly string[]
  highlights: readonly string[]
  award?: string
  awardSub?: string
  /** Créditos opcionales (se muestran bajo «Mi rol»). */
  credits?: string
}

export function useProjectText(project: Project): ProjectText {
  const { t } = useT()
  return (t as unknown as Record<string, ProjectText>)[project.i18nKey]!
}
