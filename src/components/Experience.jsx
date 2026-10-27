import { useState } from 'react'
import { FaUsers, FaTools, FaCode, FaProjectDiagram, FaShieldAlt, FaStore, FaSeedling } from 'react-icons/fa'
import { IconBox, LiveMeta, Painted, Reveal, SectionHeader, Window } from './ui'
import useCompact from '../lib/useCompact'

const experiences = [
  {
    title: 'Work Integrated Learning Student',
    short: 'CRDC',
    results: [{ value: '86%', label: 'Tokens traced to one step' }, { value: '42 → 4', label: 'Model calls per question' }, { value: '6', label: 'Students led' }],
    skills: ['RAG', 'Python', 'FastAPI', 'Postgres + pgvector', 'LLM evaluation', 'Team leadership'],
    company: 'Cotton Research and Development Corporation',
    dates: 'Aug 2026 to Present',
    type: 'Work',
    Icon: FaSeedling,
    points: [
      "Leading Team 16, six QUT students across AI, Data Science and Cyber Security streams, on a QUT Industry Project extending CRDC's Cotton Knowledge Hub",
      'Led a code level audit of the production RAG pipeline across all twelve stages, tracing about 86% of tokens read per question to a single reranking step',
      'Designed a target architecture that cuts model calls from about 42 to 3 to 4 per question, at an estimated 95% lower cost per 1,000 questions',
      'Ran the weekly client cadence and set up a local development stack on Groq so the team could build without touching production services',
    ],
  },
  {
    title: 'Founding President',
    short: 'AIML President',
    results: [{ value: '300+', label: 'Members' }, { value: '115+', label: 'Hackathon participants' }, { value: '30+', label: 'Industry orgs' }],
    skills: ['Leadership', 'Governance', 'Event management', 'Public speaking', 'Sponsorship'],
    company: 'QUT AI & ML Society',
    dates: 'May 2025 to Present',
    type: 'Volunteer',
    Icon: FaUsers,
    points: [
      "Served as the society's founding President, helping establish its vision, governance, and operations to drive student engagement in AI and machine learning",
      'Awarded President of the Year at the QUT Guild Awards for leading the society from the ground up',
      "Featured in QUT Science, IT and Maths' Club Spotlight on the society's mission, project nights and community",
      "Named in the Australian Business Journal's 10 Australian AI Innovators Delivering Practical Solutions in 2026",
      'Contributed to AgentCamp 2026: Brisbane Edition, a full day community event on building, evaluating and deploying AI agents',
      'Grew the club to 300+ active members, achieving the highest engagement among QUT technology societies and earning feature placement on the QUT front page',
      'Directed and hosted the AIML Hackathon as Master of Ceremonies and lead organiser, delivering the largest standalone club hackathon in QUT history (115+ participants, 20 teams)',
      'Led the BANDS x AIML Industry Night as joint MC and organiser, connecting 110 students with 30+ industry organisations',
      'Launched the AIML Projects division, supporting structured, team based machine learning initiatives',
      'Scaled digital presence to 740+ Instagram and 680+ LinkedIn followers within one year',
    ],
  },
  {
    title: 'Engineering Work Integrated Learning Placement',
    short: 'QUT Engineering',
    results: [],
    skills: ['Digital fabrication', 'Laser cutter software', 'Technical support', 'Lab supervision'],
    company: 'QUT Engineering Team',
    dates: 'Jul 2025 to Dec 2025',
    type: 'Work',
    Icon: FaTools,
    points: [
      'Supported the effective operation and supervision of engineering laboratory spaces, including the Launchpad Makerspace',
      'Provided hands on technical guidance and debugging assistance for laser cutter software and digital fabrication workflows',
      'Assisted students by explaining the purpose, capabilities, and limitations of available tools and equipment',
      'Delivered guided site tours of the Launchpad Makerspace, introducing facilities, equipment, and usage protocols',
    ],
  },
  {
    title: 'Vice President',
    short: 'Code Network VP',
    results: [{ value: '10', label: 'Events chaired' }, { value: '10+', label: 'Graphics launched' }, { value: '30 to 40', label: 'Members per event' }],
    skills: ['Leadership', 'Event planning', 'Marketing', 'Cross functional coordination'],
    company: 'Code Network',
    dates: 'Mar 2025 to May 2025',
    type: 'Volunteer',
    Icon: FaCode,
    points: [
      'Led cross functional initiatives coordinating efforts across Marketing, Events, and Industry Engagement departments',
      'Collaborated with the Marketing Team to design and launch 10+ digital and print graphics',
      'Developed a structured 12 month event calendar, achieving consistent attendance of 30 to 40 members throughout the semester',
      'Chaired 10 club events including guest speaker functions and member networking nights',
    ],
  },
  {
    title: 'Projects Officer',
    short: 'Code Network Projects',
    results: [{ value: '30+', label: 'Students engaged' }],
    skills: ['API development', 'Data processing', 'Scheduling algorithms', 'Project leadership'],
    company: 'Code Network',
    dates: 'Oct 2024 to Mar 2025',
    type: 'Volunteer',
    Icon: FaProjectDiagram,
    points: [
      'Led the BetterTimetable project at QUT, enhancing the student experience through a more intuitive timetable building platform',
      'Delivered automatic timetable generation, custom planning, and personalised schedule saving, attracting 30+ students to the project',
      "Built server side operations to convert QUT's public course data into a structured internal API enabling real time timetable generation",
    ],
  },
  {
    title: 'Work Integrated Learning Student',
    short: 'QPS',
    results: [{ value: '110', label: 'User stories delivered' }, { value: '12', label: 'Sprint plans' }, { value: '56 min', label: 'Training demo' }],
    skills: ['Next.js', 'TypeScript', 'SQL', 'Agile', 'User training'],
    company: 'Queensland Police Service',
    dates: 'Apr 2024 to Oct 2024',
    type: 'Work',
    Icon: FaShieldAlt,
    points: [
      'Collaborated in a multiskilled Agile team to design and develop a large scale web application using Next.js, TypeScript, and SQL for Specialist Investigators Training',
      'Planned and delivered 110 user stories across a six month timeline using 6 Release Plans and 12 Sprint Plans',
      'Delivered a communication platform, library system, and a revamped learning management system with role based access',
      'Led user training with comprehensive guides, a 56 minute demo, and fortnightly client showcases',
    ],
  },
  {
    title: 'Sales Coworker',
    short: 'IKEA',
    results: [],
    skills: ['Customer service', 'Inventory systems', 'Visual merchandising', 'Communication'],
    company: 'IKEA',
    dates: 'Feb 2022 to Present',
    type: 'Work',
    Icon: FaStore,
    points: [
      'Increased sales by actively engaging with customers on the showroom floor and offering tailored solutions',
      "Utilised IKEA's sales and inventory tools daily to check stock, locate items, and ensure quick responses to customer inquiries",
      'Provided hands on support in maintaining appealing, organised displays aligned with visual merchandising guidelines',
      'Assisted customers with self serve technology, online ordering, and delivery options',
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
  const [start, end] = e.dates.split(' to ').map(toMonthIndex)
  return { start, end }
})

// Current roles first, then by most recently concluded; ties go to the newer start
const sorted = experiences
  .map((e, i) => ({ ...e, ...ranges[i] }))
  .sort((a, b) => b.end - a.end || b.start - a.start)

// Total span of months as "1 yr 4 mos"
function formatSpan(months) {
  const y = Math.floor(months / 12)
  const m = months % 12
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ') || '< 1 mo'
}

function RoleSummary({ role }) {
  const stats = [{ value: formatSpan(role.end - role.start + 1), label: role.end >= toMonthIndex('Present') ? 'So far' : 'Duration' }, ...role.results]
  return (
    <div key={role.title + role.company} className="px-6 sm:px-10 py-6 border-t border-line">
      <p className="text-ink">At a glance · {role.company}</p>
      <dl className={`mt-4 grid gap-px rounded-lg overflow-hidden border border-line bg-line ${stats.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
        {stats.map((s, i) => (
          <div key={s.label} className="pixel bg-panel px-4 py-4" style={{ animationDelay: `${i * 70}ms` }}>
            <dd className="font-serif text-2xl text-ink tabular-nums leading-tight">{s.value}</dd>
            <dt className="mt-1 text-[11px] uppercase tracking-wide text-mute">{s.label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-5 mb-3 text-[11px] uppercase tracking-wide text-mute">Skills used</p>
      <ul className="flex flex-wrap gap-2">
        {role.skills.map((skill, i) => (
          <li
            key={skill}
            className="pixel px-2.5 py-1.5 rounded-md border border-line bg-panel-2/50 text-[13px] text-ink/90"
            style={{ animationDelay: `${150 + i * 50}ms` }}
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Experience() {
  const [active, setActive] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const compact = useCompact()
  const exp = sorted[active]
  const PREVIEW = 2
  const points = compact && !showAll ? exp.points.slice(0, PREVIEW) : exp.points
  const hidden = exp.points.length - PREVIEW

  const selectRole = i => {
    setActive(i)
    setShowAll(false)
  }

  return (
    <section id="experience">
      <SectionHeader
        tag="02"
        label="Experience"
        title="A track record of leading, building and shipping."
        description="From leading a RAG industry project with CRDC and serving as founding President of one of QUT's most active tech societies, to shipping production software for the Queensland Police Service. Pick a role to read its log."
        meta={<LiveMeta label="Now">President, QUT AI &amp; ML Society</LiveMeta>}
      />

      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pb-14 sm:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] rounded-lg border border-line overflow-hidden">
        {/* Log window */}
        {/* Role tabs (mobile) */}
        <div className="lg:hidden flex flex-wrap gap-2 px-4 py-4 border-b border-line">
          {sorted.map((e, i) => (
            <button
              key={e.title + e.company}
              onClick={() => selectRole(i)}
              aria-pressed={active === i}
              className={`shrink-0 rounded-md border px-3 py-2 text-[13px] transition-colors ${
                active === i ? 'border-cream bg-cream text-canvas' : 'border-line text-body'
              }`}
            >
              {e.short}
            </button>
          ))}
        </div>

        <Reveal className="min-w-0">
          <Painted variant="meadow" className="h-full px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
            <Window title={`${exp.company.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.log`}>
              <div className="px-5 sm:px-8 py-6 font-mono text-[12.5px] sm:text-[14px] leading-relaxed min-h-[340px]">
                <p className="text-mute">
                  → role <span className="text-gold">&quot;{exp.title}&quot;</span>
                </p>
                <p className="text-mute mb-3">
                  → at <span className="text-flame">{exp.company}</span> · {exp.type.toLowerCase()}
                </p>
                <ul key={active} className="flex flex-col gap-2">
                  {points.map((point, i) => (
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
                {compact && hidden > 0 && (
                  <button
                    onClick={() => setShowAll(v => !v)}
                    aria-expanded={showAll}
                    className="mt-3 text-[13px] text-flame hover:text-ink transition-colors"
                  >
                    {showAll ? '− show less' : `+ show all ${exp.points.length} points`}
                  </button>
                )}
                <p className="text-mute mt-3">→ {exp.dates}</p>
              </div>
              <RoleSummary role={exp} />
            </Window>
          </Painted>
        </Reveal>

        {/* Role list */}
        <div className="hidden lg:block border-l border-line">
          {sorted.map((e, i) => (
            <button
              key={e.title + e.company}
              onClick={() => selectRole(i)}
              aria-pressed={active === i}
              className={`w-full text-left flex gap-4 sm:gap-5 px-5 sm:px-8 py-5 sm:py-6 dots-b transition-colors ${
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
      </div>
    </section>
  )
}
