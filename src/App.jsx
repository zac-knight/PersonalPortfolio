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

function App() {
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
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App






