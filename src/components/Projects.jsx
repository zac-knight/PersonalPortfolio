import { FaHouse } from 'react-icons/fa6'

const projects = [
  {
    title: 'Project 1: Masters Dissertation',
    description:
      'My Masters dissertation involved using machine learning and computer vision together with robots to determine the physical properties of objects. The aim was to bridge the gap between how humans and robots interact with their environment.',
    skills: ['🐍', '🔥', '📦'],
    images: [
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
    ],
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
      'https://via.placeholder.com/300x200',
    ],
  },
]

export default function Projects() {
  return (
    <section
      id="projects"
      className="h-screen w-full snap-start flex flex-col overflow-y-auto no-scrollbar"
    >
      {projects.map((project, index) => (
        <div key={index} className="relative min-h-screen flex flex-col">

          {/* Diagonal Background Split */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#f0f0f0]" />
            <div
              className="absolute bottom-0 left-0 w-full h-[55%] bg-[#8fa8aa]"
              style={{ clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0% 100%)' }}
            />
          </div>

          {/* Image Grid */}
          <div className="relative z-10 flex justify-center mt-16 px-16">
            <div className="grid grid-cols-3 gap-3 max-w-4xl w-full">
              {/* Top row: 2 images side by side, last one tall on right */}
              <div className="col-span-1 flex flex-col gap-3">
                <div className="rounded-xl overflow-hidden shadow-md bg-white">
                  <img
                    src={project.images[0]}
                    alt="project"
                    className="w-full h-32 object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-md bg-white">
                  <img
                    src={project.images[1]}
                    alt="project"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
              <div className="col-span-1 rounded-xl overflow-hidden shadow-md bg-white">
                <img
                  src={project.images[2]}
                  alt="project"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-1 rounded-xl overflow-hidden shadow-md bg-white">
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
            <h2 className="text-3xl font-bold text-gray-900 underline decoration-gray-900 mb-4">
              {project.title}
            </h2>

            {/* Skill Icons */}
            <div className="flex gap-4 mb-6">
              {project.skills.map((skill, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-2xl"
                >
                  {skill}
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-800 text-base leading-relaxed text-justify max-w-4xl">
              {project.description}
            </p>
          </div>
        </div>
      ))}

    </section>
  )
}