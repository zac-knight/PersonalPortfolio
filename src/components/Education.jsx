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
  'IFB399 IT Capstone Project (Phase 2)',
  'EGB101 Engineering Design and Prof. Practice',
  'EGB120 Foundations of Electrical Engineering',
  'IFB452 Blockchain Technology',
  'MZB127 Engineering Mathematics and Statistics',
  'CAB401 High Performance & Parallel Computing',
  'MZB221 Electrical Engineering Mathematics',
]

const sortedCourses = [...courses].sort((a, b) => a.localeCompare(b))

const DISCIPLINES = [
  { label: 'Computer Science', prefixes: ['CAB'] },
  { label: 'Information Tech', prefixes: ['IFB', 'IAB'] },
  { label: 'Mathematics', prefixes: ['MXB', 'MZB'] },
  { label: 'Engineering', prefixes: ['EGB'] },
].map(d => ({ ...d, count: courses.filter(c => d.prefixes.includes(c.slice(0, 3))).length }))

const GPA = 6.6
const GPA_MAX = 7

// Master of AI: Feb 2026 → Jul 2027
const MASTERS_START = new Date(2026, 1, 1)
const MASTERS_END = new Date(2027, 6, 31)

// ── Charts ────────────────────────────────────────────────────────────────────
function Gauge({ value, max, segments = 22 }) {
  const filled = Math.round((value / max) * segments)
  const cx = 150
  const cy = 150
  return (
    <svg viewBox="0 0 300 175" className="w-full max-w-[300px] mx-auto" role="img" aria-label={`GPA ${value} out of ${max}`}>
      {Array.from({ length: segments }, (_, i) => {
        const a = Math.PI - (i + 0.5) * (Math.PI / segments)
        const x1 = cx + Math.cos(a) * 92
        const y1 = cy - Math.sin(a) * 92
        const x2 = cx + Math.cos(a) * 132
        const y2 = cy - Math.sin(a) * 132
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i < filled ? '#55514b' : '#2b2824'}
            strokeWidth="14"
            strokeLinecap="round"
          >
            <title>{i < filled ? 'Achieved' : 'Remaining'}</title>
          </line>
        )
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-ink font-sans" fontSize="40" fontWeight="600">
        {value}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="fill-body font-sans" fontSize="13">
        GPA out of {max.toFixed(1)}
      </text>
    </svg>
  )
}

function DisciplineBars() {
  const max = Math.max(...DISCIPLINES.map(d => d.count))
  return (
    <div className="flex flex-col gap-3.5">
      {DISCIPLINES.map(d => (
        <div key={d.label} className="grid grid-cols-[110px_1fr_24px] items-center gap-3 group" title={`${d.label}: ${d.count} units`}>
          <span className="text-[13px] text-body text-right">{d.label}</span>
          <span className="h-8 rounded bg-panel-2 overflow-hidden">
            <span
              className="block h-full rounded bg-[#4a4640] group-hover:bg-[#6a655e] transition-colors"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </span>
          <span className="text-[13px] text-ink tabular-nums">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

function Progress() {
  const now = new Date()
  const pct = Math.max(0, Math.min(1, (now - MASTERS_START) / (MASTERS_END - MASTERS_START)))
  const blocks = 24
  const filled = Math.round(pct * blocks)
  return (
    <div className="flex flex-col gap-5">
      <p className="text-5xl text-ink font-semibold tabular-nums">
        {Math.round(pct * 100)}
        <span className="text-2xl text-body">%</span>
      </p>
      <div className="grid grid-cols-12 gap-1.5" role="img" aria-label={`${Math.round(pct * 100)}% of the degree elapsed`}>
        {Array.from({ length: blocks }, (_, i) => (
          <span key={i} className={`h-6 rounded-[3px] ${i < filled ? 'bg-[#7a756e]' : 'bg-panel-2'}`} />
        ))}
      </div>
      <div className="flex justify-between text-[12px] text-mute">
        <span>Feb 2026</span>
        <span>Jul 2027</span>
      </div>
    </div>
  )
}

const CARDS = [
  {
    variant: 'dusk',
    chartTitle: 'Bachelor of IT · final GPA',
    chart: <Gauge value={GPA} max={GPA_MAX} />,
    footer: ['Pass: 4.0', 'Max: 7.0'],
    title: 'Bachelor of Information Technology',
    body: 'Queensland University of Technology, Feb 2022 – Nov 2025. Major in Computer Science, minor in Engineering Foundations.',
  },
  {
    variant: '',
    chartTitle: 'Units by discipline',
    chartMeta: `${courses.length} units`,
    chart: <DisciplineBars />,
    title: 'Breadth across the stack',
    body: 'From microprocessors and networks to cloud, AI and machine learning — with a strong mathematics core.',
  },
  {
    variant: 'meadow',
    chartTitle: 'Master of AI · progress',
    chartMeta: 'GPA TBD',
    chart: <Progress />,
    title: 'Master of Artificial Intelligence',
    body: 'Queensland University of Technology, Feb 2026 – present. Expected completion July 2027.',
  },
]

export default function Education() {
  const [open, setOpen] = useState(false)

  return (
    <section id="education">
      <SectionHeader
        tag="03"
        label="Education"
        title="Grounded in computer science, focused on AI."
        description="A Computer Science major from QUT, now deepening into artificial intelligence with a master's degree — theory, mathematics and plenty of shipped assignments."
        meta={<LiveMeta label="Enrolled">QUT, Brisbane</LiveMeta>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-6 sm:px-12 lg:px-20 xl:px-28">
        {CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 100} className="flex flex-col rounded-lg overflow-hidden bg-panel border border-line">
            <Painted variant={card.variant} className="px-5 pt-5">
              <Window className="rounded-b-none border-b-0 shadow-none">
                <div className="px-5 sm:px-6 pt-5 pb-6 min-h-[270px] flex flex-col">
                  <div className="flex items-baseline justify-between gap-3 mb-6">
                    <p className="text-ink">{card.chartTitle}</p>
                    {card.chartMeta && <p className="text-[13px] text-body">{card.chartMeta}</p>}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">{card.chart}</div>
                  {card.footer && (
                    <div className="flex justify-between text-[13px] text-body mt-2">
                      {card.footer.map(f => <span key={f}>{f}</span>)}
                    </div>
                  )}
                </div>
              </Window>
            </Painted>
            <div className="px-6 py-6">
              <h3 className="font-serif text-2xl text-ink">{card.title}</h3>
              <p className="mt-3 text-body leading-relaxed">{card.body}</p>
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
              <span className="font-mono text-[13px] text-mute">~/bit/</span>
              <span className="text-ink">All {courses.length} completed units</span>
            </span>
            <FaChevronDown
              size={12}
              className={`text-body transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5 px-6 pb-6 pt-2 border-t border-line">
              {sortedCourses.map(course => {
                const [code, ...name] = course.split(' ')
                return (
                  <li key={course} className="flex gap-3 text-[13px] pt-2.5">
                    <span className="font-mono text-flame shrink-0">{code}</span>
                    <span className="text-body">{name.join(' ')}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
