import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { LiveMeta, Painted, Reveal, SectionHeader, Window } from './ui'

const courses = [
  'IFB102 Introduction to Computer Systems',
  'IFB103 IT Systems Design',
  'IFB104 Building IT Systems',
  'IFB105 Database Management',
  'CAB201 Programming Principles',
  'CAB202 Microprocessors and Digital Systems',
  'CAB210 User Experience Fundamentals',
  'IAB207 Rapid Web Application Development',
  'CAB203 Discrete Structures',
  'CAB230 Web Computing',
  'CAB302 Software Development',
  'IAB230 Design of Enterprise IoT',
  'CAB222 Networks',
  'CAB432 Cloud Computing',
  'IFB295 IT Project Management',
  'MXB103 Introductory Computational Mathematics',
  'CAB301 Algorithms and Complexity',
  'CAB320 Artificial Intelligence',
  'CAB420 Machine Learning',
  'IFB398 Capstone Project (Phase 1)',
  'IFB240 Cyber Security',
  'MZB125 Introductory Engineering Mathematics',
  'CAB403 Systems Programming',
  'IFB399 Capstone Project (Phase 2)',
  'EGB101 Engineering Design and Prof. Practice',
  'EGB120 Foundations of Electrical Engineering',
  'IFB452 Blockchain Technology',
  'MZB127 Engineering Mathematics and Statistics',
  'CAB401 High Performance & Parallel Computing',
  'MZB221 Electrical Engineering Mathematics',
]

// Master of Artificial Intelligence units completed so far
const masterCourses = [
  'MXN500 Introduction to Statistics for Data Science',
  'IFN500 Introduction to Data Science',
  'INN700 Introduction to Research',
  'IFN521 Trust and Artificial Intelligence',
]

// The full Master of AI unit set. Completed units carry their QUT code; the rest
// show a status instead.
const MASTER_UNITS = [
  { code: 'IFN500', title: 'Introduction to Data Science', done: true },
  { code: 'MXN500', title: 'Introduction to Statistics for Data Science', done: true },
  { code: 'INN700', title: 'Introduction to Research', done: true },
  { code: 'IFN521', title: 'Trust and Artificial Intelligence', done: true },
  { title: 'Advanced Machine Learning', status: 'now' },
  { title: 'Industry Project (Phase 1)', status: 'now' },
  { title: 'Human Centred Design of IT Systems', status: 'now' },
  { title: 'Cyber Security and Governance', status: 'now' },
  { title: 'Industry Project (Phase 2)' },
  { title: 'Machine Learning for NLP' },
  { title: 'Software Lifecycle Management' },
]

const byCode = (a, b) => a.localeCompare(b)

const UNIT_GROUPS = [
  { path: '~/master_of_ai/', label: 'Master of Artificial Intelligence', units: [...masterCourses].sort(byCode) },
  { path: '~/bit/', label: 'Bachelor of Information Technology', units: [...courses].sort(byCode) },
]

const totalUnits = courses.length + masterCourses.length

const DISCIPLINES = [
  { label: 'Computer Science', prefixes: ['CAB'] },
  { label: 'IT', prefixes: ['IFB', 'IAB'] },
  { label: 'Engineering', prefixes: ['EGB'] },
].map(d => ({ ...d, count: courses.filter(c => d.prefixes.includes(c.slice(0, 3))).length }))

const KEY_BACHELOR_UNITS = ['CAB420', 'CAB320', 'CAB301', 'CAB432', 'CAB401', 'CAB302']

const findUnits = codes => codes.map(code => courses.find(c => c.startsWith(code)))

const DEGREES = [
  {
    file: 'master_of_ai.md',
    variant: 'meadow',
    status: 'In progress',
    live: true,
    name: 'Master of Artificial Intelligence',
    dates: 'Feb 2026 to Jul 2027 (expected)',
    summary: 'Postgraduate study across advanced machine learning, NLP, data science, trust and governance in AI, human centred design, and an industry project with CRDC.',
    unitsTitle: 'Degree units',
    units: MASTER_UNITS,
    facts: [
      ['Level', 'Postgraduate'],
      ['Progress', `${masterCourses.length} units completed`],
      ['GPA', '6.5 / 7.0'],
    ],
  },
  {
    file: 'bachelor_of_it.md',
    variant: 'dusk',
    status: 'Graduated Nov 2025',
    name: 'Bachelor of Information Technology',
    dates: 'Feb 2022 to Nov 2025',
    summary: 'A Computer Science major with an Engineering Foundations minor, covering microprocessors and networks through to cloud, AI and machine learning.',
    unitsTitle: 'Key units',
    units: findUnits(KEY_BACHELOR_UNITS),
    breadth: DISCIPLINES.map(d => `${d.count} ${d.label}`).join(' · '),
    facts: [
      ['Major', 'Computer Science'],
      ['Minor', 'Engineering Foundations'],
      ['Completed', `${courses.length} units`],
      ['GPA', '6.6 / 7.0'],
    ],
  },
]

function DegreeCard({ file, variant, status, live, name, dates, summary, unitsTitle, units, breadth, facts }) {
  return (
    <article className="spot h-full flex flex-col rounded-lg overflow-hidden bg-panel border border-line transition-shadow duration-500 hover:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)]">
      <Painted variant={variant} className="px-5 pt-5 lg:px-4 lg:pt-4 short:pt-3">
        <Window title={file} className="rounded-b-none border-b-0 shadow-none">
          <div className="px-5 sm:px-6 py-5 lg:py-4 short:py-3">
            <p className="mb-4 lg:mb-2.5 text-[12px] uppercase tracking-wide text-mute">{unitsTitle}</p>
            <ul className="flex flex-col gap-2.5 lg:gap-1.5 short:gap-1">
              {units.map(unit => {
                // Units are "CODE Title" strings, or { code?, title, done?, status? }
                const u = typeof unit === 'string'
                  ? { code: unit.split(' ')[0], title: unit.split(' ').slice(1).join(' '), done: true }
                  : unit
                return (
                  <li key={u.title} className="group/unit grid grid-cols-[64px_1fr] gap-3 text-[14px] lg:text-[13px] transition-transform duration-300 hover:translate-x-1.5">
                    <span className={`font-mono ${u.code ? 'text-flame' : u.status ? 'text-live text-[11px] uppercase pt-0.5' : 'text-mute'}`}>
                      {u.code || u.status || '·'}
                    </span>
                    <span className={u.done || u.status ? 'text-ink/90' : 'text-body'}>{u.title}</span>
                  </li>
                )
              })}
            </ul>
            {breadth && <p className="mt-5 lg:mt-3 font-mono text-[11px] uppercase tracking-wide text-mute">{breadth}</p>}
          </div>
        </Window>
      </Painted>
      <div className="flex flex-col gap-4 lg:gap-2.5 short:gap-2 px-6 py-6 lg:py-4 short:py-3 flex-1">
        <p className="flex items-center gap-2 text-[13px]">
          <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-live' : 'bg-mute'}`} />
          <span className={live ? 'text-live' : 'text-body'}>{status}</span>
          <span className="text-mute">· {dates}</span>
        </p>
        <h3 className="font-serif text-2xl sm:text-3xl lg:text-[26px] text-ink leading-tight">{name}</h3>
        <p className="text-body leading-relaxed lg:text-[15px] lg:leading-normal">{summary}</p>
        <dl className="mt-2 lg:mt-1 rounded-lg border border-line overflow-hidden">
          {facts.map(([term, value], i) => (
            <div
              key={term}
              className={`grid grid-cols-[90px_1fr] gap-3 sm:gap-4 px-4 py-2.5 lg:py-1.5 short:py-1 font-mono text-[12px] uppercase tracking-wide ${
                i > 0 ? 'border-t border-line' : ''
              }`}
            >
              <dt className="text-mute">{term}</dt>
              <dd className="text-ink/90">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}

export default function Education() {
  const [open, setOpen] = useState(false)

  return (
    <section id="education">
      <SectionHeader
        tag="03"
        label="Education"
        title="Grounded in computer science, focused on AI."
        description="A Computer Science major from QUT, now deepening into artificial intelligence with a master's degree spanning advanced machine learning, NLP, data science and an industry project with CRDC."
        meta={<LiveMeta label="Enrolled">QUT, Brisbane</LiveMeta>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 sm:px-12 lg:px-20 xl:px-28">
        {DEGREES.map((degree, i) => (
          <Reveal key={degree.name} delay={i * 100} className="flex">
            <div className="flex-1">
              <DegreeCard {...degree} />
            </div>
          </Reveal>
        ))}
      </div>

      {/* Unit list */}
      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pt-5 pb-14 sm:pb-20">
        <div className="rounded-lg border border-line bg-panel">
          <button
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="flex items-center gap-3">
              <span className="font-mono text-[13px] text-mute">~/units/</span>
              <span className="text-ink">All {totalUnits} completed units</span>
              <span className="hidden sm:inline text-[13px] text-mute">
                {masterCourses.length} Master · {courses.length} Bachelor
              </span>
            </span>
            <FaChevronDown
              size={12}
              className={`text-body transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open && UNIT_GROUPS.map(group => (
            <div key={group.path} className="drop-in px-6 pb-6 pt-4 border-t border-line">
              <p className="flex items-baseline gap-3 text-[13px]">
                <span className="font-mono text-mute">{group.path}</span>
                <span className="text-ink">{group.label}</span>
                <span className="text-mute">· {group.units.length} units</span>
              </p>
              {/* Columns fill top to bottom, so the code order reads down each column */}
              <ul className="columns-1 sm:columns-2 lg:columns-3 gap-x-8 pt-2">
                {group.units.map((course, i) => {
                  const [code, ...name] = course.split(' ')
                  return (
                    <li key={course} className="pixel break-inside-avoid flex gap-3 text-[13px] py-2.5" style={{ animationDelay: `${i * 25}ms` }}>
                      <span className="font-mono text-flame shrink-0">{code}</span>
                      <span className="text-body">{name.join(' ')}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
