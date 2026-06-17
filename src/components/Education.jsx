import { FaHouse } from 'react-icons/fa6'

const experiences = [
  {
    title: 'Machine Learning Engineer',
    company: 'Tensora',
    logo: 'https://via.placeholder.com/60',
    dates: 'MON AUG 19 2024 - PRESENT',
    skills: ['🐍', '🔥', 'AWS', 'T', '📦', '🤖'],
    points: [
      'Built decentralised AI solutions on the Bittensor blockchain',
    ],
  },
  {
    title: 'Machine Learning Engineer',
    company: 'Key Three Data',
    logo: 'https://via.placeholder.com/60',
    dates: 'THU SEP 01 2022 - SUN AUG 18 2024',
    skills: ['🐍', '🔥', '☁️', '📦', '🤖'],
    points: [
      'Worked as a consultant for Key Three Data on a project aimed at developing an automated platform for converting first-person video into structured data',
    ],
  },
  {
    title: 'Mobile App Developer',
    company: 'Co-Pilot Consulting',
    logo: 'https://via.placeholder.com/60',
    dates: 'FRI JAN 01 2021 - SUN AUG 18 2024',
    skills: ['📱', '☁️', '🗄️', '📦'],
    points: [
      'Worked as a consultant for Co-Pilot (SA) as one of the lead developers',
    ],
  },
]

export default function Education() {
  return (
    <section
      id="education"
      className="h-screen w-full bg-[#0a0a0a] snap-start flex flex-col items-center justify-center relative"
    >
      {/* Title */}
      <p className="text-slate-400 tracking-[0.3em] text-sm uppercase mb-10">
        E D U C A T I O N
      </p>

      {/* Horizontally Scrollable Cards */}
      <div className="flex gap-6 overflow-x-auto w-full px-16 pb-4 no-scrollbar">
        {experiences.map((exp, index) => (
          <div
            key={index}
            className="w-[420px] max-w-[420px] bg-slate-900 border border-sky-500/20 rounded-2xl p-8 flex flex-col gap-3 shadow-lg shadow-black/30 flex-shrink-0 hover:border-sky-400/40 transition-all duration-300"
          >
            {/* Logo */}
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-sky-500/20 flex items-center justify-center mb-2">
              <img
                src={exp.logo}
                alt={exp.company}
                className="w-10 h-10 object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-slate-100">
              {exp.title}
            </h3>

            {/* Company */}
            <p className="text-sky-400 font-semibold text-lg">
              {exp.company}
            </p>

            {/* Skill Icons */}
            <div className="flex gap-3 text-2xl">
              {exp.skills.map((skill, i) => (
                <span key={i}>{skill}</span>
              ))}
            </div>

            {/* Dates */}
            <p className="text-slate-500 text-xs tracking-widest uppercase mt-2">
              {exp.dates}
            </p>

            {/* Bullet Points */}
            <ul className="list-disc list-inside text-slate-300 text-sm leading-relaxed">
              {exp.points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
