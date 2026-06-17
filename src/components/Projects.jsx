import { useRef } from 'react'
import { FaReact } from 'react-icons/fa'
import { SiNextdotjs } from 'react-icons/si'
import { SiTypescript } from 'react-icons/si'
import { SiTailwindcss } from 'react-icons/si'
import { SiPrisma } from 'react-icons/si'
import { SiMysql } from 'react-icons/si'

const projects = [
  {
    title: 'QPS Post-Course Resource Hub',
    description:
      'Developed as part of a QUT IT Capstone Project in collaboration with the Queensland Police Service, this platform provides a centralised post-course resource hub for Specialist Investigators and Detectives. The application includes course management, discussion forums, research resources, and an integrated e-commerce system. Built from the ground up by a team of four students, the project successfully delivered over 110 user stories using modern full-stack technologies.',
    skills: [
      SiNextdotjs,
      SiTypescript,
      SiMysql,
      SiPrisma,
      SiTailwindcss,
      FaReact,
    ],
    images: [
      '/projects/qps-1.png',
      '/projects/qps-2.png',
      '/projects/qps-3.png',
      '/projects/qps-4.png',
    ],
    link: '#',
  },
  {
    title: 'Project 2: Your Next Project',
    description:
      'A short description of another project you have worked on. Explain what problem it solved and what technologies you used to build it.',
    skills: ['⚛️', '🌐', '🗄️'],
    images: [
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
    ],
  },
  {
    title: 'Project 3: Another Project',
    description:
      'A short description of another project you have worked on. Explain what problem it solved and what technologies you used to build it.',
    skills: ['⚛️', '🌐', '🗄️'],
    images: [
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
    ],
  },
]

function ProjectCard({ project }) {
  return (
    <div className="h-screen w-screen flex-shrink-0 snap-start flex flex-col">
      {/* Image Grid */}
      <div className="relative z-10 flex justify-center px-16 mt-16">
        <div className="grid grid-cols-3 gap-3 max-w-4xl w-full">
          <div className="col-span-1 flex flex-col gap-3">
            <div className="rounded-xl overflow-hidden shadow-lg border border-sky-500/20 bg-slate-900">
              <img
                src={project.images[0]}
                alt="project"
                className="w-full h-32 object-cover"
              />
            </div>

            <div className="rounded-xl overflow-hidden shadow-lg border border-sky-500/20 bg-slate-900">
              <img
                src={project.images[1]}
                alt="project"
                className="w-full h-32 object-cover"
              />
            </div>
          </div>

          <div className="col-span-1 rounded-xl overflow-hidden shadow-lg border border-sky-500/20 bg-slate-900">
            <img
              src={project.images[2]}
              alt="project"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="col-span-1 rounded-xl overflow-hidden shadow-lg border border-sky-500/20 bg-slate-900">
            <img
              src={project.images[3]}
              alt="project"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="relative z-10 flex flex-col items-center text-center px-32 mt-8">
        <h2 className="text-3xl font-bold text-slate-100 underline decoration-sky-400 mb-4">
          {project.title}
        </h2>

        <div className="flex gap-4 mb-6 flex-wrap justify-center">
          {project.skills.map((Icon, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full bg-slate-900 border border-sky-500/20 shadow-lg flex items-center justify-center"
            >
              <Icon size={24} className="text-slate-200" />
            </div>
          ))}
        </div>
        
        <p className="text-slate-300 text-base leading-relaxed text-justify max-w-4xl">
          {project.description}
        </p>
      </div>
    </div>
  )
}

export default function Projects() {
  const scrollRef = useRef(null)

  return (
    <section
      id="projects"
      className="h-screen w-screen snap-start relative overflow-hidden"
    >
      {/* Single fixed diagonal background that never moves */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        <div
          className="absolute bottom-0 left-0 w-full h-[55%] bg-sky-700/70"
          style={{
            clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        />
      </div>

      {/* Horizontally scrolling cards sit on top */}
      <div
        ref={scrollRef}
        className="relative z-10 flex h-full overflow-x-scroll snap-x snap-mandatory no-scrollbar"
      >
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  )
}
