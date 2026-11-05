import { Fragment, useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import { finePointer, prefersReduced, useInViewOnce } from '../lib/motion'

// ── Intro ─────────────────────────────────────────────────────────────────────
// A one-per-session curtain styled as a training run: epochs tick up while the
// loss curve falls and accuracy climbs, then the panel wipes upward to reveal
// the page. The hero waits via --intro.
const INTRO_MS = 1700
const EPOCHS = 100

// Deterministic jitter so the curve looks like a real (noisy) run
const jitter = i => ((Math.sin(i * 12.9898) * 43758.5453) % 1)
const lossAt = t => 2.4 * Math.exp(-4.2 * t) + 0.035
const CURVE_PATH = Array.from({ length: 61 }, (_, i) => {
  const t = i / 60
  const l = lossAt(t) * (1 + jitter(i + 1) * 0.12 * (1 - t * 0.7))
  return `${i ? 'L' : 'M'}${(t * 300).toFixed(1)},${(100 - (l / 2.6) * 96).toFixed(1)}`
}).join(' ')

export function Intro() {
  const [show] = useState(() => {
    if (prefersReduced()) return false
    try {
      if (sessionStorage.getItem('zk-intro')) return false
    } catch {
      /* storage blocked: just play it */
    }
    // Set before the hero mounts so its entrance waits behind the curtain
    document.documentElement.style.setProperty('--intro', `${INTRO_MS - 200}ms`)
    return true
  })
  const [count, setCount] = useState(0)
  const [gone, setGone] = useState(!show)

  useEffect(() => {
    if (!show) return
    const root = document.documentElement
    try {
      sessionStorage.setItem('zk-intro', '1')
    } catch {
      /* ignore */
    }
    document.body.style.overflow = 'hidden'
    const start = performance.now()
    let frame
    const tick = now => {
      const t = Math.min(1, (now - start) / (INTRO_MS - 500))
      setCount(1 - Math.pow(1 - t, 3))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const done = setTimeout(() => {
      setGone(true)
      document.body.style.overflow = ''
    }, INTRO_MS + 700)
    // Once the hero has finished entering, later .rise elements shouldn't wait
    const clear = setTimeout(() => root.style.removeProperty('--intro'), INTRO_MS + 2000)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(done)
      clearTimeout(clear)
      document.body.style.overflow = ''
    }
  }, [show])

  if (gone) return null
  const name = 'Zac Knight'
  const epoch = Math.round(count * EPOCHS)
  const loss = lossAt(count)
  const acc = 99.1 * (1 - Math.exp(-4.6 * count))
  return (
    <div aria-hidden className="intro fixed inset-0 z-[100] bg-canvas flex flex-col justify-between p-6 sm:p-12">
      <div className="flex justify-between font-mono text-[12px] tracking-wide text-mute">
        <span>
          <span className="text-live">$</span> python train.py --model zac
        </span>
        <span className="hidden sm:inline uppercase">Brisbane, AU</span>
      </div>
      <h2 className="font-serif text-ink text-[18vw] sm:text-[13vw] leading-[0.9] tracking-tight overflow-hidden pb-[0.08em]">
        {[...name].map((ch, i) => (
          <span key={i} className="intro-letter inline-block" style={{ '--i': i }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </h2>
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-4 min-w-0">
          <svg viewBox="0 0 300 100" className="w-[min(52vw,320px)] h-auto overflow-visible">
            {[25, 50, 75].map(y => (
              <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--color-line)" strokeDasharray="2 4" />
            ))}
            <path
              d={CURVE_PATH}
              fill="none"
              stroke="var(--color-flame)"
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - count}
            />
            <circle cx={count * 300} cy={100 - (loss / 2.6) * 96} r="3.5" fill="var(--color-cream)" />
          </svg>
          <dl className="grid grid-cols-3 gap-x-5 sm:gap-x-10 font-mono text-[11px] sm:text-[12px] uppercase tracking-wide">
            <div><dt className="text-mute">loss</dt><dd className="text-ink tabular-nums">{loss.toFixed(3)}</dd></div>
            <div><dt className="text-mute">acc</dt><dd className="text-live tabular-nums">{acc.toFixed(1)}%</dd></div>
            <div><dt className="text-mute">lr</dt><dd className="text-ink tabular-nums">3e-4</dd></div>
          </dl>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-[11px] sm:text-[12px] uppercase tracking-wide text-mute mb-2">epoch</p>
          <p className="font-serif text-ink text-5xl sm:text-8xl tabular-nums leading-none">
            {String(epoch).padStart(3, '0')}
            <span className="text-mute text-xl sm:text-4xl">/{EPOCHS}</span>
          </p>
        </div>
      </div>
      <div className="absolute left-0 bottom-0 h-[3px] bg-gradient-to-r from-flame via-gold to-live" style={{ width: `${count * 100}%` }} />
    </div>
  )
}

// ── Cursor, spotlight and card glow ───────────────────────────────────────────
// A dot that tracks the pointer exactly and a ring that trails it on a spring.
// The ring swells over anything interactive and shows a label from data-cursor.
export function Cursor() {
  const [enabled] = useState(() => finePointer() && !prefersReduced())
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 })
  const [state, setState] = useState({ hover: false, label: '', down: false, hidden: true })

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const last = { x: -1, y: -1 }
    const move = e => {
      last.x = e.clientX
      last.y = e.clientY
      x.set(e.clientX)
      y.set(e.clientY)
      document.documentElement.style.setProperty('--cx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--cy', `${e.clientY}px`)
      const target = e.target instanceof Element ? e.target : null
      const labelled = target?.closest('[data-cursor]')
      const interactive = target?.closest('a, button, [role="button"], label, summary')
      // Feed the hovered .spot card its local pointer position for the glow
      const spot = target?.closest('.spot')
      if (spot) {
        const r = spot.getBoundingClientRect()
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`)
        spot.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
      setState(s => {
        const next = { ...s, hover: !!(interactive || labelled), label: labelled?.dataset.cursor || '', hidden: false }
        return next.hover === s.hover && next.label === s.label && !s.hidden ? s : next
      })
    }
    // Content scrolls under a still pointer, so re-check what it's over
    const onScroll = () => {
      if (last.x < 0) return
      const target = document.elementFromPoint(last.x, last.y)
      if (target) move({ clientX: last.x, clientY: last.y, target })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const down = () => setState(s => ({ ...s, down: true }))
    const up = () => setState(s => ({ ...s, down: false }))
    const leave = () => setState(s => ({ ...s, hidden: true }))
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('pointerleave', leave)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null
  const size = state.label ? 84 : state.hover ? 52 : 30
  return (
    <>
      <div aria-hidden className="spotlight pointer-events-none fixed inset-0 z-[1]" />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] mix-blend-difference"
        style={{ x: rx, y: ry }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-white flex items-center justify-center"
          animate={{
            width: size,
            height: size,
            opacity: state.hidden ? 0 : 1,
            scale: state.down ? 0.8 : 1,
            backgroundColor: state.label ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          {state.label && (
            <span className="font-mono text-[11px] uppercase tracking-wide text-black">{state.label}</span>
          )}
        </motion.div>
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[91] mix-blend-difference"
        style={{ x, y }}
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white transition-opacity ${
            state.hidden || state.label ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </motion.div>
    </>
  )
}

// ── Film grain ────────────────────────────────────────────────────────────────
export function Grain() {
  return <div aria-hidden className="grain pointer-events-none fixed -inset-[50%] z-[80]" />
}

// ── Text ──────────────────────────────────────────────────────────────────────
// Types a list of lines out character by character, one line after another,
// with a caret at the typing position. Untyped text is laid out invisibly so
// the block keeps its final height while it types. Remount (key) to replay.
const LINE_PAUSE = 14 // extra "characters" of pause before each new line

export function TypeLines({ lines, className = '', lineClass = '', marker = '✓' }) {
  const [ref, inView] = useInViewOnce(0.25)
  const [typed, setTyped] = useState(() => (prefersReduced() ? Infinity : 0))

  const starts = []
  let total = 0
  for (const line of lines) {
    starts.push(total + LINE_PAUSE)
    total += LINE_PAUSE + line.length
  }

  useEffect(() => {
    if (!inView || prefersReduced()) return
    // Aim for roughly 3.5s whatever the length, within a readable typing speed
    const msPerChar = Math.min(22, Math.max(5, 3500 / total))
    const start = performance.now()
    let frame
    const tick = now => {
      const n = (now - start) / msPerChar
      setTyped(n)
      if (n < total) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, total])

  // Inside a [data-autoscroll] panel, keep the caret in view while typing
  // (scrolls only that panel, never the page)
  const caretRef = useRef(null)
  useEffect(() => {
    const caret = caretRef.current
    const box = caret?.closest('[data-autoscroll]')
    if (!box || box.scrollHeight <= box.clientHeight) return
    const c = caret.getBoundingClientRect()
    const b = box.getBoundingClientRect()
    if (c.bottom > b.bottom - 12) box.scrollTop += c.bottom - b.bottom + 28
  }, [typed])

  return (
    <ul ref={ref} className={className}>
      {lines.map((line, i) => {
        const shown = Math.max(0, Math.min(line.length, Math.floor(typed - starts[i])))
        const started = typed >= starts[i] - LINE_PAUSE / 2
        const typing = started && shown < line.length
        const last = i === lines.length - 1
        return (
          <li key={i} className={lineClass}>
            <span className={`text-live shrink-0 transition-opacity duration-150 ${started ? 'opacity-100' : 'opacity-0'}`}>{marker}</span>
            <span>
              {line.slice(0, shown)}
              {(typing || (last && shown === line.length && typed < Infinity)) && (
                <span aria-hidden className="inline-block w-0 overflow-visible">
                  <span ref={caretRef} className={`text-flame ${typing ? '' : 'caret'}`}>▍</span>
                </span>
              )}
              <span className="invisible">{line.slice(shown)}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// Splits text into words that slide up out of a mask, staggered. With `play`
// it runs on mount (honouring the intro delay), otherwise when scrolled into view.
export function SplitText({ text, className = '', play = false, delay = 0, stagger = 55 }) {
  const [ref, inView] = useInViewOnce(0.3)
  const shown = play || inView
  const words = text.split(' ')
  return (
    <span ref={ref} className={`split ${shown ? 'split-in' : ''} ${play ? 'split-intro' : ''} ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span aria-hidden className="split-mask">
            <span className="split-word" style={{ '--d': `${delay + i * stagger}ms` }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}
