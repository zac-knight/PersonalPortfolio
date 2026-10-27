import { useState } from 'react'
import { FaRegCheckCircle, FaRegFileAlt } from 'react-icons/fa'
import { HiOutlineSearch } from 'react-icons/hi'
import { LiveDot, LiveMeta, Painted, Reveal, SectionHeader, Window } from './ui'
import AboutChapters from './AboutChapters'

const FILES = {
  'about.ts': [
    'import { Curiosity, Leadership } from "./traits"',
    'import { openTo } from "./goals"',
    '',
    'export const zac = {',
    '  name: "Zac Knight",',
    '  location: "Brisbane, QLD",',
    '  role: "Master of AI student",',
    '-  status: "undergrad",',
    '+  status: "postgrad",',
    '  bachelor: { major: "Comp Sci", gpa: 6.6 },',
    '+  masters: { field: "AI", gpa: 6.5 },',
    '+  foundingPresident: "QUT AI & ML Society",',
    '  traits: [Curiosity, Leadership],',
    '}',
    '',
    'export function nextRole(): Role {',
    '+  return pick(openTo.roles)',
    '}',
  ],
  'goals.ts': [
    '// What I am optimising for',
    'export const goals: Goal[] = [',
    '  "Ship ML systems to production",',
    '  "Grow as a software engineer",',
    '  "Build communities around AI",',
    '+  "Contribute meaningful solutions",',
    ']',
    '',
    'export const openTo = {',
    '  roles: ["AI / ML", "Data science", "Software", "Systems"],',
    '  location: "Brisbane / Remote",',
    '+  available: true,',
    '}',
  ],
}

const TIMELINE = [
  { label: 'BIT, Computer Science (graduated)', time: '2022–25', done: true },
  { label: 'QPS work integrated learning', time: '2024', done: true },
  { label: 'Founding President, QUT AI & ML Society', time: '2025', done: true },
  { label: 'CRDC industry project (team leader)', time: 'now', done: false },
  { label: 'Master of Artificial Intelligence', time: 'now', done: false },
]

const SIDEBAR = [
  {
    heading: 'In progress 2',
    items: [
      { title: 'Master of AI', sub: 'GPA 6.5 · Expected Jul 2027', time: 'Now', live: true },
      { title: 'CRDC Industry Project', sub: 'RAG optimisation · Team lead', time: 'Now', live: true },
    ],
  },
  {
    heading: 'Milestones 5',
    items: [
      { title: 'President of the Year', sub: 'QUT Guild Awards', time: '2026' },
      { title: 'Top 10 AI Innovators', sub: 'Australian Business Journal', time: '2026' },
      { title: 'Bachelor of IT', sub: 'Graduated · GPA 6.6', time: '2025' },
      { title: 'AIML Hackathon', sub: '115+ hackers · 20 teams', time: '2025' },
      { title: 'QPS Resource Hub', sub: '110 user stories', time: '2024' },
    ],
  },
]

const TOKEN = /(\/\/.*$)|("[^"]*")|\b(import|from|export|const|function|return|true|false)\b|\b([A-Z][A-Za-z]*)\b|\b(\d+(?:\.\d+)?)\b/g
const TOKEN_CLASS = ['text-mute', 'text-[#e9dba6]', 'text-[#f0a17a]', 'text-[#6fd6b8]', 'text-[#c9a2f0]']

function highlight(code) {
  const parts = []
  let last = 0
  for (const m of code.matchAll(TOKEN)) {
    if (m.index > last) parts.push(code.slice(last, m.index))
    const group = m.slice(1).findIndex(Boolean)
    parts.push(<span key={m.index} className={TOKEN_CLASS[group]}>{m[0]}</span>)
    last = m.index + m[0].length
  }
  parts.push(code.slice(last))
  return parts
}

function CodePane() {
  const names = Object.keys(FILES)
  const [file, setFile] = useState(names[0])
  let lineNo = 40

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-stretch h-11 border-b border-line text-[13px]">
        {names.map(name => (
          <button
            key={name}
            onClick={() => setFile(name)}
            className={`flex items-center gap-2 px-4 border-r border-line transition-colors ${
              file === name ? 'text-ink bg-panel-2/60' : 'text-mute hover:text-body'
            }`}
          >
            <FaRegFileAlt size={11} />
            {name}
          </button>
        ))}
        <span className="ml-auto flex items-center px-4 text-mute">
          <HiOutlineSearch size={14} />
        </span>
      </div>
      <pre className="font-mono text-[12px] sm:text-[13px] leading-[2] py-3 overflow-x-auto no-scrollbar">
        {FILES[file].map((raw, i) => {
          const sign = raw[0] === '+' || raw[0] === '-' ? raw[0] : ''
          const code = sign ? raw.slice(1) : raw
          if (sign !== '-') lineNo++
          return (
            <div
              key={`${file}-${i}`}
              className={`flex pr-4 ${
                sign === '+' ? 'bg-live/[0.07]' : sign === '-' ? 'bg-rose/[0.08]' : ''
              }`}
            >
              <span className="w-12 shrink-0 text-right pr-4 text-mute select-none">
                {sign === '-' ? '' : lineNo}
              </span>
              <span className={`w-4 shrink-0 select-none ${sign === '+' ? 'text-live' : 'text-rose'}`}>
                {sign === '+' ? '+' : sign === '-' ? '–' : ''}
              </span>
              <code className="text-ink/90 whitespace-pre">{highlight(code)}</code>
            </div>
          )
        })}
      </pre>
    </div>
  )
}

export default function About() {
  return (
    <section id="about">
      <SectionHeader
        tag="01"
        label="About"
        title="Curious about AI, and the people who build with it."
        description="Computer Science graduate, Master of AI postgrad and founding president of a student society — equally at home training a model, shipping a full-stack app, or MC-ing a hackathon."
        meta={<LiveMeta>Brisbane, Australia</LiveMeta>}
      />

      <Reveal className="px-0 sm:px-12 lg:px-20 xl:px-28">
        <Painted className="px-3 sm:px-8 pt-6 sm:pt-8">
          <Window title="zacknight.dev — Desktop" className="rounded-b-none">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] xl:grid-cols-[240px_1fr_1.15fr] text-sm">
              {/* Sidebar */}
              <aside className="hidden xl:flex flex-col border-r border-line">
                <img
                  src={`${import.meta.env.BASE_URL}profile.png`}
                  alt="Zac Knight"
                  className="w-full aspect-[1.39] object-cover grayscale contrast-110"
                />
                {SIDEBAR.map(group => (
                  <div key={group.heading} className="py-4">
                    <p className="px-4 pb-2 text-[12px] uppercase tracking-wide text-mute">{group.heading}</p>
                    {group.items.map(item => (
                      <div key={item.title} className="flex gap-3 px-4 py-2.5 hover:bg-panel-2/60">
                        {item.live ? (
                          <LiveDot className="mt-1.5 mx-[3px]" />
                        ) : (
                          <FaRegCheckCircle size={12} className="mt-1 text-mute shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-ink/90 truncate">{item.title}</p>
                          <p className="text-[11px] text-mute truncate">{item.sub}</p>
                        </div>
                        <span className="text-[11px] text-mute">{item.time}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </aside>

              {/* Narrative */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-line">
                <div className="flex items-center justify-between h-11 px-4 border-b border-line">
                  <p className="text-ink">about(Zac): background</p>
                  <span className="flex items-center gap-1.5 text-[11px] text-live">
                    <LiveDot /> Live
                  </span>
                </div>
                <div className="flex flex-col gap-3 p-4">
                  <p className="rounded-md border border-line bg-panel-2/40 p-4 text-ink/90 leading-relaxed">
                    I am a Computer Science graduate pursuing a Master of Artificial Intelligence at
                    QUT — passionate about software development, machine learning, and building
                    solutions with real-world impact.
                  </p>
                  <div className="rounded-md border border-line bg-panel-2/40 p-4">
                    <p className="text-ink mb-3">Zac · timeline</p>
                    <ul className="flex flex-col gap-2.5">
                      {TIMELINE.map(t => (
                        <li key={t.label} className="flex items-center gap-3 text-body">
                          {t.done ? (
                            <span className="w-2 h-2 rounded-full bg-live" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                          )}
                          <span className="flex-1">{t.label}</span>
                          <span className="font-mono text-[11px] text-mute">{t.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="px-1 text-body leading-relaxed">
                    My enthusiasm for AI led me to become founding President of the{' '}
                    <span className="text-flame">QUT AI &amp; ML Society</span>, combining technical
                    depth with leadership and community building — sharpening my analytical,
                    problem-solving and communication skills along the way.
                  </p>
                  <p className="px-1 text-body leading-relaxed">
                    I&apos;m open to roles across{' '}
                    <span className="text-ink">AI, machine learning and data science</span> as well as{' '}
                    <span className="text-ink">software and systems development</span>, driven by
                    curiosity and a desire to contribute to the future of technology.
                  </p>
                  <div className="mt-1 rounded-md border border-line px-4 py-3 text-mute">
                    Ask me anything, build anything…
                  </div>
                </div>
              </div>

              {/* Code */}
              <div className="hidden md:block min-w-0">
                <CodePane />
              </div>
            </div>
          </Window>
        </Painted>
      </Reveal>

      <AboutChapters />
    </section>
  )
}
