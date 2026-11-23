import { AnimatePresence } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useMatch, useNavigationType } from 'react-router'
import Contact from './components/Contact'
import FolderGrid from './components/FolderGrid'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Nav from './components/Nav'
import ProjectView from './components/ProjectView'
import { OpenProjectContext } from './components/ProjectView/context'

function Home() {
  return (
    <main>
      <Hero />
      <FolderGrid />
      <Contact />
    </main>
  )
}

export default function App() {
  const location = useLocation()
  const navType = useNavigationType()
  const match = useMatch('/p/:slug')
  const slug = match?.params.slug ?? null
  const backgroundLocation = (location.state as { backgroundLocation?: typeof location } | null)
    ?.backgroundLocation

  // Scroll a #hash en la home (también al cerrar el overlay desde la Nav).
  // Con POP (atrás/adelante) la página sigue montada y conserva su scroll.
  const first = useRef(true)
  useEffect(() => {
    const isFirst = first.current
    first.current = false
    if (!location.hash || location.pathname !== '/') return
    if (navType === 'POP' && !isFirst) return
    document.getElementById(location.hash.slice(1))?.scrollIntoView()
  }, [location.key]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <OpenProjectContext.Provider value={slug}>
      <Intro />
      <Nav />
      {/* Una sola ruta comodín: la home no se desmonta al abrir ni cerrar un proyecto */}
      <Routes location={backgroundLocation ?? location}>
        <Route path="*" element={<Home />} />
      </Routes>
      <AnimatePresence>{slug && <ProjectView key={slug} slug={slug} />}</AnimatePresence>
    </OpenProjectContext.Provider>
  )
}
