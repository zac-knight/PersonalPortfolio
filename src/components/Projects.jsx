import { useRef, useState, useEffect } from 'react'
import { FaReact, FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa'
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiPrisma,
  SiMysql,
} from 'react-icons/si'

const projects = [
  {
    title: 'QPS Post-Course Resource Hub',
    description:
      'Developed as part of a QUT IT Capstone Project in collaboration with the Queensland Police Service, this platform provides a centralised post-course resource hub for Specialist Investigators and Detectives. The application includes course management, discussion forums, research resources, and an integrated e-commerce system. Built from the ground up by a team of four students, the project successfully delivered over 110 user stories using modern full-stack technologies.',
    skills: [SiNextdotjs, SiTypescript, SiMysql, SiPrisma, SiTailwindcss, FaReact],
    images: ['/projects/qps-1.png', '/projects/qps-2.png', '/projects/qps-3.png'],
    link: '#',
  },
  {
    title: 'Project 2: Your Next Project',
    description: 'A short description of another project you have worked on.',
    skills: [FaReact],
    images: ['/projects/qps-1.png', '/projects/qps-2.png', '/projects/qps-3.png'],
    link: '#',
  },
  {
    title: 'Project 3: Another Project',
    description: 'A short description of another project you have worked on.',
    skills: [FaReact],
    images: ['/projects/qps-1.png', '/projects/qps-2.png', '/projects/qps-3.png'],
    link: '#',
  },
]

function ProjectCard({ project, isActive }) {
  const [imgIndex, setImgIndex] = useState(0)

  // Reset to first image when section becomes inactive
  useEffect(() => {
    if (!isActive) setImgIndex(0)
  }, [isActive])

  // Only rotate when the section is active
  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => {
      setImgIndex(prev => (prev + 1) % project.images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [imgIndex, isActive, project.images.length])

  return (
    <section
      id="projects"
      className="h-screen w-screen flex-shrink-0 snap-start flex flex-col"
    >
      {/* Title */}
      <div className="flex justify-center mt-20 sm:mt-18 mb-2">
        <p className="text-slate-400 tracking-[0.3em] text-sm uppercase">
          P R O J E C T S
        </p>
      </div>

      {/* Images */}
      <div className="relative z-10 flex justify-center px-4 sm:px-16 mt-4 sm:mt-6">
        {/* Mobile: single large image with dot switcher */}
        <div className="flex flex-col items-center gap-2 w-full sm:hidden">
          <div className="w-full h-[200px] rounded-xl overflow-hidden border border-sky-500/20 bg-slate-900">
            <img
              src={project.images[imgIndex]}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          </div>
          <div className="flex gap-1.5 mt-1">
            {project.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  i === imgIndex ? 'bg-sky-400 scale-125' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: three image grid */}
        <div className="hidden sm:grid grid-cols-3 gap-3 max-w-4xl w-full">
          {project.images.map((src, i) => (
            <div
              key={i}
              className="col-span-1 h-[204px] rounded-xl overflow-hidden shadow-md border border-sky-500/20 bg-slate-900"
            >
              <img src={src} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col px-6 sm:px-16 md:px-32 mt-6 max-w-6xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-4">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-slate-100 underline decoration-sky-400">
            {project.title}
          </h2>
          <div className="flex gap-2 sm:gap-3 flex-wrap sm:justify-end">
            {project.skills.map((Icon, i) => (
              <div
                key={i}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900 border border-sky-500/20 shadow-lg flex items-center justify-center"
              >
                <Icon size={16} className="text-slate-200" />
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-300 text-[13px] sm:text-sm md:text-base leading-relaxed text-justify mb-5 sm:mb-6 line-clamp-3 sm:line-clamp-none">
          {project.description}
        </p>

        <div className="flex justify-start mt-4">
          <a
            href={project.link}
            className="flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 bg-sky-950/95 border border-sky-800/60 text-sky-300 text-xs sm:text-sm tracking-widest uppercase rounded-full hover:bg-sky-950 hover:border-sky-600 hover:text-sky-200 transition-all duration-300"
          >
            More Detail
            <FaArrowRight size={12} />
          </a>
        </div>
      </div>
    </section>
  )
}

export default function Projects() {
  const scrollRef = useRef(null)
  const sectionRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [isSectionVisible, setIsSectionVisible] = useState(false)

  // Watch whether the Projects section is visible on screen
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsSectionVisible(entry.isIntersecting),
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scrollToIndex = (i) => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({ left: i * container.clientWidth, behavior: 'smooth' })
    setIndex(i)
  }

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return
    setIndex(Math.round(container.scrollLeft / container.clientWidth))
  }

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="h-screen w-screen snap-start relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" />
        <div
          className="absolute bottom-0 left-0 w-full h-[55%] bg-sky-700/70"
          style={{ clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0% 100%)' }}
        />
      </div>

      {/* Left button */}
      <button
        onClick={() => scrollToIndex(index - 1)}
        className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-slate-900 border border-sky-500/30 flex items-center justify-center hover:bg-slate-800 transition-opacity duration-300 ${
          index === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <FaChevronLeft size={16} className="text-sky-300" />
      </button>

      {/* Right button */}
      <button
        onClick={() => scrollToIndex(index + 1)}
        className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-slate-900 border border-sky-500/30 flex items-center justify-center hover:bg-slate-800 transition-opacity duration-300 ${
          index === projects.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <FaChevronRight size={16} className="text-sky-300" />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="relative z-10 flex h-full overflow-x-scroll snap-x snap-mandatory no-scrollbar"
      >
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} isActive={isSectionVisible} />
        ))}
      </div>
    </section>
  )
}