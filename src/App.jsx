import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Education from './components/Education'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import ProjectDetail from './components/ProjectDetail'
import { Hatch } from './components/ui'

function App() {
  const [activeProject, setActiveProject] = useState(null)

  // Lock page scroll while the case study overlay is open
  useEffect(() => {
    document.body.style.overflow = activeProject ? 'hidden' : ''
  }, [activeProject])

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Hatch />
        <Experience />
        <Hatch />
        <Education />
        <Hatch />
        <Skills />
        <Hatch />
        <Projects onSelectProject={setActiveProject} />
        <Hatch />
        <Contact />
      </main>
      <Footer />

      {activeProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-canvas">
          <ProjectDetail
            project={activeProject}
            onBack={() => setActiveProject(null)}
          />
        </div>
      )}
    </div>
  )
}

export default App
