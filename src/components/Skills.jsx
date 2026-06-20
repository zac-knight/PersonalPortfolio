import { useEffect, useRef, useState } from 'react'
import {
  FaReact, FaPython, FaJava, FaNodeJs, FaAws, FaHtml5, FaCss3Alt,
} from 'react-icons/fa'
import {
  SiNextdotjs, SiTailwindcss, SiBootstrap, SiTypescript,
  SiExpress, SiFlask, SiDotnet, SiMysql, SiR, SiCplusplus,
  SiPytorch, SiTensorflow, SiScikitlearn, SiNumpy, SiPandas,
} from 'react-icons/si'

// Icons without a react-icons equivalent — rendered as monogram badges
function MonoIcon({ label }) {
  return (
    <span className="text-[11px] font-mono font-bold text-slate-300 leading-none">
      {label}
    </span>
  )
}

const CATEGORIES = [
  {
    key: 'frontend',
    label: 'Front End',
    prefix: 'frontend',
    color: 'sky',
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
    prefix: 'backend',
    color: 'violet',
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
    key: 'aiml',
    label: 'AI / ML',
    prefix: 'ai-ml',
    color: 'amber',
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
    prefix: 'other',
    color: 'emerald',
    skills: [
      { name: 'TypeScript', Icon: SiTypescript },
      { name: 'C',          Icon: () => <MonoIcon label="C" /> },
      { name: 'C#',         Icon: SiCplusplus },
      { name: 'MySQL',      Icon: SiMysql },
      { name: 'MATLAB',     Icon: () => <MonoIcon label="M" /> },
      { name: 'ASM',        Icon: () => <MonoIcon label="ASM" /> },
      { name: 'AWS',        Icon: FaAws },
      { name: 'R',          Icon: SiR },
    ],
  },
]

const COLOR = {
  sky:     { text: 'text-sky-400',     border: 'border-sky-500/30',     bg: 'bg-sky-500/10',     hover: 'hover:border-sky-400/70 hover:bg-sky-500/20'     },
  violet:  { text: 'text-violet-400',  border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  hover: 'hover:border-violet-400/70 hover:bg-violet-500/20'  },
  amber:   { text: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   hover: 'hover:border-amber-400/70 hover:bg-amber-500/20'   },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', hover: 'hover:border-emerald-400/70 hover:bg-emerald-500/20' },
}

function SkillPill({ name, Icon, color, delay, visible }) {
  const c = COLOR[color]
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay, visible])

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${c.border} ${c.bg} ${c.hover}
        cursor-default select-none
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      style={{ transition: 'opacity 0.4s ease, transform 0.4s ease, border-color 0.2s, background 0.2s' }}
    >
      <span className={`flex items-center justify-center w-4 h-4 ${c.text}`}>
        <Icon size={15} />
      </span>
      <span className="text-slate-300 text-sm font-mono">{name}</span>
    </div>
  )
}

function CategoryBlock({ category, baseDelay, visible }) {
  const c = COLOR[category.color]
  return (
    <div
      className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${baseDelay}ms` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-xs text-slate-600 select-none">~/skills/</span>
        <span className={`font-mono text-xs font-semibold ${c.text}`}>{category.prefix}</span>
        <div className="flex-1 border-t border-slate-800 ml-2" />
        <span className="font-mono text-xs text-slate-500 tracking-widest uppercase">{category.label}</span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {category.skills.map((skill, i) => (
          <SkillPill
            key={skill.name}
            name={skill.name}
            Icon={skill.Icon}
            color={category.color}
            delay={baseDelay + i * 60}
            visible={visible}
          />
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="min-h-screen w-full snap-start flex flex-col items-center justify-center relative overflow-hidden px-6 py-24"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-full h-[45%] bg-violet-900/20"
          style={{ clipPath: 'polygon(40% 0%, 100% 0%, 100% 100%, 100% 100%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center gap-10">

        <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-slate-400 tracking-[0.3em] text-sm uppercase">
            S K I L L S
          </p>
        </div>

        <div
          className={`text-center transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '80ms' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 leading-tight">
            Built with the{' '}
            <span className="underline decoration-sky-400">right tools.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-xl leading-relaxed">
            A full-stack toolkit developed across five years of study, industry placements, and personal projects.
          </p>
        </div>

        <div className="w-full flex flex-col gap-10 mt-2">
          {CATEGORIES.map((cat, i) => (
            <CategoryBlock
              key={cat.key}
              category={cat}
              baseDelay={200 + i * 120}
              visible={visible}
            />
          ))}
        </div>

      </div>
    </section>
  )
}