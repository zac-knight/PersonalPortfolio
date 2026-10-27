import { useEffect, useRef, useState } from 'react'

// ── Layout ────────────────────────────────────────────────────────────────────
export function Hatch({ className = 'h-10 sm:h-14' }) {
  return <div aria-hidden className={`hatch border-y border-line ${className}`} />
}

export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        shown ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-[2px]'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

// ── Labels ────────────────────────────────────────────────────────────────────
export function Eyebrow({ tag, children }) {
  return (
    <div className="inline-flex w-fit items-center gap-3 rounded-md bg-panel-2/70 border border-line/60 pl-1.5 pr-3 py-1.5 text-[11px] sm:text-[13px] uppercase tracking-wide text-body">
      <span className="rounded bg-panel-2 border border-line px-2 py-0.5 text-ink">{tag}</span>
      <span>{children}</span>
    </div>
  )
}

export function LiveDot({ className = '' }) {
  return (
    <span className={`relative inline-flex w-1.5 h-1.5 ${className}`}>
      <span className="absolute inset-0 rounded-full bg-live animate-ping opacity-60" />
      <span className="relative w-1.5 h-1.5 rounded-full bg-live" />
    </span>
  )
}

export function LiveMeta({ label = 'Live', children }) {
  return (
    <p className="flex items-center gap-2 text-sm">
      <LiveDot />
      <span className="text-live uppercase">{label}</span>
      <span className="text-body">{children}</span>
    </p>
  )
}

export function SectionHeader({ tag, label, title, description, meta }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-16 px-6 sm:px-12 lg:px-20 xl:px-28 pt-14 sm:pt-20 pb-10 sm:pb-14">
      <Reveal className="flex flex-col gap-6 sm:gap-8">
        <Eyebrow tag={tag}>{label}</Eyebrow>
        <h2 className="font-serif text-ink text-4xl sm:text-5xl leading-[1.08] tracking-tight max-w-xl">
          {title}
        </h2>
      </Reveal>
      <Reveal delay={120} className="flex flex-col justify-between gap-6 lg:items-end">
        {meta && <div className="hidden lg:block">{meta}</div>}
        {description && (
          <p className="text-body leading-relaxed max-w-md lg:mb-2">{description}</p>
        )}
      </Reveal>
    </div>
  )
}

// ── Buttons ───────────────────────────────────────────────────────────────────
const BUTTON = {
  primary: 'bg-cream text-canvas hover:bg-white',
  ghost: 'bg-panel-2/60 text-ink border border-line hover:bg-panel-2',
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const Tag = props.href ? 'a' : 'button'
  return (
    <Tag
      {...props}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-5 py-2.5 text-[15px] transition-colors duration-200 cursor-pointer ${BUTTON[variant]} ${className}`}
    >
      {children}
    </Tag>
  )
}

export function IconBox({ children }) {
  return (
    <span className="w-11 h-11 shrink-0 rounded-md border border-line bg-panel-2/50 flex items-center justify-center text-ink">
      {children}
    </span>
  )
}

// ── Window chrome ─────────────────────────────────────────────────────────────
export function Window({ title, right, children, className = '' }) {
  return (
    <div className={`rounded-lg overflow-hidden bg-panel border border-black/40 shadow-2xl shadow-black/50 ${className}`}>
      <div className="relative flex items-center h-11 px-4 border-b border-line">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-3 h-3 rounded-full bg-[#4a4640]" />
          ))}
        </div>
        {title && (
          <p className="absolute left-1/2 -translate-x-1/2 text-[13px] text-body truncate max-w-[60%]">
            {title}
          </p>
        )}
        {right && <div className="ml-auto">{right}</div>}
      </div>
      {children}
    </div>
  )
}

export function Painted({ variant = '', className = '', children }) {
  return <div className={`painted ${variant ? `painted-${variant}` : ''} ${className}`}>{children}</div>
}

// ── Stats ─────────────────────────────────────────────────────────────────────
// Counts the first number in a label (e.g. "1,995", "86%", "~95%") up from zero
// the first time it scrolls into view; non-numeric text is left untouched.
export function CountUp({ value, duration = 1400 }) {
  const ref = useRef(null)
  const match = /\d[\d,]*(\.\d+)?/.exec(value)
  const target = match ? Number(match[0].replace(/,/g, '')) : null
  const [current, setCurrent] = useState(target)

  useEffect(() => {
    const el = ref.current
    if (!el || target === null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = now => {
        const t = Math.min(1, (now - start) / duration)
        setCurrent(target * (1 - Math.pow(1 - t, 3)))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      setCurrent(0)
      frame = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target, duration])

  if (!match) return value
  const decimals = match[1] ? match[1].length - 1 : 0
  const formatted = current.toLocaleString('en-AU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return (
    <span ref={ref}>
      {value.slice(0, match.index)}
      {formatted}
      {value.slice(match.index + match[0].length)}
    </span>
  )
}

export function StatRow({ stats, className = '' }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 ${className}`}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`px-5 sm:px-6 py-5 sm:py-6 border-line ${i > 0 ? 'sm:border-l' : ''} ${
            i % 2 === 1 ? 'border-l' : ''
          } ${i >= 2 ? 'border-t sm:border-t-0' : ''}`}
        >
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-mute min-h-[2.8em]">{s.label}</p>
          <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl text-ink tabular-nums"><CountUp value={s.value} /></p>
        </div>
      ))}
    </div>
  )
}

// ── Pixel art ─────────────────────────────────────────────────────────────────
// `cells` is an array of [x, y, tone] where tone indexes into `tones`.
export function PixelArt({ cells, width, height, tones, cell = 10, gap = 2, className = '', label }) {
  return (
    <svg
      viewBox={`0 0 ${width * cell} ${height * cell}`}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {cells.map(([x, y, tone], i) => (
        <rect
          key={i}
          className="pixel"
          x={x * cell}
          y={y * cell}
          width={cell - gap}
          height={cell - gap}
          fill={tones[tone]}
          style={{ animationDelay: `${(x + y) * 18}ms` }}
        />
      ))}
    </svg>
  )
}
