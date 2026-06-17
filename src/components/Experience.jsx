import { FaHouse } from 'react-icons/fa6'

const experiences = [
  {
    title: 'Founding President',
    company: 'QUT AI & ML Society',
    dates: 'May 2025 – Present',
    type: 'Volunteer',
    points: [
      'Founded and established the society, defining vision, governance, and operations',
      'Grew the club to 200+ active members, achieving the highest engagement among QUT tech societies',
      'Directed and hosted the AIML Hackathon as lead organiser and MC (115+ participants, 20 teams)',
      'Scaled digital presence to 700+ Instagram and 550+ LinkedIn followers',
    ],
  },

  {
    title: 'Vice President (formerly Projects Officer)',
    company: 'Code Network',
    dates: 'Oct 2024 – May 2025',
    type: 'Volunteer',
    points: [
      'Promoted from Projects Officer to Vice President after leading the BetterTimetable initiative',
      'As Projects Officer, built BetterTimetable, converting QUT course data into a structured API for timetable generation',
      'As Vice President I chaired 10+ events, coordinated Marketing, Events, and Industry Engagement teams',
    ],
  },

  {
    title: 'Engineering Work Experience Student',
    company: 'QUT Engineering Team',
    dates: 'Jul 2025 – Nov 2025',
    type: 'Work',
    points: [
      'Supported CAD-to-prototype workflows across digital fabrication environments',
      'Operated LaunchPad makerspace and ensured safety compliance',
      'Assisted students with technical troubleshooting and equipment usage',
    ],
  },

  {
    title: 'IT Work Experience Student',
    company: 'Queensland Police Service',
    dates: 'Apr 2024 – Oct 2024',
    type: 'Work',
    points: [
      'Built a large-scale web application using Next.js, TypeScript, and SQL in Agile team',
      'Delivered 110 user stories across structured release and sprint planning cycles',
      'Developed communication, content, and learning modules for training platform',
      'Led onboarding via documentation, training sessions, and live demos',
    ],
  },

  {
    title: 'Sales Co-worker',
    company: 'IKEA',
    dates: 'Feb 2022 – Present',
    type: 'Work',
    points: [
      'Improved customer experience through tailored in-store solutions',
      'Maintained organised showroom displays aligned with brand standards',
      'Supported product discovery, ordering, and delivery systems',
    ],
  },
]

const typeColors = {
  Work: 'text-sky-400 border-sky-500/30',
  Volunteer: 'text-emerald-400 border-emerald-500/30',
}

// Parse end date properly (handles "Present")
const parseEndDate = (dates) => {
  if (dates.includes('Present')) {
    return new Date(8640000000000000) // max JS date
  }

  const end = dates.split('–')[1].trim()
  return new Date(end)
}

// Sort experiences by most recent finish date
const sortedExperiences = [...experiences].sort((a, b) => {
  const dateDiff = parseEndDate(b.dates) - parseEndDate(a.dates)

  if (dateDiff !== 0) return dateDiff

  // tie-breaker: Volunteer first
  const priority = {
    Volunteer: 1,
    Work: 2,
  }

  return priority[a.type] - priority[b.type]
})

export default function Experience() {
  return (
    <section
      id="experience"
      className="min-h-screen w-full bg-[#0a0a0a] snap-start flex flex-col items-center justify-center relative py-20"
    >
      {/* Title */}
      <div className="mb-10">
        <p className="text-slate-400 tracking-[0.3em] text-sm uppercase">
          E X P E R I E N C E
        </p>
      </div>

      {/* Cards */}
      <div className="flex gap-6 overflow-x-auto w-full px-16 pb-6 no-scrollbar">
        {sortedExperiences.map((exp, index) => (
          <div
            key={index}
            className="w-[420px] bg-slate-900 border border-sky-500/20 rounded-2xl p-8 flex flex-col gap-3 shadow-lg shadow-black/30 flex-shrink-0 hover:border-sky-400/40 transition-all duration-300"
          >
            {/* Type badge */}
            <span
              className={`self-start text-xs tracking-widest uppercase border rounded-full px-3 py-1 ${
                typeColors[exp.type]
              }`}
            >
              {exp.type}
            </span>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-100">
              {exp.title}
            </h3>

            {/* Company */}
            <p className="text-sky-400 font-semibold text-base">
              {exp.company}
            </p>

            {/* Dates */}
            <p className="text-slate-500 text-xs tracking-widest uppercase">
              {exp.dates}
            </p>

            {/* Bullet Points */}
            <ul className="list-disc list-inside text-slate-300 text-sm leading-relaxed flex flex-col gap-1">
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