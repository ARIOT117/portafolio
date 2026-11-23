import { projects } from './projects'

describe('projects', () => {
  it('tiene 4 proyectos en el orden esperado', () => {
    expect(projects.map((p) => p.slug)).toEqual(['eclipse-rojo', 'gym-zong', 'apigym', 'catstore'])
  })

  it('cada proyecto tiene slug único y al menos un link https', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const p of projects) {
      expect(p.links.length).toBeGreaterThan(0)
      for (const l of p.links) expect(l.href).toMatch(/^https:\/\//)
    }
  })
})
