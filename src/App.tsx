import { AnimatePresence } from 'motion/react'
import { Route, Routes, useLocation } from 'react-router'
import Contact from './components/Contact'
import FolderGrid from './components/FolderGrid'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Nav from './components/Nav'
import ProjectView from './components/ProjectView'

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
  return (
    <>
      <Intro />
      <Nav />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/p/:slug" element={<ProjectView />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
