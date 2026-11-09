import { Fragment, useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import { finePointer, prefersReduced, useInViewOnce } from '../lib/motion'

// ── Intro ─────────────────────────────────────────────────────────────────────
// A one-per-session curtain styled as autoregressive decoding: a small causal
// transformer generates the name one token at a time, showing its top-k next-token
// distribution and a causal attention map that fills in as the sequence grows.
// Then the panel wipes upward to reveal the page. The hero waits via --intro.
const INTRO_MS = 3700 // includes a deliberate 2s hold so the loading screen can be seen (keep in sync with .intro in index.css)
const NAME = 'Zac Knight'
const TOKENS = [...NAME]
const VOCAB = 'abcdeghiklmnorstuyzACKZ '

// Deterministic pseudo-random numbers, so every visit decodes the same way
const jitter = i => Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1)

// For each step: the chosen token plus two plausible runners-up, as a softmax
const TOPK = TOKENS.map((tok, i) => {
  const top = 0.58 + jitter(i + 3) * 0.36
  const rest = 1 - top
  const pick = k => {
    let c = VOCAB[Math.floor(jitter(i * 7 + k) * VOCAB.length)]
    for (let n = 1; c === tok || c === ' '; n++) c = VOCAB[Math.floor(jitter(i * 7 + k + n * 31) * VOCAB.length)]
    return c
  }
  const second = rest * (0.55 + jitter(i + 11) * 0.3)
  return [[tok, top], [pick(1), second], [pick(2), rest - second]]
})
// log p(sequence) after each step
const LOGP = TOPK.reduce((acc, [[, p]]) => [...acc, (acc.at(-1) ?? 0) + Math.log(p)], [])
// Causal attention weights: row i attends to columns 0..i, each row sums to 1
const ATTN = TOKENS.map((_, i) => {
  const raw = Array.from({ length: i + 1 }, (_, j) => (j === i ? 1.6 : 0.2) + jitter(i * 13 + j) * (j === 0 ? 1.4 : 1))
  const sum = raw.reduce((x, y) => x + y, 0)
  return raw.map(r => r / sum)
})
const glyph = t => (t === ' ' ? '␣' : t)

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
      setCount(t)
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
  const n = TOKENS.length
  const decoded = Math.min(n, Math.floor(count * n + 0.0001)) // tokens generated so far
  const step = Math.min(n - 1, decoded) // the step whose distribution is shown
  const tps = decoded ? (decoded / Math.max(0.2, count * ((INTRO_MS - 500) / 1000))).toFixed(1) : '0.0'
  return (
    <div aria-hidden className="intro fixed inset-0 z-[100] bg-canvas flex flex-col justify-between p-6 sm:p-12">
      <div className="flex justify-between gap-4 font-mono text-[12px] tracking-wide text-mute">
        <span className="truncate min-w-0">
          <span className="text-live">$</span> python generate.py --model zk-transformer --prompt "&lt;bos&gt;" --top-k 3
        </span>
        <span className="hidden sm:inline uppercase shrink-0">Brisbane, AU</span>
      </div>
      <h2 className="font-serif text-ink text-[18vw] sm:text-[13vw] leading-[0.9] tracking-tight overflow-hidden pb-[0.08em] whitespace-nowrap">
        {TOKENS.slice(0, decoded).map((ch, i) => (
          <span key={i} className="intro-letter inline-block" style={{ '--i': 0 }}>
            {ch === ' ' ? '\u00a0' : ch}
          </span>
        ))}
        {decoded < n && <span className="intro-caret inline-block align-baseline bg-flame" />}
      </h2>
      <div className="flex items-end justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-3 min-w-0 font-mono text-[11px] sm:text-[12px] uppercase tracking-wide">
          <p className="text-mute">
            next token · step {String(step + 1).padStart(2, '0')}/{n}
          </p>
          <ul className="flex flex-col gap-1.5 w-[min(46vw,300px)]">
            {TOPK[step].map(([tok, p], k) => (
              <li key={k} className="grid grid-cols-[1.5rem_1fr_3.2rem] items-center gap-3">
                <span className={k ? 'text-body normal-case' : 'text-ink normal-case'}>{glyph(tok)}</span>
                <span className="h-[6px] bg-line overflow-hidden">
                  <span className={`block h-full ${k ? 'bg-mute' : 'bg-live'}`} style={{ width: `${p * 100}%` }} />
                </span>
                <span className={`tabular-nums text-right ${k ? 'text-body' : 'text-live'}`}>{p.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-3 gap-x-5 sm:gap-x-10 mt-1">
            <div><dt className="text-mute">log p</dt><dd className="text-ink tabular-nums">{(decoded ? LOGP[decoded - 1] : 0).toFixed(2)}</dd></div>
            <div><dt className="text-mute">tok/s</dt><dd className="text-live tabular-nums">{tps}</dd></div>
            <div><dt className="text-mute">temp</dt><dd className="text-ink tabular-nums">0.7</dd></div>
          </dl>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <p className="font-mono text-[11px] sm:text-[12px] uppercase tracking-wide text-mute">
            <span className="hidden sm:inline">causal </span>attention<span className="hidden sm:inline"> · head 0</span>
          </p>
          <div className="grid gap-[2px] w-[min(30vw,190px)]" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {TOKENS.map((_, i) =>
              TOKENS.map((__, j) => (
                <span
                  key={`${i}-${j}`}
                  className="aspect-square transition-opacity duration-300"
                  style={{
                    background: j > i ? 'var(--color-line)' : 'var(--color-flame)',
                    opacity: j > i ? 0.35 : i < decoded ? 0.12 + ATTN[i][j] * 1.6 : 0.06,
                  }}
                />
              ))
            )}
          </div>
          <div className="grid gap-[2px] w-[min(30vw,190px)] font-mono text-[9px] sm:text-[10px] text-mute text-center" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {TOKENS.map((t, i) => <span key={i} className={i < decoded ? 'text-body' : ''}>{glyph(t)}</span>)}
          </div>
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
