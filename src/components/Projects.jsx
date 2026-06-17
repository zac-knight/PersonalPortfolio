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
    images: [
      '/projects/qps-1.png',
      '/projects/qps-2.png',
      '/projects/qps-3.png',
    ],
    link: '#',
  },
  {
    title: 'Project 2: Your Next Project',
    description: 'A short description of another project you have worked on.',
    skills: [FaReact],
    images: [
      '/projects/qps-1.png',
      '/projects/qps-2.png',
      '/projects/qps-3.png',
    ],
    link: '#',
  },
  {
    title: 'Project 3: Another Project',
    description: 'A short description of another project you have worked on.',
    skills: [FaReact],
    images: [
      '/projects/qps-1.png',
      '/projects/qps-2.png',
      '/projects/qps-3.png',
    ],
    link: '#',
  },
]

function ProjectCard({ project }) {
  return (
    <section
      id="projects"
      className="h-screen w-screen flex-shrink-0 snap-start flex flex-col"
    >

      {/* Title */}
      <div className="flex justify-center mt-18 mb-2">
        <p className="text-slate-400 tracking-[0.3em] text-sm uppercase">
          P R O J E C T S
        </p>
      </div>

      {/* Image Grid */}
      <div className="relative z-10 flex justify-center px-16 mt-6">
        <div className="grid grid-cols-3 gap-3 max-w-4xl w-full">
          <div className="col-span-1 h-[204px] rounded-xl overflow-hidden shadow-md border border-sky-500/20 bg-slate-900">
            <img src={project.images[0]} className="w-full h-full object-cover" />
          </div>
          <div className="col-span-1 h-[204px] rounded-xl overflow-hidden shadow-md border border-sky-500/20 bg-slate-900">
            <img src={project.images[1]} className="w-full h-full object-cover" />
          </div>
          <div className="col-span-1 h-[204px] rounded-xl overflow-hidden shadow-lg border border-sky-500/20 bg-slate-900">
            <img src={project.images[2]} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col px-32 mt-6 max-w-6xl w-full mx-auto">

        {/* Title row: title left, skill icons right */}
        <div className="flex items-center justify-between gap-6 mb-4">
          <h2 className="text-6xl font-bold text-slate-100 underline decoration-sky-400 shrink-0">
            {project.title}
          </h2>
          <div className="flex gap-3 flex-wrap justify-end">
            {project.skills.map((Icon, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-slate-900 border border-sky-500/20 shadow-lg flex items-center justify-center"
              >
                <Icon size={20} className="text-slate-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-base leading-relaxed text-justify mb-6">
          {project.description}
        </p>

        {/* More Detail button */}
        <div className="flex justify-start">
          <a
            href={project.link}
            className="flex items-center gap-2 mt-4 px-6 py-2.5 bg-sky-950/95 border border-sky-800/60 text-sky-300 text-sm tracking-widest uppercase rounded-full hover:bg-sky-950 hover:border-sky-600 hover:text-sky-200 transition-all duration-300"
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
  const [index, setIndex] = useState(0)

  const scrollToIndex = (i) => {
    const container = scrollRef.current
    if (!container) return
    const width = container.clientWidth
    container.scrollTo({ left: i * width, behavior: 'smooth' })
    setIndex(i)
  }

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return
    const newIndex = Math.round(container.scrollLeft / container.clientWidth)
    setIndex(newIndex)
  }

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="h-screen w-screen snap-start relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div
          className="absolute bottom-0 left-0 w-full h-[55%] bg-sky-700/70"
          style={{ clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0% 100%)' }}
        />
      </div>

      {/* Left button */}
      <button
        onClick={() => scrollToIndex(index - 1)}
        className={`absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-slate-900 border border-sky-500/30 flex items-center justify-center hover:bg-slate-800 transition-opacity duration-300 ${index === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <FaChevronLeft size={28} className="text-sky-300" />
      </button>

      {/* Right button */}
      <button
        onClick={() => scrollToIndex(index + 1)}
        className={`absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-slate-900 border border-sky-500/30 flex items-center justify-center hover:bg-slate-800 transition-opacity duration-300 ${index === projects.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <FaChevronRight size={28} className="text-sky-300" />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="relative z-10 flex h-full overflow-x-scroll snap-x snap-mandatory no-scrollbar"
      >
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} />
        ))}
      </div>
    </section>
  )
}