import type { ComponentType } from 'react'
import type { Project, ProjectSlug } from '../../content/projects'
import ApiGymLayout from './ApiGymLayout'
import CatstoreLayout from './CatstoreLayout'
import EclipseRojoLayout from './EclipseRojoLayout'
import GymZongLayout from './GymZongLayout'
import ImoneyLayout from './ImoneyLayout'

/** Layout de cada proyecto. Cada archivo exporta un componente por defecto. */
export const layouts: Record<ProjectSlug, ComponentType<{ project: Project }>> = {
  'eclipse-rojo': EclipseRojoLayout,
  'gym-zong': GymZongLayout,
  apigym: ApiGymLayout,
  imoney: ImoneyLayout,
  catstore: CatstoreLayout,
}
