import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Education from './components/Education'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import SnowCanvas from './components/SnowCanvas'
import ProjectDetail from './components/ProjectDetail'

function App() {
  const [activeProject, setActiveProject] = useState(null)

  return (
    <>
      <SnowCanvas density={90} speed={3} />
      <Navbar />
      <main id="scroll-container" className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
        <Hero />
        <About />
        <Experience />
        <Education />
        <Skills />
        <Projects onSelectProject={setActiveProject} />
        <Contact />
      </main>
      <Footer />

      {/* Detail overlay — rendered outside the snap container */}
      {activeProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
          <ProjectDetail
            project={activeProject}
            onBack={() => setActiveProject(null)}
          />
        </div>
      )}
    </>
  )
}

export default App