import { useMemo } from 'react'
import {
  FaReact, FaPython, FaJava, FaNodeJs, FaAws, FaHtml5, FaCss3Alt,
} from 'react-icons/fa'
import {
  SiNextdotjs, SiTailwindcss, SiBootstrap, SiTypescript, SiC,
  SiExpress, SiFlask, SiDotnet, SiMysql, SiR,
  SiTensorflow, SiScikitlearn, SiNumpy, SiPandas,
} from 'react-icons/si'
import { TbBrandCSharp } from 'react-icons/tb'
import { LiveMeta, PixelArt, Reveal, SectionHeader, StatRow } from './ui'
import { neuralNet } from '../lib/pixels'

// Icons without a react-icons equivalent are rendered as monogram badges
function MonoIcon({ label }) {
  return (
    <span className="text-[10px] font-mono font-bold leading-none">
      {label}
    </span>
  )
}

const CATEGORIES = [
  {
    key: 'frontend',
    label: 'Front End',
    dot: 'bg-flame',
    skills: [
      { name: 'React.js',    Icon: FaReact },
      { name: 'Next.js',     Icon: SiNextdotjs },
      { name: 'TailwindCSS', Icon: SiTailwindcss },
      { name: 'Bootstrap',   Icon: SiBootstrap },
      { name: 'HTML',        Icon: FaHtml5 },
      { name: 'CSS',         Icon: FaCss3Alt },
    ],
  },
  {
    key: 'backend',
    label: 'Back End',
    dot: 'bg-live',
    skills: [
      { name: 'Python',     Icon: FaPython },
      { name: 'Java',       Icon: FaJava },
      { name: 'Node.js',    Icon: FaNodeJs },
      { name: 'Express.js', Icon: SiExpress },
      { name: 'Flask',      Icon: SiFlask },
      { name: '.NET',       Icon: SiDotnet },
    ],
  },
  {
    key: 'ai_ml',
    label: 'AI / ML',
    dot: 'bg-gold',
    skills: [
      { name: 'TensorFlow',   Icon: SiTensorflow },
      { name: 'scikit-learn', Icon: SiScikitlearn },
      { name: 'NumPy',        Icon: SiNumpy },
      { name: 'Pandas',       Icon: SiPandas },
    ],
  },
  {
    key: 'other',
    label: 'Other',
    dot: 'bg-rose',
    skills: [
      { name: 'TypeScript', Icon: SiTypescript },
      { name: 'C',          Icon: SiC },
      { name: 'C#',         Icon: TbBrandCSharp },
      { name: 'MySQL',      Icon: SiMysql },
      { name: 'MATLAB',     Icon: () => <MonoIcon label="M" /> },
      { name: 'ASM',        Icon: () => <MonoIcon label="ASM" /> },
      { name: 'AWS',        Icon: FaAws },
      { name: 'R',          Icon: SiR },
    ],
  },
]

const STATS = CATEGORIES.map(c => ({ label: c.label, value: String(c.skills.length).padStart(2, '0') }))
const TOTAL = CATEGORIES.reduce((n, c) => n + c.skills.length, 0)

export default function Skills() {
  const art = useMemo(() => neuralNet(), [])

  return (
    <section id="skills">
      <SectionHeader
        tag="04"
        label="Skills"
        title="One toolkit, end to end."
        description="A full stack toolkit developed across years of study, industry placements and personal projects, from the model to the interface."
        meta={<LiveMeta label="Toolkit">{TOTAL} technologies</LiveMeta>}
      />

      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pb-14 sm:pb-20">
        <Reveal className="grid grid-cols-1 lg:grid-cols-2 rounded-lg border border-line bg-panel/70 overflow-hidden">
          <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-line">
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12 sm:py-20">
              <p className="text-[13px] uppercase tracking-wide text-body">Model to interface</p>
              <h3 className="font-serif text-ink text-3xl mt-3">Train it. Serve it. Ship it.</h3>
              <p className="mt-6 text-body leading-relaxed max-w-md">
                Comfortable across the whole pipeline: data wrangling and model training in Python,
                APIs in Node, Flask or .NET, and polished React front ends on top.
              </p>
            </div>
            <StatRow stats={STATS} className="border-t border-line" />
          </div>
          <div className="flex items-center justify-center p-10 sm:p-14">
            <PixelArt
              {...art}
              tones={['#e8e2d9', '#5d5953']}
              className="w-full max-w-[460px]"
              label="Pixel art neural network"
            />
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mt-5 rounded-lg border border-line overflow-hidden">
          {CATEGORIES.map((cat, i) => (
            <Reveal
              key={cat.key}
              delay={i * 80}
              className={`p-6 bg-panel/40 border-line ${i > 0 ? 'border-t sm:border-t-0' : ''} ${
                i % 2 === 1 ? 'sm:border-l' : ''
              } ${i >= 2 ? 'sm:border-t xl:border-t-0' : ''} ${i === 2 ? 'xl:border-l' : ''}`}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-mono text-[13px]">
                  <span className="text-mute">~/skills/</span>
                  <span className="text-ink">{cat.key}</span>
                </p>
                <span className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-body">
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                  {cat.label}
                </span>
              </div>
              <ul className="flex flex-wrap gap-2">
                {cat.skills.map(({ name, Icon }) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-line bg-panel-2/50 text-[13px] text-ink/90 hover:border-[#4a4640] transition-colors"
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-body">
                      <Icon size={13} />
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
