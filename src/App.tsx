import { AnimatePresence } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useMatch, useNavigationType } from 'react-router'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FolderGrid from './components/FolderGrid'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Nav from './components/Nav'
import ProjectView from './components/ProjectView'
import { OpenProjectContext } from './components/ProjectView/context'
import { useT } from './i18n/context'

/** El hash de la URL lo gestiona el router; aquí solo se mueve el foco al contenido. */
function skipToMain(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  const main = document.getElementById('contenido')
  main?.focus({ preventScroll: true })
  main?.scrollIntoView()
}

function Home() {
  return (
    <>
      <main id="contenido" tabIndex={-1}>
        <Hero />
        <FolderGrid />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  const { lang } = useT()
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
      <a href="#contenido" className="skip-link" onClick={skipToMain}>
        {lang === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      <Nav />
      {/* Una sola ruta comodín: la home no se desmonta al abrir ni cerrar un proyecto */}
      <Routes location={backgroundLocation ?? location}>
        <Route path="*" element={<Home />} />
      </Routes>
      <AnimatePresence>{slug && <ProjectView key={slug} slug={slug} />}</AnimatePresence>
    </OpenProjectContext.Provider>
  )
}
