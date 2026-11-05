import { useEffect, useRef, useState } from 'react'
import { FaArrowRight, FaPlay, FaRegFileImage } from 'react-icons/fa'
import projects from '../data'
import { SplitText } from './fx'
import Lightbox from './Lightbox'
import { Button, Expandable, LiveMeta, Painted, Reveal, SectionHeader, StatRow, TabStrip, Window } from './ui'

// Tab labels show the file name with any hyphens turned into spaces
const fileName = (src) => decodeURIComponent(src.split('/').pop()).replace(/\s*-\s*/g, ' ')

function ScreenshotWindow({ project }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [zoomed, setZoomed] = useState(null) // index open in the lightbox
  const [onScreen, setOnScreen] = useState(false)
  const ref = useRef(null)

  // Rotate only while this project is on screen; leaving resets it to the first
  // screenshot (and clears any manual pause) so returning starts from the top
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let visible = false
    const leave = () => {
      setOnScreen(false)
      setActive(0)
      setPaused(false)
    }
    // "On screen" means at least half the window is visible; anything less counts as leaving
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.5
        if (visible && !document.hidden) setOnScreen(true)
        else leave()
      },
      { threshold: [0, 0.5, 1] }
    )
    io.observe(el)
    // Switching to another browser tab also counts as leaving
    const onVisibility = () => (document.hidden ? leave() : visible && setOnScreen(true))
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (!onScreen || paused || zoomed !== null) return
    const timer = setInterval(() => setActive(i => (i + 1) % project.images.length), 7000)
    return () => clearInterval(timer)
  }, [onScreen, paused, zoomed, project.images.length])

  return (
    <div ref={ref} className="w-full min-w-0">
    <Window title={project.title} className="w-full min-w-0">
      <TabStrip
        items={project.images.map(fileName)}
        active={active}
        onSelect={i => { setActive(i); setPaused(true) }}
        icon={FaRegFileImage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      />
      <div
        className="relative bg-[#0f0e0d] overflow-hidden cursor-zoom-in"
        style={{ aspectRatio: project.aspect || '16 / 10' }}
        data-cursor="enlarge"
        role="button"
        tabIndex={0}
        aria-label="Open screenshot full screen"
        onClick={() => setZoomed(active)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setZoomed(active))}
      >
        {onScreen && (
          <div key={active} aria-hidden className="absolute left-0 top-0 z-10 h-[2px] bg-flame/80 progress-bar" style={{ animationPlayState: paused || zoomed !== null ? 'paused' : 'running' }} />
        )}
        {project.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${project.title}: ${fileName(src).replace(/\.\w+$/, '')}`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-contain transition-[opacity,transform,filter] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              i === active ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.06] blur-sm'
            }`}
          />
        ))}
        <span className="absolute bottom-3 right-3 font-mono text-[11px] px-2 py-1 rounded bg-black/60 text-body">
          {String(active + 1).padStart(2, '0')} / {String(project.images.length).padStart(2, '0')}
        </span>
      </div>
      {zoomed !== null && (
        <Lightbox
          images={project.images.map(src => ({ src, alt: `${project.title}: ${fileName(src).replace(/\.\w+$/, '')}`, caption: fileName(src).replace(/\.\w+$/, '') }))}
          index={zoomed}
          onIndex={i => setZoomed(typeof i === 'function' ? i(zoomed) : i)}
          onClose={() => { setActive(zoomed); setZoomed(null) }}
        />
      )}
    </Window>
    </div>
  )
}

function ProjectBlock({ project, onMoreDetail }) {
  return (
    <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pb-6 sm:pb-8">
      <div className="rounded-lg border border-line overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] 2xl:grid-cols-[1fr_1.7fr]">
        <Reveal className="flex flex-col justify-center gap-6 lg:gap-3.5 short:gap-3 px-6 sm:px-10 lg:px-8 xl:px-10 py-10 sm:py-12 lg:py-7 short:py-5 lg:border-r border-line">
          <p className="text-[13px] lg:text-[12px] uppercase tracking-wide text-body">{project.category || 'Project'}</p>
          <h3 className="font-serif text-ink text-3xl sm:text-4xl lg:text-[32px] leading-tight"><SplitText text={project.title} /></h3>
          <p className="text-ink/80 text-lg lg:text-base leading-relaxed lg:leading-snug">{project.tagline}</p>
          <Expandable collapsed={130} more="Read more">
            <p className="text-body leading-relaxed lg:text-[14.5px] lg:leading-[1.6] short:text-[14px] short:leading-[1.5]">{project.description}</p>
          </Expandable>
          {project.role && (
            <p className="text-[13px] text-mute">
              <span className="text-flame">Role</span> · {project.role}
            </p>
          )}
          <ul className="flex flex-wrap gap-2 lg:gap-1.5">
            {project.skills.map((Icon, i) => (
              <li
                key={project.skillLabels[i]}
                className="chip flex items-center gap-2 px-2.5 py-1.5 lg:px-2 lg:py-1 rounded-md border border-line bg-panel-2/50 text-[13px] lg:text-[12px] text-ink/90"
              >
                <Icon size={12} className="text-body" />
                {project.skillLabels[i]}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2 lg:pt-1">
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
          <Painted variant="dusk" className="h-full flex items-center px-3 sm:px-5 xl:px-6 py-5 sm:py-8 short:py-3">
            <div className="w-full min-w-0">
              <ScreenshotWindow project={project} />
            </div>
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
        description="Case studies from real systems built with teams, from reverse engineering and testing a retrieval augmented generation assistant to delivering a full stack platform end to end."
        meta={<LiveMeta label="Featured">{projects.length} case {projects.length === 1 ? 'study' : 'studies'}</LiveMeta>}
      />

      {projects.map(project => (
        <ProjectBlock key={project.title} project={project} onMoreDetail={onSelectProject} />
      ))}

      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pt-2 pb-14 sm:pb-20">
        <div className="spot rounded-lg border border-dashed border-line px-6 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
