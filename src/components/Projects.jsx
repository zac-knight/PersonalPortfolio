import { useEffect, useState } from 'react'
import { FaArrowRight, FaPlay, FaRegFileImage } from 'react-icons/fa'
import projects from '../data'
import { Button, Expandable, LiveMeta, Painted, Reveal, SectionHeader, StatRow, TabStrip, Window } from './ui'

// Tab labels show the file name with any hyphens turned into spaces
const fileName = (src) => decodeURIComponent(src.split('/').pop()).replace(/\s*-\s*/g, ' ')

function ScreenshotWindow({ project }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => setActive(i => (i + 1) % project.images.length), 4000)
    return () => clearInterval(timer)
  }, [paused, project.images.length])

  return (
    <Window title={project.title} className="w-full min-w-0">
      <TabStrip
        items={project.images.map(fileName)}
        active={active}
        onSelect={i => { setActive(i); setPaused(true) }}
        icon={FaRegFileImage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      />
      <div className="relative aspect-[16/9] bg-[#0f0e0d]">
        {project.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${project.title}: ${fileName(src).replace(/\.\w+$/, '')}`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <span className="absolute bottom-3 right-3 font-mono text-[11px] px-2 py-1 rounded bg-black/60 text-body">
          {String(active + 1).padStart(2, '0')} / {String(project.images.length).padStart(2, '0')}
        </span>
      </div>
    </Window>
  )
}

function ProjectBlock({ project, onMoreDetail }) {
  return (
    <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pb-6 sm:pb-8">
      <div className="rounded-lg border border-line overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] 2xl:grid-cols-[1fr_1.4fr]">
        <Reveal className="flex flex-col justify-center gap-6 px-6 sm:px-10 py-10 sm:py-12 lg:border-r border-line">
          <p className="text-[13px] uppercase tracking-wide text-body">{project.category || 'Project'}</p>
          <h3 className="font-serif text-ink text-3xl sm:text-4xl leading-tight">{project.title}</h3>
          <p className="text-ink/80 text-lg leading-relaxed">{project.tagline}</p>
          <Expandable collapsed={130} more="Read more">
            <p className="text-body leading-relaxed">{project.description}</p>
          </Expandable>
          {project.role && (
            <p className="text-[13px] text-mute">
              <span className="text-flame">Role</span> · {project.role}
            </p>
          )}
          <ul className="flex flex-wrap gap-2">
            {project.skills.map((Icon, i) => (
              <li
                key={project.skillLabels[i]}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-line bg-panel-2/50 text-[13px] text-ink/90"
              >
                <Icon size={12} className="text-body" />
                {project.skillLabels[i]}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => onMoreDetail(project)}>
              Read case study <FaArrowRight size={11} />
            </Button>
            {project.link && (
              <Button href={project.link} target="_blank" rel="noopener noreferrer" variant="ghost">
                <FaPlay size={10} /> Watch demo
              </Button>
            )}
          </div>
        </Reveal>
        <Reveal delay={120} className="min-w-0">
          <Painted variant="dusk" className="h-full flex items-center px-4 sm:px-8 xl:px-12 py-8 sm:py-12">
            <ScreenshotWindow project={project} />
          </Painted>
        </Reveal>
      </div>
      {project.businessImpact?.length > 0 && (
        <StatRow
          stats={project.businessImpact.map(b => ({ label: b.label, value: b.stat }))}
          className="border-t border-line"
        />
      )}
      </div>
    </div>
  )
}

export default function Projects({ onSelectProject }) {
  return (
    <section id="projects">
      <SectionHeader
        tag="05"
        label="Projects"
        title="Real software, for real users."
        description="Case studies from production systems built with teams, from optimising a retrieval augmented generation pipeline to delivering a full stack platform end to end."
        meta={<LiveMeta label="Featured">{projects.length} case {projects.length === 1 ? 'study' : 'studies'}</LiveMeta>}
      />

      {projects.map(project => (
        <ProjectBlock key={project.title} project={project} onMoreDetail={onSelectProject} />
      ))}

      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pt-2 pb-14 sm:pb-20">
        <div className="rounded-lg border border-dashed border-line px-6 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-serif text-2xl text-ink">More projects in the pipeline.</p>
            <p className="mt-2 text-body">New work is always in progress. Check back soon.</p>
          </div>
          <p className="font-mono text-[13px] text-mute flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            building<span className="caret">_</span>
          </p>
        </div>
      </div>
    </section>
  )
}
