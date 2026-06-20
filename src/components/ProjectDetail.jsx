import { useState } from 'react'
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 mt-16 mb-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-9 right-0 w-8 h-8 rounded-full bg-slate-800 border border-sky-500/30 flex items-center justify-center hover:bg-slate-700 transition-colors z-10"
        >
          <FaTimes size={13} className="text-sky-300" />
        </button>
        {children}
      </div>
    </div>
  )
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function Gallery({ images }) {
  const [active, setActive] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-sky-500/20 bg-slate-900 shadow-xl shadow-black/40">
          <img
            key={active}
            src={images[active]}
            alt={`Screenshot ${active + 1}`}
            className="w-full h-full object-contain transition-opacity duration-500 cursor-zoom-in"
            onClick={() => setModalOpen(true)}
          />
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 border border-sky-500/30 flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            <FaChevronLeft size={13} className="text-sky-300" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 border border-sky-500/30 flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            <FaChevronRight size={13} className="text-sky-300" />
          </button>
          <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-sky-500/20 text-sky-300 text-xs tracking-widest">
            {active + 1} / {images.length}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border transition-all duration-200 bg-slate-900 ${
                i === active
                  ? 'border-sky-400 scale-105'
                  : 'border-sky-500/20 opacity-60 hover:opacity-90'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      </div>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div className="flex flex-col gap-3">
            <div
              className="rounded-2xl overflow-hidden border border-sky-500/20 bg-slate-900 shadow-2xl shadow-black/60"
              style={{ maxHeight: 'calc(100vh - 160px)' }}
            >
              <img
                src={images[active]}
                alt={`Screenshot ${active + 1}`}
                className="w-full object-contain"
                style={{ maxHeight: 'calc(100vh - 160px)' }}
              />
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="w-9 h-9 rounded-full bg-slate-900 border border-sky-500/30 flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                <FaChevronLeft size={13} className="text-sky-300" />
              </button>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-sky-500/20 text-sky-300 text-xs tracking-widest">
                {active + 1} / {images.length}
              </span>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="w-9 h-9 rounded-full bg-slate-900 border border-sky-500/30 flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                <FaChevronRight size={13} className="text-sky-300" />
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
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div
        className="relative w-full aspect-video rounded-2xl overflow-hidden border border-sky-500/20 bg-slate-900 shadow-xl shadow-black/40 cursor-zoom-in group"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setModalOpen(true)
        }}
      >
        <video
          src={src}
          muted
          loop
          autoPlay
          playsInline
          className="w-full h-full object-contain pointer-events-none"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 rounded-full bg-slate-900/80 border border-sky-400/50 flex items-center justify-center">
            <svg className="text-sky-300 ml-1" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      </div>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div
            className="relative rounded-2xl overflow-hidden border border-sky-500/20 bg-slate-900 shadow-2xl shadow-black/60"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            <video
              src={src}
              loop
              autoPlay
              playsInline
              controls
              className="w-full object-contain"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            />
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-sky-400 tracking-[0.25em] text-xs uppercase mb-3 font-medium">
      {children}
    </p>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectDetail({ project, onBack }) {
  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100">
      <nav className="flex-shrink-0 w-full bg-slate-950/90 backdrop-blur border-b border-sky-500/10 px-6 sm:px-12 py-4 flex items-center justify-between z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sky-300 text-sm tracking-widest uppercase hover:text-sky-200 transition-colors"
        >
          <FaArrowLeft size={12} />
          Back
        </button>
        <p className="text-slate-400 tracking-[0.3em] text-xs uppercase hidden sm:block">
          P R O J E C T S
        </p>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-sky-950/95 border border-sky-800/60 text-sky-300 text-xs tracking-widest uppercase rounded-full hover:bg-sky-950 hover:border-sky-600 hover:text-sky-200 transition-all duration-300"
        >
          Live Demo
          <FaExternalLinkAlt size={10} />
        </a>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <header className="relative px-6 sm:px-12 md:px-24 pt-14 pb-10 border-b border-sky-500/10 overflow-hidden">
          <div
            className="absolute bottom-0 left-0 w-full h-[60%] bg-sky-700/10 pointer-events-none"
            style={{ clipPath: 'polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)' }}
          />
          <div className="relative max-w-5xl mx-auto">
            <SectionLabel>Case Study</SectionLabel>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-100 underline decoration-sky-400 mb-4 leading-tight">
              {project.title}
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
              {project.tagline}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {project.skills.map((Icon, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-sky-500/20 text-slate-300 text-xs"
                >
                  <Icon size={13} className="text-sky-300" />
                  {project.skillLabels[i]}
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 sm:px-12 md:px-24 py-12 flex flex-col gap-16">
          <section>
            <SectionLabel>Screenshots</SectionLabel>
            <Gallery images={project.images} />
          </section>

          {project.video && (
            <section>
              <SectionLabel>Demo Video</SectionLabel>
              <VideoPlayer src={project.video} />
            </section>
          )}

          <section>
            <SectionLabel>About the Project</SectionLabel>
            <div className="space-y-4">
              {project.fullDescription.split('\n\n').map((para, i) => (
                <p key={i} className="text-slate-300 text-sm sm:text-base leading-relaxed text-justify">
                  {para}
                </p>
              ))}
            </div>
          </section>

          <section className="relative pl-5 border-l-2 border-sky-500/40">
            <SectionLabel>Problem Statement</SectionLabel>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-justify italic">
              {project.problemStatement}
            </p>
          </section>

          {project.businessImpact?.length > 0 && (
            <section>
              <SectionLabel>Business Impact</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {project.businessImpact.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center text-center px-4 py-6 rounded-2xl bg-slate-900 border border-sky-500/15 shadow-lg shadow-black/20"
                  >
                    <span className="text-2xl sm:text-3xl font-bold text-sky-300 mb-1">
                      {item.stat}
                    </span>
                    <span className="text-slate-400 text-xs leading-snug">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.architecture?.length > 0 && (
            <section>
              <SectionLabel>System Architecture</SectionLabel>
              <div className="flex flex-col gap-3">
                {project.architecture.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-6 px-5 py-4 rounded-xl bg-slate-900 border border-sky-500/15"
                  >
                    <span className="text-sky-300 text-xs font-semibold tracking-widest uppercase min-w-[110px] pt-0.5">
                      {item.layer}
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.keyFeatures?.length > 0 && (
            <section>
              <SectionLabel>Key Features</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.keyFeatures.map((feat, i) => (
                  <div
                    key={i}
                    className="px-5 py-5 rounded-2xl bg-slate-900 border border-sky-500/15 hover:border-sky-500/35 transition-colors duration-200"
                  >
                    <p className="text-sky-300 text-xs font-semibold tracking-widest uppercase mb-2">
                      {feat.title}
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">{feat.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-sky-500/10">
            <p className="text-slate-400 text-sm">Want to see it in action?</p>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-950/95 border border-sky-800/60 text-sky-300 text-xs tracking-widest uppercase rounded-full hover:bg-sky-950 hover:border-sky-600 hover:text-sky-200 transition-all duration-300"
            >
              View Live Demo
              <FaExternalLinkAlt size={10} />
            </a>
          </section>
        </main>
      </div>
    </div>
  )
}