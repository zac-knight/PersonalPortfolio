import { useMemo, useState } from 'react'
import { FaUsers, FaTools, FaCode, FaProjectDiagram, FaShieldAlt, FaStore } from 'react-icons/fa'
import { IconBox, LiveMeta, Painted, Reveal, SectionHeader, Window } from './ui'

const experiences = [
  {
    title: 'Founding President',
    company: 'QUT AI & ML Society',
    dates: 'May 2025 – Present',
    type: 'Volunteer',
    Icon: FaUsers,
    points: [
      "Founded and served as the first President, establishing the society's vision, governance, and operations to drive student engagement in AI and machine learning",
      'Grew the club to 300+ active members, achieving the highest engagement among QUT technology societies and earning feature placement on the QUT front page',
      'Directed and hosted the AIML Hackathon as Master of Ceremonies and lead organiser, delivering the largest standalone club hackathon in QUT history (115+ participants, 20 teams)',
      'Led the BANDS x AIML Industry Night as co-MC and organiser, connecting 110 students with 30+ industry organisations',
      'Launched the AIML Projects division, supporting structured, team-based machine learning initiatives',
      'Scaled digital presence to 740+ Instagram and 680+ LinkedIn followers within one year',
    ],
  },
  {
    title: 'Engineering Work Integrated Learning Placement',
    company: 'QUT Engineering Team',
    dates: 'Jul 2025 – Dec 2025',
    type: 'Work',
    Icon: FaTools,
    points: [
      'Supported the effective operation and supervision of engineering laboratory spaces, including the Launchpad Makerspace',
      'Provided hands-on technical guidance and debugging assistance for laser cutter software and digital fabrication workflows',
      'Assisted students by explaining the purpose, capabilities, and limitations of available tools and equipment',
      'Delivered guided site tours of the Launchpad Makerspace, introducing facilities, equipment, and usage protocols',
    ],
  },
  {
    title: 'Vice President',
    company: 'Code Network',
    dates: 'Mar 2025 – May 2025',
    type: 'Volunteer',
    Icon: FaCode,
    points: [
      'Led cross-functional initiatives coordinating efforts across Marketing, Events, and Industry Engagement departments',
      'Collaborated with the Marketing Team to design and launch 10+ digital and print graphics',
      'Developed a structured 12-month event calendar, achieving consistent attendance of 30-40 members throughout the semester',
      'Chaired 10 club events including guest speaker functions and member networking nights',
    ],
  },
  {
    title: 'Projects Officer',
    company: 'Code Network',
    dates: 'Oct 2024 – Mar 2025',
    type: 'Volunteer',
    Icon: FaProjectDiagram,
    points: [
      'Led the BetterTimetable project at QUT, enhancing the student experience through a more intuitive timetable-building platform',
      'Delivered automatic timetable generation, custom planning, and personalised schedule saving, attracting 30+ students to the project',
      "Built server-side operations to convert QUT's public course data into a structured internal API enabling real-time timetable generation",
    ],
  },
  {
    title: 'Software Developer Intern',
    company: 'Queensland Police Service',
    dates: 'Apr 2024 – Oct 2024',
    type: 'Work',
    Icon: FaShieldAlt,
    points: [
      'Collaborated in a multi-skilled Agile team to design and develop a large-scale web application using Next.js, TypeScript, and SQL for Specialist Investigators Training',
      'Planned and delivered 110 user stories across a 6-month timeline using 6 Release Plans and 12 Sprint Plans',
      'Delivered a communication platform, library system, and a revamped learning management system with role-based access',
      'Led user training with comprehensive guides, a 56-minute demo, and fortnightly client showcases',
    ],
  },
  {
    title: 'Sales Co-worker',
    company: 'IKEA',
    dates: 'Feb 2022 – Present',
    type: 'Work',
    Icon: FaStore,
    points: [
      'Increased sales by actively engaging with customers on the showroom floor and offering tailored solutions',
      "Utilised IKEA's sales and inventory tools daily to check stock, locate items, and ensure quick responses to customer inquiries",
      'Provided hands-on support in maintaining appealing, organised displays aligned with visual merchandising guidelines',
      'Assisted customers with self-serve technology, online ordering, and delivery options',
    ],
  },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "May 2025" → months since year 0; "Present" → current month
function toMonthIndex(label) {
  const now = new Date()
  if (label.trim() === 'Present') return now.getFullYear() * 12 + now.getMonth()
  const [mon, year] = label.trim().split(' ')
  return Number(year) * 12 + MONTHS.indexOf(mon)
}

const ranges = experiences.map(e => {
  const [start, end] = e.dates.split('–').map(toMonthIndex)
  return { start, end }
})

const sorted = experiences
  .map((e, i) => ({ ...e, ...ranges[i] }))
  .sort((a, b) => b.start - a.start || (a.type === 'Volunteer' ? -1 : 1))

const HEAT = ['#2a2723', '#4a4640', '#7a756e', '#b5afa7', '#e8e2d9']

function Heatmap() {
  const { years, max } = useMemo(() => {
    const first = Math.min(...ranges.map(r => r.start))
    const last = Math.max(...ranges.map(r => r.end))
    const firstYear = Math.floor(first / 12)
    const lastYear = Math.floor(last / 12)
    let max = 1
    const years = []
    for (let y = firstYear; y <= lastYear; y++) {
      const months = MONTHS.map((_, m) => {
        const idx = y * 12 + m
        if (idx < first || idx > last) return null
        const count = ranges.filter(r => idx >= r.start && idx <= r.end).length
        max = Math.max(max, count)
        return count
      })
      years.push({ year: y, months })
    }
    return { years, max }
  }, [])

  return (
    <div className="px-5 sm:px-8 py-6 border-t border-line">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <p className="text-ink">Activity · roles held per month</p>
        <div className="flex items-center gap-2 text-[11px] text-mute">
          Less
          {HEAT.slice(1).map(c => (
            <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
          More
        </div>
      </div>
      <div className="grid grid-cols-[36px_repeat(12,1fr)] gap-1">
        <span />
        {MONTHS.map(m => (
          <span key={m} className="text-[10px] text-mute text-center">{m[0]}</span>
        ))}
        {years.map(({ year, months }) => (
          <div key={year} className="contents">
            <span className="text-[11px] text-mute self-center font-mono">{year}</span>
            {months.map((count, m) => (
              <span
                key={m}
                title={count === null ? undefined : `${MONTHS[m]} ${year}: ${count} role${count === 1 ? '' : 's'}`}
                className="h-4 sm:h-5 rounded-[3px] transition-transform hover:scale-110"
                style={{
                  background: count === null ? 'transparent' : HEAT[Math.round((count / max) * (HEAT.length - 1))],
                  outline: count === null ? '1px dashed #2b2824' : undefined,
                  outlineOffset: '-1px',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Experience() {
  const [active, setActive] = useState(0)
  const exp = sorted[active]

  return (
    <section id="experience">
      <SectionHeader
        tag="02"
        label="Experience"
        title="A track record of leading, building and shipping."
        description="From founding the largest tech society at QUT to shipping production software for the Queensland Police Service. Pick a role to read its log."
        meta={<LiveMeta label="Now">President, QUT AI &amp; ML Society</LiveMeta>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] border-t border-line">
        {/* Log window */}
        <Reveal className="order-2 lg:order-1">
          <Painted variant="meadow" className="h-full px-4 sm:px-12 lg:px-20 xl:px-28 py-6 sm:py-8">
            <Window title={`${exp.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.log`}>
              <div className="px-5 sm:px-8 py-6 font-mono text-[12.5px] sm:text-[14px] leading-relaxed min-h-[340px]">
                <p className="text-mute">
                  → role <span className="text-gold">&quot;{exp.title}&quot;</span>
                </p>
                <p className="text-mute mb-3">
                  → at <span className="text-flame">{exp.company}</span> · {exp.type.toLowerCase()}
                </p>
                <ul key={active} className="flex flex-col gap-2">
                  {exp.points.map((point, i) => (
                    <li
                      key={i}
                      className="pixel flex gap-2.5 text-ink/90"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <span className="text-live shrink-0">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-mute mt-3">→ {exp.dates}</p>
              </div>
              <Heatmap />
            </Window>
          </Painted>
        </Reveal>

        {/* Role list */}
        <div className="order-1 lg:order-2 lg:border-l border-line">
          {sorted.map((e, i) => (
            <button
              key={e.title + e.company}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={`w-full text-left flex gap-4 sm:gap-5 px-6 sm:px-12 lg:px-20 xl:px-28 py-5 sm:py-6 dots-b transition-colors ${
                active === i ? 'bg-panel-2/50' : 'hover:bg-panel/60'
              }`}
            >
              <IconBox>
                <e.Icon size={16} />
              </IconBox>
              <div className="flex-1 min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className={`font-serif text-xl sm:text-2xl ${active === i ? 'text-ink' : 'text-ink/80'}`}>
                    {e.title}
                  </span>
                </p>
                <p className="mt-1 text-body">
                  {e.company}
                  <span className="text-mute"> · {e.dates}</span>
                </p>
              </div>
              <span
                className={`self-start mt-1 text-[11px] uppercase tracking-wide px-2 py-0.5 rounded border ${
                  e.type === 'Work' ? 'border-flame/40 text-flame' : 'border-live/40 text-live'
                }`}
              >
                {e.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
