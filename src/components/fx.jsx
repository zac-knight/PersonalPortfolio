import { Fragment, useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import { finePointer, prefersReduced, useInViewOnce } from '../lib/motion'

// ── Intro ─────────────────────────────────────────────────────────────────────
// A one-per-session curtain styled as a progressively grown GAN generating an
// image: the name is produced as a tiny, noisy block image, then the resolution
// doubles stage by stage, each new layer sweeping in over the last, until the
// full-resolution name glows. Then the panel cross-fades into the page.
// The hero waits via --intro.
// About 0.5s passes before the app mounts; fading out 7s after mount over 1.2s
// has the page fully shown ~8.7s after opening (5s of generation, then a 2s hold)
const INTRO_MS = 7150 // the fade-out starts at INTRO_MS - 150 (keep in sync with .intro in index.css)
const EXIT_MS = 1200 // the cross-fade into the site (keep in sync with .intro in index.css)
const HOLD_MS = 2000 // the finished name stays fully visible this long before the fade
const SAMPLE_MS = INTRO_MS - 150 - HOLD_MS // generation time
// Ease in and out: slow to start, slow to finish
const smooth = x => x * x * (3 - 2 * x)
const NAME = 'Zac Knight'
// Blocks across the name at each stage; the last stage is the full-resolution image
const RES = [6, 9, 12, 16, 24, 32, 48, 64, 96, 128]
const STAGES = RES.length + 1
const CHECKPOINTS = [0, 3, 6, 8, 10] // stages shown in the output strip
// Noise added at each stage, falling as the resolution grows
const sigmaAt = x => Math.pow(1 - x, 1.6)
const SCHEDULE_PATH = Array.from({ length: 41 }, (_, i) => `${i ? 'L' : 'M'}${(i / 40) * 160},${4 + (1 - sigmaAt(i / 40)) * 52}`).join(' ')
// Orange → gold → green across the name, matching the site's palette
const RAMP = [[240, 136, 62], [233, 160, 64], [227, 179, 65], [160, 205, 98], [61, 220, 151]]
const rampAt = f => {
  const x = Math.min(0.999, Math.max(0, f)) * (RAMP.length - 1)
  const i = Math.floor(x)
  const k = x - i
  return RAMP[i].map((c, j) => Math.round(c + (RAMP[i + 1][j] - c) * k))
}

// Deterministic pseudo-random numbers, so every visit generates the same way
const hash = i => Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1)
const gauss = i => Math.sqrt(-2 * Math.log(hash(i) || 1e-6)) * Math.cos(2 * Math.PI * hash(i + 0.5))

// Render the name once, then build one image per resolution stage: each block is
// the average coverage of the name in that cell plus that stage's noise
function buildStages(W, H, dpr) {
  const off = document.createElement('canvas')
  off.width = W
  off.height = H
  const o = off.getContext('2d', { willReadFrequently: true })
  let size = Math.min(W * 0.17, H * 0.3)
  const font = s => `400 ${s}px "Libre Caslon Display", Georgia, serif`
  o.font = font(size)
  while (o.measureText(NAME).width > W * 0.86) o.font = font((size *= 0.95))
  o.textAlign = 'center'
  o.textBaseline = 'middle'
  o.fillStyle = '#fff'
  o.fillText(NAME, W / 2, H * 0.45)
  const alpha = o.getImageData(0, 0, W, H).data
  // the name's bounds, padded so noise has somewhere to live
  let x0 = W, x1 = 0, y0 = H, y1 = 0
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2)
      if (alpha[(y * W + x) * 4 + 3] > 60) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
      }
  const pad = (x1 - x0) * 0.05
  x0 = Math.max(0, Math.floor(x0 - pad)); x1 = Math.min(W, Math.ceil(x1 + pad))
  y0 = Math.max(0, Math.floor(y0 - pad)); y1 = Math.min(H, Math.ceil(y1 + pad))
  const bw = x1 - x0, bh = y1 - y0
  // summed-area table of coverage, so any block's average is four lookups
  const sat = new Float32Array((bw + 1) * (bh + 1))
  for (let y = 1; y <= bh; y++) {
    let row = 0
    for (let x = 1; x <= bw; x++) {
      row += alpha[((y0 + y - 1) * W + (x0 + x - 1)) * 4 + 3] / 255
      sat[y * (bw + 1) + x] = sat[(y - 1) * (bw + 1) + x] + row
    }
  }
  const cover = (ax, ay, bx, by) => {
    const S = (x, y) => sat[Math.min(bh, y) * (bw + 1) + Math.min(bw, x)]
    const area = Math.max(1, (Math.min(bw, bx) - ax) * (Math.min(bh, by) - ay))
    return (S(bx, by) - S(ax, by) - S(bx, ay) + S(ax, ay)) / area
  }
  const stages = RES.map((n, li) => {
    const cell = bw / n
    const rows = Math.ceil(bh / cell)
    const c = document.createElement('canvas')
    c.width = Math.round(bw * dpr)
    c.height = Math.round(bh * dpr)
    const g = c.getContext('2d')
    g.scale(dpr, dpr)
    const sigma = sigmaAt(li / (STAGES - 1))
    const gap = cell > 10 ? 1.5 : cell > 5 ? 0.75 : 0
    for (let r = 0; r < rows; r++)
      for (let q = 0; q < n; q++) {
        const ax = Math.floor(q * cell), ay = Math.floor(r * cell)
        const v = Math.min(1, Math.max(0, cover(ax, ay, Math.ceil((q + 1) * cell), Math.ceil((r + 1) * cell)) * (1 + 0.4 * sigma) + gauss(li * 9973 + r * 211 + q) * 0.32 * sigma))
        if (v < 0.05) continue
        const [R, G, B] = rampAt((q + 0.5) / n)
        g.fillStyle = `rgba(${R},${G},${B},${v})`
        g.fillRect(q * cell, r * cell, cell - gap, cell - gap)
      }
    return { c, n, rows, sigma }
  })
  // final stage: the crisp name, filled with the same gradient
  const c = document.createElement('canvas')
  c.width = Math.round(bw * dpr)
  c.height = Math.round(bh * dpr)
  const g = c.getContext('2d')
  g.scale(dpr, dpr)
  const grad = g.createLinearGradient(0, 0, bw, 0)
  RAMP.forEach((rgb, i) => grad.addColorStop(i / (RAMP.length - 1), `rgb(${rgb})`))
  g.fillStyle = grad
  g.font = o.font
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(NAME, W / 2 - x0, H * 0.45 - y0)
  stages.push({ c, n: 0, rows: 0, sigma: 0 })
  return { x0, y0, bw, bh, stages }
}

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
  const [res, setRes] = useState(null) // resolution of each stage, for the readouts
  const canvasRef = useRef(null)
  const thumbRefs = useRef([])

  useEffect(() => {
    if (!show) return
    const root = document.documentElement
    try {
      sessionStorage.setItem('zk-intro', '1')
    } catch {
      /* ignore */
    }
    document.body.style.overflow = 'hidden'
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    let img = null
    // Build the stages once the name's font is ready (or after a short wait)
    Promise.race([document.fonts?.load('400 120px "Libre Caslon Display"'), new Promise(r => setTimeout(r, 250))])
      .catch(() => {})
      .then(() => {
        img = buildStages(W, H, dpr)
        setRes(img.stages.map(s => (s.n ? `${s.n}×${s.rows}` : 'full')))
      })

    const start = performance.now()
    let formedAt = null
    const captured = new Set()
    let frame
    const tick = now => {
      // the first frame's timestamp can be a moment before start, so clamp at 0
      const ms = Math.max(0, now - start)
      const t = Math.min(1, ms / SAMPLE_MS)
      setCount(t)
      ctx.clearRect(0, 0, W, H)
      if (img) {
        const { x0, y0, bw, bh, stages } = img
        const f = t * (STAGES - 1)
        const s = Math.min(STAGES - 1, Math.floor(f))
        const a = s === STAGES - 1 ? 1 : smooth(f - s)
        // a slow push-in, for scale
        const zoom = 1.06 - 0.06 * smooth(t)
        ctx.save()
        ctx.translate(W / 2, H * 0.45)
        ctx.scale(zoom, zoom)
        ctx.translate(-W / 2, -H * 0.45)
        ctx.imageSmoothingEnabled = false
        if (s === STAGES - 1) {
          // the finished name: a soft glow that breathes while it holds
          if (formedAt === null) formedAt = ms
          const since = ms - formedAt
          ctx.imageSmoothingEnabled = true
          ctx.shadowColor = 'rgba(240,136,62,0.45)'
          ctx.shadowBlur = 18 + 10 * Math.sin(since / 380)
          ctx.drawImage(stages[s].c, x0, y0, bw, bh)
          ctx.shadowBlur = 0
        } else {
          // the current stage, with the next sweeping in left to right over it
          ctx.drawImage(stages[s].c, x0, y0, bw, bh)
          const edge = bw * a
          ctx.save()
          ctx.beginPath()
          ctx.rect(x0, y0, edge, bh)
          ctx.clip()
          ctx.clearRect(x0, y0, edge, bh)
          ctx.imageSmoothingEnabled = s + 1 === STAGES - 1
          ctx.drawImage(stages[s + 1].c, x0, y0, bw, bh)
          ctx.restore()
          // a bright scanline at the sweep front
          const grad = ctx.createLinearGradient(x0 + edge - 40, 0, x0 + edge + 4, 0)
          grad.addColorStop(0, 'rgba(246,238,231,0)')
          grad.addColorStop(1, 'rgba(246,238,231,0.35)')
          ctx.fillStyle = grad
          ctx.fillRect(x0 + edge - 40, y0, 44, bh)
          ctx.fillStyle = 'rgba(246,238,231,0.9)'
          ctx.fillRect(x0 + edge, y0, 1.5, bh)
        }
        ctx.restore()
        // Capture the output strip as generation reaches each checkpoint stage
        CHECKPOINTS.forEach((cs, i) => {
          const th = thumbRefs.current[i]
          if (captured.has(i) || s < cs || !th) return
          captured.add(i)
          th.width = th.clientWidth * dpr
          th.height = th.clientHeight * dpr
          const tc = th.getContext('2d')
          tc.imageSmoothingEnabled = cs === STAGES - 1
          const k = Math.min(th.width / (bw * dpr), th.height / (bh * dpr))
          const dw = bw * dpr * k, dh = bh * dpr * k
          tc.drawImage(stages[cs].c, (th.width - dw) / 2, (th.height - dh) / 2, dw, dh)
        })
      }
      if (ms < INTRO_MS - 150 + EXIT_MS) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const done = setTimeout(() => {
      setGone(true)
      document.body.style.overflow = ''
    }, INTRO_MS - 150 + EXIT_MS + 100)
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
  // Readouts move stage by stage
  const f = count * (STAGES - 1)
  const stage = Math.min(STAGES - 1, Math.floor(f))
  const fade = stage === STAGES - 1 ? 1 : smooth(f - stage)
  const stageT = stage / (STAGES - 1)
  const sigma = sigmaAt(stageT)
  const label = i => res?.[i] ?? (i === STAGES - 1 ? 'full' : `${RES[i]}×…`)
  return (
    <div aria-hidden className="intro fixed inset-0 z-[100] bg-canvas">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="intro-ui relative h-full flex flex-col justify-between p-6 sm:p-12 font-mono text-[11px] sm:text-[12px] tracking-wide pointer-events-none">
        <div className="flex justify-between gap-4 text-mute">
          <div className="min-w-0">
            <p className="truncate">
              <span className="text-live">$</span> python generate.py --model progressive-gan --grow {RES[0]}→full --seed 42 --prompt "zac knight"
            </p>
            <p className="mt-1 truncate">generator · 23.1M params · fp16 · cuda:0 · new layers faded in with α</p>
            <p className={`mt-1 truncate transition-opacity duration-300 ${count >= 1 ? 'opacity-100 text-live' : 'opacity-0'}`}>
              ✓ image saved → zac_knight.png
            </p>
          </div>
          <span className="hidden sm:inline uppercase shrink-0">Brisbane, AU</span>
        </div>

        <div className="flex flex-col gap-5">
          {/* Generator output at a few resolutions, captured as each stage is reached */}
          <div className="flex flex-col gap-1.5 self-center w-full max-w-[640px]">
            <p className="text-mute uppercase text-center">generator output as resolution grows</p>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {CHECKPOINTS.map((cs, i) => (
                <div key={cs} className="flex flex-col gap-1">
                  <canvas
                    ref={el => (thumbRefs.current[i] = el)}
                    className={`w-full aspect-[16/7] border transition-colors duration-300 ${stage >= cs ? 'border-line' : 'border-line/40'}`}
                  />
                  <span className={`text-center tabular-nums ${stage >= cs ? 'text-body' : 'text-mute/50'}`}>{label(cs)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between gap-6 uppercase">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 sm:gap-x-10 gap-y-2">
              <div><dt className="text-mute">stage</dt><dd className="text-ink tabular-nums">{String(stage + 1).padStart(2, '0')}/{STAGES}</dd></div>
              <div><dt className="text-mute">resolution</dt><dd className="text-ink tabular-nums normal-case">{label(stage)}</dd></div>
              <div><dt className="text-mute">fade-in <span className="normal-case">α</span></dt><dd className="text-live tabular-nums">{fade.toFixed(2)}</dd></div>
              <div><dt className="text-mute"><span className="normal-case">σ</span> noise</dt><dd className="text-flame tabular-nums">{sigma.toFixed(2)}</dd></div>
            </dl>
            {/* Noise per stage, with the current stage marked */}
            <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
              <p className="text-mute">noise per stage <span className="normal-case">σ</span></p>
              <svg viewBox="0 0 160 60" className="w-[180px] h-auto overflow-visible">
                <line x1="0" x2="160" y1="56" y2="56" stroke="var(--color-line)" />
                <line x1="0" x2="0" y1="4" y2="56" stroke="var(--color-line)" />
                <path d={SCHEDULE_PATH} fill="none" stroke="var(--color-mute)" strokeWidth="1.5" />
                <path d={SCHEDULE_PATH} fill="none" stroke="var(--color-flame)" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - stageT} />
                <circle cx={stageT * 160} cy={4 + (1 - sigma) * 52} r="3.5" fill="var(--color-cream)" />
              </svg>
            </div>
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
