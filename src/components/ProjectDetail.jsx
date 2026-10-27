import { useEffect, useState } from 'react'
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaPlay, FaRegFileImage, FaTimes } from 'react-icons/fa'
import { Button, Eyebrow, Hatch, LiveMeta, Painted, StatRow, TabStrip, Window } from './ui'

// Tab labels show the file name with any hyphens turned into spaces
const fileName = (src) => decodeURIComponent(src.split('/').pop()).replace(/\s*-\s*/g, ' ')

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-11 right-0 w-9 h-9 rounded-md bg-panel border border-line flex items-center justify-center text-ink hover:bg-panel-2 transition-colors"
        >
          <FaTimes size={13} />
        </button>
        {children}
      </div>
    </div>
  )
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function Gallery({ images, title }) {
  const [active, setActive] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)

  const navButton = 'w-9 h-9 rounded-md bg-panel/90 border border-line flex items-center justify-center text-ink hover:bg-panel-2 transition-colors'

  return (
    <>
      <Window title={title} className="rounded-b-none">
        <TabStrip items={images.map(fileName)} active={active} onSelect={setActive} icon={FaRegFileImage} />
        <div className="relative aspect-video bg-[#0f0e0d]">
          <img
            key={active}
            src={images[active]}
            alt={`Screenshot ${active + 1}`}
            className="pixel w-full h-full object-contain cursor-zoom-in"
            onClick={() => setModalOpen(true)}
          />
          <button onClick={prev} aria-label="Previous screenshot" className={`absolute left-3 top-1/2 -translate-y-1/2 ${navButton}`}>
            <FaChevronLeft size={12} />
          </button>
          <button onClick={next} aria-label="Next screenshot" className={`absolute right-3 top-1/2 -translate-y-1/2 ${navButton}`}>
            <FaChevronRight size={12} />
          </button>
          <span className="absolute bottom-3 right-3 font-mono text-[11px] px-2 py-1 rounded bg-black/60 text-body">
            {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </span>
        </div>
      </Window>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg overflow-hidden border border-line bg-panel">
              <img
                src={images[active]}
                alt={`Screenshot ${active + 1}`}
                className="w-full object-contain"
                style={{ maxHeight: 'calc(100vh - 160px)' }}
              />
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={prev} aria-label="Previous screenshot" className={navButton}>
                <FaChevronLeft size={12} />
              </button>
              <span className="font-mono text-[12px] text-body">
                {active + 1} / {images.length}
              </span>
              <button onClick={next} aria-label="Next screenshot" className={navButton}>
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Video Player ──────────────────────────────────────────────────────────────
function VideoPlayer({ src }) {
  return (
    <Window title="demo.mp4">
      <video src={src} controls playsInline className="w-full aspect-video bg-black" />
    </Window>
  )
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ title, note, rows }) {
  const max = Math.max(...rows.map(r => r.value))
  const baseline = rows.find(r => r.current)?.value
  return (
    <figure className="mt-6 rounded-lg border border-line bg-panel/50 px-6 py-6">
      <figcaption className="text-ink mb-5">{title}</figcaption>
      <div className="flex flex-col gap-3">
        {rows.map(r => (
          <div
            key={r.label}
            className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-1.5 sm:gap-4 items-center group"
            title={`${r.label}: ${r.value.toLocaleString()} tokens`}
          >
            <span className={`text-[13px] ${r.current ? 'text-ink' : 'text-body'}`}>{r.label}</span>
            <span className="flex items-center gap-3">
              <span className="flex-1 h-6 rounded bg-panel-2 overflow-hidden">
                <span
                  className={`block h-full rounded transition-colors ${
                    r.current ? 'bg-[#7a756e]' : 'bg-[#4a4640] group-hover:bg-[#5d5953]'
                  }`}
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </span>
              <span className="w-28 shrink-0 text-[13px] text-ink tabular-nums">
                {r.value.toLocaleString()}
                {baseline && !r.current && (
                  <span className="text-live"> −{Math.round((1 - r.value / baseline) * 100)}%</span>
                )}
              </span>
            </span>
          </div>
        ))}
      </div>
      {note && <p className="mt-5 text-[12px] text-mute">{note}</p>}
    </figure>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
function Block({ tag, label, title, children }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-12 px-6 sm:px-12 lg:px-20 xl:px-28 py-12 sm:py-16 border-t border-line">
      <div className="flex flex-col gap-5">
        <div>
          <Eyebrow tag={tag}>{label}</Eyebrow>
        </div>
        {title && <h2 className="font-serif text-ink text-3xl leading-tight">{title}</h2>}
      </div>
      <div>{children}</div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectDetail({ project, onBack }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onBack()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  let section = 0
  const tag = () => String(++section).padStart(2, '0')

  return (
    <div className="min-h-screen bg-canvas">
      <nav className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-md dots-b flex items-center justify-between h-16 sm:h-[72px] px-6 sm:px-12 lg:px-20 xl:px-28">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-body hover:text-ink transition-colors"
        >
          <FaArrowLeft size={12} />
          Back to portfolio
        </button>
        {project.link && (
          <Button href={project.link} target="_blank" rel="noopener noreferrer">
            <FaPlay size={10} /> Watch demo
          </Button>
        )}
      </nav>

      <header className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-16 px-6 sm:px-12 lg:px-20 xl:px-28 pt-14 sm:pt-20 pb-12">
        <div className="flex flex-col gap-7">
          <div>
            <Eyebrow tag="Case study">{project.category || 'Project'}</Eyebrow>
          </div>
          <h1 className="font-serif text-ink text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            {project.title}
          </h1>
          <p className="text-body text-lg leading-relaxed max-w-2xl">{project.tagline}</p>
          {project.role && (
            <p className="text-[13px] text-mute">
              <span className="text-flame">Role</span> · {project.role}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-between gap-6 lg:items-end">
          <div className="hidden lg:block">
            <LiveMeta label={project.status ? 'Status' : 'Shipped'}>
              {project.status || `${project.skillLabels.length} technologies`}
            </LiveMeta>
          </div>
          <ul className="flex flex-wrap gap-2 lg:justify-end">
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
        </div>
      </header>

      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pb-12 sm:pb-16">
        <div className="rounded-lg border border-line overflow-hidden">
          <Painted variant="dusk" className="px-4 sm:px-10 lg:px-14 pt-8 sm:pt-12">
            <Gallery images={project.images} title={project.title} />
          </Painted>
          {project.businessImpact?.length > 0 && (
            <StatRow
              stats={project.businessImpact.map(b => ({ label: b.label, value: b.stat }))}
              className="border-t border-line"
            />
          )}
        </div>
      </div>

      <Hatch />

      <Block tag={tag()} label="Overview" title="About the project">
        <div className="space-y-5">
          {project.fullDescription.split('\n').map((para, i) => (
            <p key={i} className="text-body leading-relaxed">{para}</p>
          ))}
        </div>
      </Block>

      <Block tag={tag()} label="Problem" title="What needed solving">
        <p className="font-serif text-ink/90 text-xl sm:text-2xl leading-relaxed border-l-2 border-flame/60 pl-6">
          {project.problemStatement}
        </p>
      </Block>

      {project.video && (
        <Block tag="▸" label="Demo video">
          <VideoPlayer src={project.video} />
        </Block>
      )}

      {project.architecture?.length > 0 && (
        <Block tag={tag()} label="Architecture" title="System architecture">
          <div className="rounded-lg border border-line overflow-hidden">
            {project.architecture.map((item, i) => (
              <div
                key={item.layer}
                className={`grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-6 px-6 py-5 bg-panel/50 ${
                  i > 0 ? 'border-t border-line' : ''
                }`}
              >
                <span className="font-mono text-[13px] text-flame">{item.layer}</span>
                <p className="text-body leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {project.optimisations?.length > 0 && (
        <Block tag={tag()} label="Optimisation" title="Findings and fixes">
          <div className="rounded-lg border border-line overflow-hidden">
            {project.optimisations.map((o, i) => (
              <div
                key={o.area}
                className={`grid grid-cols-1 md:grid-cols-[150px_1fr_1fr_170px] gap-3 md:gap-6 px-6 py-5 bg-panel/50 ${
                  i > 0 ? 'border-t border-line' : ''
                }`}
              >
                <span className="font-mono text-[13px] text-flame">{o.area}</span>
                <p className="text-body leading-relaxed">
                  <span className="md:hidden text-[11px] uppercase tracking-wide text-mute block mb-1">Found</span>
                  {o.finding}
                </p>
                <p className="text-ink/90 leading-relaxed">
                  <span className="md:hidden text-[11px] uppercase tracking-wide text-mute block mb-1">Change</span>
                  {o.change}
                </p>
                <p className="text-live text-[14px] leading-snug">→ {o.impact}</p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {project.comparison?.length > 0 && (
        <Block tag={tag()} label="Target" title="Today vs target">
          <div className="rounded-lg border border-line overflow-hidden text-[15px]">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr] gap-6 px-6 py-3 bg-panel-2/60 text-[12px] uppercase tracking-wide text-mute">
              <span />
              <span>Today</span>
              <span>Target</span>
            </div>
            {project.comparison.map(c => (
              <div key={c.label} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-1 sm:gap-6 px-6 py-4 bg-panel/50 border-t border-line">
                <span className="text-ink">{c.label}</span>
                <span className="text-mute line-through decoration-rose/50">{c.today}</span>
                <span className="text-live">{c.target}</span>
              </div>
            ))}
          </div>
          {project.chart && <BarChart {...project.chart} />}
        </Block>
      )}

      {project.keyFeatures?.length > 0 && (
        <Block tag={tag()} label="Features" title={project.optimisations ? 'What we delivered' : 'Key features'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 rounded-lg border border-line overflow-hidden">
            {project.keyFeatures.map((feat, i) => (
              <div
                key={feat.title}
                className={`px-6 py-6 bg-panel/50 border-line ${i > 0 ? 'border-t' : ''} ${
                  i === 1 ? 'sm:border-t-0' : ''
                } ${i % 2 === 1 ? 'sm:border-l' : ''}`}
              >
                <p className="flex items-center gap-3 text-ink">
                  <span className="font-mono text-[12px] text-mute">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-serif text-xl">{feat.title}</span>
                </p>
                <p className="mt-3 text-body leading-relaxed">{feat.body}</p>
              </div>
            ))}
          </div>
        </Block>
      )}

      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-6 sm:px-12 lg:px-20 xl:px-28 py-12 border-t border-line">
        <p className="font-serif text-ink text-2xl sm:text-3xl">
          {project.link ? 'Want to see it in action?' : 'Want to talk through the details?'}
        </p>
        <div className="flex flex-wrap gap-3">
          {project.link ? (
            <Button href={project.link} target="_blank" rel="noopener noreferrer">
              <FaPlay size={10} /> Watch demo
            </Button>
          ) : (
            <Button href="mailto:zknight03@outlook.com">Get in touch</Button>
          )}
          <Button variant="ghost" onClick={onBack}>
            <FaArrowLeft size={11} /> Back to portfolio
          </Button>
        </div>
      </section>
    </div>
  )
}
