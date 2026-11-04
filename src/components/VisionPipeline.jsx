import { useEffect, useRef, useState } from 'react'
import samples from '../data/vision'
import { canny, gaussian, greyscale, sobel } from '../lib/vision'
import { prefersReduced } from '../lib/motion'
import { Window } from './ui'

// A computer-vision pipeline over public-domain photos. The classic transforms
// (greyscale, Gaussian blur, Sobel gradients, Canny edges) are computed live in
// the browser from each photo's pixels; the detection and classification stages
// show real COCO-SSD and MobileNet v2 output, precomputed offline so the page
// stays static (see src/data/vision.js).

const STAGES = [
  { key: 'rgb', label: 'input', ms: 1100 },
  { key: 'grey', label: 'grey', ms: 1000 },
  { key: 'blur', label: 'blur', ms: 1000 },
  { key: 'sobel', label: 'sobel', ms: 1300 },
  { key: 'canny', label: 'canny', ms: 1500 },
  { key: 'detect', label: 'detect', ms: 3400 },
  { key: 'parts', label: 'parts', ms: 3600 },
  { key: 'classify', label: 'classify', ms: 3200 },
]
// Stages drawn over the original photo (as opposed to a live transform)
const PHOTO = new Set(['detect', 'parts', 'classify'])
const hasParts = s => (s.parts?.length ?? 0) > 0
const WIPE_MS = 480
const IDLE_MS = 9000 // after a manual pick, hold before auto-advancing again
const PW = 320 // processing width for the live transforms
const ASPECT = 4 / 3 // display frame

const base = import.meta.env.BASE_URL
const srcOf = s => `${base}cv/${s.slug}.jpg`
const HEAT = [[21, 19, 17], [90, 42, 26], [240, 136, 62], [227, 179, 65], [246, 238, 231]]
const heat = t => {
  const x = Math.min(0.9999, Math.max(0, t)) * (HEAT.length - 1)
  const i = Math.floor(x)
  const f = x - i
  return HEAT[i].map((c, j) => c + (HEAT[i + 1][j] - c) * f)
}

// Renders each live stage of one photo to its own small canvas
function processPhoto(img) {
  const w = PW
  const h = Math.round((PW * img.naturalHeight) / img.naturalWidth)
  const make = () => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c
  }
  const rgb = make()
  const rctx = rgb.getContext('2d', { willReadFrequently: true })
  rctx.drawImage(img, 0, 0, w, h)
  const px = rctx.getImageData(0, 0, w, h).data
  const grey = greyscale(px, w, h)
  const blur = gaussian(grey, w, h)
  const { mag, dir, max } = sobel(blur, w, h)
  const edges = canny(mag, dir, w, h, max)

  const paint = fn => {
    const c = make()
    const ctx = c.getContext('2d')
    const data = ctx.createImageData(w, h)
    for (let i = 0; i < w * h; i++) {
      const [r, g, b] = fn(i)
      data.data.set([r, g, b, 255], i * 4)
    }
    ctx.putImageData(data, 0, 0)
    return c
  }
  const edgeCount = edges.reduce((n, e) => n + e, 0)
  return {
    rgb,
    grey: paint(i => Array(3).fill(grey[i] * 255)),
    blur: paint(i => Array(3).fill(blur[i] * 255)),
    sobel: paint(i => heat(Math.pow(mag[i] / max, 0.6))),
    canny: paint(i => (edges[i] ? [246, 238, 231] : [21, 19, 17])),
    stats: { w, h, edgePct: (edgeCount / (w * h)) * 100, gradMax: max },
  }
}

// Object label: the crop classifier's fine label when it was confident
const labelOf = o => o[6] || o[0]
// Compact confidence like ".94" (or "1.0" when it rounds up)
const conf = v => (v >= 0.995 ? '1.0' : v.toFixed(2).slice(1))

// MediaPipe hand topology: wrist (0) to each finger's four joints, plus the palm
const HAND_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
]
const pretty = n => n.replace(/_/g, ' ').toLowerCase()

export default function VisionPipeline({ className = '' }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const run = useRef({ sample: 0, stage: 0, t0: 0, touched: -Infinity, paused: false })
  const [ui, setUi] = useState({ sample: 0, stage: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas.getContext('2d')
    const reduced = prefersReduced()
    const r = run.current
    const cache = new Map() // sample index → processed stages
    const images = new Map()
    let cw = 0
    let ch = 0
    let dpr = 1
    let frame = 0
    let visible = true
    let cancelled = false

    const load = i =>
      new Promise(resolve => {
        if (cache.has(i)) return resolve(cache.get(i))
        const img = new Image()
        img.src = srcOf(samples[i])
        img.onload = () => {
          if (cancelled) return
          images.set(i, img)
          cache.set(i, processPhoto(img))
          resolve(cache.get(i))
        }
      })

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      cw = wrap.clientWidth
      ch = cw / ASPECT
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      canvas.style.height = `${ch}px`
    }

    // Cover-fit a w×h source into the frame
    const fit = (w, h) => {
      const s = Math.max(cw / w, ch / h)
      return { s, ox: (cw - w * s) / 2, oy: (ch - h * s) / 2 }
    }

    const drawStage = (p, key, sample) => {
      const photo = PHOTO.has(key)
      const src = photo ? images.get(sample) : p[key]
      const sw = photo ? src.naturalWidth : p.stats.w
      const sh = photo ? src.naturalHeight : p.stats.h
      const { s, ox, oy } = fit(sw, sh)
      ctx.imageSmoothingEnabled = key !== 'canny'
      ctx.drawImage(src, ox, oy, sw * s, sh * s)
      if (key === 'classify' || key === 'parts') {
        ctx.fillStyle = `rgba(21,19,17,${key === 'parts' ? 0.25 : 0.35})`
        ctx.fillRect(0, 0, cw, ch)
      }
    }

    const tag = (text, x, y, col) => {
      const tw = ctx.measureText(text).width + 8
      const ty = Math.max(0, y - 14)
      ctx.fillStyle = `rgb(${col})`
      ctx.fillRect(x, ty, tw, 14)
      ctx.fillStyle = '#0d0c0b'
      ctx.fillText(text, x + 4, ty + 10)
    }

    // Hand skeletons: joints appear wrist-outward, then the gesture label
    const drawHands = (S, elapsed) => {
      const { s, ox, oy } = fit(S.w, S.h)
      const P = ([x, y]) => [x * s + ox, y * s + oy]
      S.hands.forEach((hand, h) => {
        const t = Math.min(1, Math.max(0, (elapsed - 250 - h * 450) / 900))
        if (!t) return
        const col = h === 0 ? '61,220,151' : '227,179,65'
        const shown = Math.ceil(t * 21)
        ctx.lineWidth = 2
        ctx.strokeStyle = `rgba(${col},0.9)`
        for (const [a, b] of HAND_EDGES) {
          if (a >= shown || b >= shown) continue
          const [ax, ay] = P(hand.landmarks[a])
          const [bx, by] = P(hand.landmarks[b])
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
          ctx.stroke()
        }
        hand.landmarks.slice(0, shown).forEach((pt, i) => {
          const [x, y] = P(pt)
          ctx.beginPath()
          ctx.arc(x, y, i % 4 === 0 ? 3.2 : 2.4, 0, Math.PI * 2)
          ctx.fillStyle = i % 4 === 0 ? '#f6eee7' : `rgb(${col})`
          ctx.fill()
        })
        if (t === 1) {
          const xs = hand.landmarks.map(p => P(p)[0])
          const ys = hand.landmarks.map(p => P(p)[1])
          const [name, score] = hand.gestures[0]
          tag(`${pretty(name)} ${conf(score)}`, Math.min(...xs), Math.min(...ys) - 4, col)
        }
      })
    }

    // Faces: box, 68 landmarks traced in, then the top expression
    const drawFaces = (S, elapsed) => {
      const { s, ox, oy } = fit(S.w, S.h)
      S.faces.forEach((face, f) => {
        const t = Math.min(1, Math.max(0, (elapsed - 250 - f * 260) / 700))
        if (!t) return
        const [x, y, w, h] = face.box
        ctx.globalAlpha = Math.min(1, t * 2)
        ctx.lineWidth = 1.5
        ctx.strokeStyle = 'rgb(61,220,151)'
        ctx.strokeRect(x * s + ox, y * s + oy, w * s, h * s)
        ctx.fillStyle = 'rgba(246,238,231,0.9)'
        face.landmarks.slice(0, Math.ceil(t * 68)).forEach(([lx, ly]) => {
          ctx.fillRect(lx * s + ox - 1, ly * s + oy - 1, 2, 2)
        })
        ctx.globalAlpha = 1
        if (t === 1) {
          const [name, score] = face.expressions[0]
          tag(`${name} ${conf(score)}`, x * s + ox, y * s + oy, '61,220,151')
        }
      })
    }

    // Open-vocabulary parts: gold boxes, largest first so small ones sit on top
    const drawParts = (sample, elapsed) => {
      const S = samples[sample]
      if (!hasParts(S)) return
      const { s, ox, oy } = fit(S.w, S.h)
      ctx.font = '600 10px "Geist Mono", ui-monospace, monospace'
      const parts = [...S.parts].sort((a, b) => b[3] * b[4] - a[3] * a[4])
      const step = Math.min(80, 1600 / parts.length)
      parts.forEach(([label, x, y, w, h, score], i) => {
        const appear = Math.min(1, Math.max(0, (elapsed - 250 - i * step) / 220))
        if (!appear) return
        const bx = x * s + ox
        const by = y * s + oy
        ctx.globalAlpha = appear
        ctx.lineWidth = 1.5
        ctx.strokeStyle = 'rgb(227,179,65)'
        ctx.fillStyle = 'rgba(227,179,65,0.1)'
        ctx.fillRect(bx, by, w * s, h * s)
        ctx.strokeRect(bx, by, w * s, h * s)
        if (w * s > 28) tag(`${label} ${conf(score)}`, bx, by, '227,179,65')
        ctx.globalAlpha = 1
      })
    }

    const drawBoxes = (sample, elapsed) => {
      const S = samples[sample]
      ctx.font = '600 10px "Geist Mono", ui-monospace, monospace'
      if (S.kind === 'gesture') return drawHands(S, elapsed)
      if (S.kind === 'faces') return drawFaces(S, elapsed)
      const { s, ox, oy } = fit(S.w, S.h)
      const objs = [...S.objects].sort((a, b) => a[1] - b[1])
      const step = Math.min(70, 1300 / objs.length)
      ctx.font = '600 10px "Geist Mono", ui-monospace, monospace'
      objs.forEach((o, i) => {
        const appear = Math.min(1, Math.max(0, (elapsed - 250 - i * step) / 220))
        if (!appear) return
        const [, x, y, w, h, score] = o
        const person = o[0] === 'person'
        const col = person ? '61,220,151' : '240,136,62'
        const bx = x * s + ox
        const by = y * s + oy
        const grow = 1 + (1 - appear) * 0.15
        const bw = w * s * grow
        const bh = h * s * grow
        const gx = bx - (bw - w * s) / 2
        const gy = by - (bh - h * s) / 2
        ctx.globalAlpha = appear
        ctx.lineWidth = person ? 1.25 : 2
        ctx.strokeStyle = `rgb(${col})`
        ctx.fillStyle = `rgba(${col},0.08)`
        ctx.fillRect(gx, gy, bw, bh)
        ctx.strokeRect(gx, gy, bw, bh)
        // Label the larger boxes; small crowd boxes stay unlabelled to keep it legible
        if (!person || w * s > 34) {
          const text = person ? conf(score) : `${labelOf(o)} ${conf(o[7] || score)}`
          const tw = ctx.measureText(text).width + 8
          const ty = Math.max(0, gy - 14)
          ctx.fillStyle = `rgb(${col})`
          ctx.fillRect(gx, ty, tw, 14)
          ctx.fillStyle = '#0d0c0b'
          ctx.fillText(text, gx + 4, ty + 10)
        }
        ctx.globalAlpha = 1
      })
    }

    const render = now => {
      const p = cache.get(r.sample)
      if (!p) return
      const elapsed = now - r.t0
      const key = STAGES[r.stage].key
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#151311'
      ctx.fillRect(0, 0, cw, ch)
      // Wipe the new stage in over the previous one, left to right
      const wipe = reduced ? 1 : Math.min(1, elapsed / WIPE_MS)
      const prevKey = r.stage > 0 ? STAGES[r.stage - 1].key : null
      const samePhoto = prevKey && PHOTO.has(prevKey) && PHOTO.has(key)
      if (wipe < 1 && prevKey && !samePhoto) {
        drawStage(p, prevKey, r.sample)
        if (prevKey === 'detect') drawBoxes(r.sample, 99999)
      }
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, cw * (prevKey && !samePhoto ? wipe : 1), ch)
      ctx.clip()
      drawStage(p, key, r.sample)
      ctx.restore()
      if (wipe < 1 && prevKey) {
        ctx.fillStyle = 'rgba(240,136,62,0.9)'
        ctx.fillRect(cw * wipe - 1, 0, 2, ch)
      }
      if (key === 'detect') drawBoxes(r.sample, reduced ? 99999 : elapsed)
      if (key === 'parts') drawParts(r.sample, reduced ? 99999 : elapsed)
      if (key === 'classify') drawBoxes(r.sample, 99999)
    }

    const go = (sample, stage, now) => {
      r.sample = sample
      r.stage = stage
      r.t0 = now
      setUi({ sample, stage })
      load((sample + 1) % samples.length) // preload the next photo
    }

    const tick = now => {
      if (!r.paused && now - r.touched > IDLE_MS && !reduced) {
        if (now - r.t0 > STAGES[r.stage].ms) {
          if (r.stage < STAGES.length - 1) {
            let next = r.stage + 1
            if (STAGES[next].key === 'parts' && !hasParts(samples[r.sample])) next++
            go(r.sample, next, now)
          }
          else {
            const next = (r.sample + 1) % samples.length
            if (cache.has(next)) go(next, 0, now)
          }
        }
      } else if (r.paused) {
        r.t0 += 16.7 // hold the current stage while hovered
      }
      render(now)
      frame = visible ? requestAnimationFrame(tick) : 0
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      render(performance.now())
    })
    ro.observe(wrap)

    let io
    const wait = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--intro')) || 0
    load(0).then(() => {
      if (cancelled) return
      const start = performance.now()
      if (reduced) {
        go(0, STAGES.findIndex(s => s.key === 'detect'), start)
        render(start + 99999)
        return
      }
      go(0, 0, start + wait)
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible && !frame) frame = requestAnimationFrame(tick)
      })
      io.observe(canvas)
      frame = requestAnimationFrame(tick)
    })

    let pick = 0
    r.api = {
      jump: (sample, stage, t) => {
        r.touched = t
        const token = ++pick
        load(sample).then(() => {
          if (token !== pick) return // a newer pick superseded this one
          go(sample, stage, performance.now())
          if (reduced || !frame) render(performance.now() + 99999)
        })
      },
    }

    return () => {
      cancelled = true
      ro.disconnect()
      io?.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  const S = samples[ui.sample]
  const stage = STAGES[ui.stage]
  const jump = (sample, stageIdx, e) => run.current.api?.jump(sample, stageIdx, e.timeStamp)
  // Previous / next photo, wrapping around
  const step = (dir, e) => jump((ui.sample + dir + samples.length) % samples.length, 0, e)
  const onKey = e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      step(e.key === 'ArrowRight' ? 1 : -1, e)
    }
  }

  // Group detections by final label for the readout
  const groups = Object.values(
    S.objects.reduce((acc, o) => {
      const label = labelOf(o)
      const g = (acc[label] ??= { label, n: 0, best: 0, from: new Set() })
      g.n++
      g.best = Math.max(g.best, o[7] || o[5])
      if (o[6] && o[6] !== o[0]) g.from.add(o[0])
      return acc
    }, {})
  ).sort((a, b) => b.n - a.n || b.best - a.best)

  // Parts grouped by prompt for the readout
  const partGroups = Object.values(
    (S.parts || []).reduce((acc, [label, , , , , score]) => {
      const g = (acc[label] ??= { label, n: 0, best: 0 })
      g.n++
      g.best = Math.max(g.best, score)
      return acc
    }, {})
  ).sort((a, b) => b.n - a.n || b.best - a.best)

  const readout = {
    rgb: ['input', `${S.w} × ${S.h} RGB · resampled to ${PW}px for the live stages`],
    grey: ['luma', 'Y = 0.299 R + 0.587 G + 0.114 B'],
    blur: ['gaussian', '5 × 5 separable kernel · σ ≈ 1.1 · suppresses noise before gradients'],
    sobel: ['gradient', '|∇I| = √(Gx² + Gy²) · 3 × 3 Sobel operators'],
    canny: ['canny', 'non-maximum suppression + hysteresis thresholding'],
  }[stage.key]

  return (
    <Window
      title={`vision.py · ${S.slug}.jpg`}
      right={<span className="font-mono text-[11px] text-live">● {stage.label}</span>}
      className={className}
    >
      {/* Arrow keys browse photos while the pointer or focus is on the demo */}
      <div onKeyDown={onKey} onPointerEnter={e => e.currentTarget.focus({ preventScroll: true })} tabIndex={-1} className="outline-none">
      {/* Stage track */}
      <div className="flex border-b border-line font-mono text-[10px] uppercase tracking-wide overflow-x-auto no-scrollbar">
        {STAGES.map((st, i) => (
          <button
            key={st.key}
            onClick={e => jump(ui.sample, i, e)}
            aria-pressed={ui.stage === i}
            disabled={st.key === 'parts' && !hasParts(S)}
            className={`relative flex-1 shrink-0 min-w-[50px] px-1 py-2 transition-colors ${
              ui.stage === i ? 'text-flame' : i < ui.stage ? 'text-body' : 'text-mute hover:text-body'
            } ${i ? 'border-l border-line' : ''} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {st.label}
            {ui.stage === i && <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-flame" />}
          </button>
        ))}
      </div>

      <div
        ref={wrapRef}
        className="relative"
        onPointerEnter={() => { run.current.paused = true }}
        onPointerLeave={() => { run.current.paused = false }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Computer vision pipeline on a photo: ${stage.label} stage`}
          className="block w-full"
        />
        <a
          href={S.credit.source}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-1.5 bottom-1.5 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-body hover:text-ink"
        >
          {S.credit.author.includes(',') ? S.credit.author : S.credit.author.split(' ').slice(0, 2).join(' ')} · {S.credit.license} · Wikimedia
        </a>
      </div>

      {/* Readout */}
      <div className="px-4 py-3 border-t border-line font-mono text-[11px] h-[128px] overflow-hidden">
        {readout && (
          <div key={stage.key} className="pixel">
            <p className="uppercase tracking-wide text-mute">{readout[0]}</p>
            <p className="mt-1.5 text-ink leading-relaxed">{readout[1]}</p>
          </div>
        )}
        {stage.key === 'detect' && S.kind === 'gesture' && (
          <div key="detect-hands" className="pixel">
            <p className="uppercase tracking-wide text-mute">mediapipe hand landmarker · 21 keypoints × {S.hands.length} hands</p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {S.hands.map((h, i) => (
                <li key={i} className="flex justify-between text-ink">
                  <span>{h.handedness.toLowerCase()} hand · wrist → 5 finger chains</span>
                  <span className={i ? 'text-gold' : 'text-live'}>21 pts</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {stage.key === 'detect' && S.kind === 'faces' && (
          <div key="detect-faces" className="pixel">
            <p className="uppercase tracking-wide text-mute">ssd face detector + 68-point landmarks · {S.faces.length} faces</p>
            <ul className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
              {S.faces.map((f, i) => (
                <li key={i} className="flex justify-between text-ink">
                  <span>face {i + 1}</span>
                  <span className="text-live tabular-nums">{f.score.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {stage.key === 'parts' && hasParts(S) && (
          <div key="parts" className="pixel">
            <p className="uppercase tracking-wide text-mute">
              owlv2 · open-vocabulary, text-prompted · {S.parts.length} parts
            </p>
            <ul className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
              {partGroups.slice(0, 6).map(g => (
                <li key={g.label} className="flex justify-between gap-2 text-ink min-w-0">
                  <span className="truncate">
                    {g.label}
                    {g.n > 1 && <span className="text-mute"> ×{g.n}</span>}
                  </span>
                  <span className="text-gold tabular-nums">{g.best.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {stage.key === 'classify' && S.kind === 'gesture' && (
          <div key="classify-hands" className="pixel">
            <p className="uppercase tracking-wide text-mute">gesture recognizer · per-hand classification</p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {S.hands.map((h, i) => (
                <Bar key={i} name={`${h.handedness.toLowerCase()} · ${pretty(h.gestures[0][0])}`} p={h.gestures[0][1]} i={i} />
              ))}
            </ul>
          </div>
        )}
        {stage.key === 'classify' && S.kind === 'faces' && (
          <div key="classify-faces" className="pixel">
            <p className="uppercase tracking-wide text-mute">expression net · 7 classes · top per face</p>
            <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
              {S.faces.map((f, i) => (
                <Bar key={i} name={`${i + 1} · ${f.expressions[0][0]}`} p={f.expressions[0][1]} i={i} />
              ))}
            </ul>
          </div>
        )}
        {stage.key === 'detect' && !S.kind && (
          <div key="detect" className="pixel">
            <p className="uppercase tracking-wide text-mute">
              coco-ssd · tiled 1×1 + 2×2 + 3×3 · {S.objects.length} objects
            </p>
            <ul className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
              {groups.slice(0, 4).map(g => (
                <li key={g.label} className={`flex justify-between gap-2 text-ink ${g.from.size ? 'col-span-2' : ''}`}>
                  <span className="truncate">
                    {g.label}
                    {g.n > 1 && <span className="text-mute"> ×{g.n}</span>}
                    {g.from.size > 0 && <span className="text-mute"> · ssd said {[...g.from].join('/')}</span>}
                  </span>
                  <span className="text-live tabular-nums">{g.best.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {stage.key === 'classify' && !S.kind && (
          <div key="classify" className="pixel">
            <p className="uppercase tracking-wide text-mute">
              mobilenet v2 · imagenet top 3
              {S.classes[0][1] < 0.25 && <span className="normal-case text-gold"> · low confidence: scenes are off-distribution for object-centric ImageNet</span>}
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {S.classes.slice(0, 3).map(([name, p], i) => (
                <Bar key={name} name={name} p={p} i={i} dim={i > 0} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Photo picker: prev/next, counter and thumbnails */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-line">
        <button
          onClick={e => step(-1, e)}
          aria-label="Previous photo"
          className="shrink-0 w-7 h-7 rounded-sm border border-line text-ink hover:border-flame hover:text-flame transition-colors"
        >
          ‹
        </button>
        <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${samples.length}, minmax(0, 1fr))` }}>
          {samples.map((s, i) => (
            <button
              key={s.slug}
              onClick={e => jump(i, 0, e)}
              aria-label={`Run the pipeline on ${s.slug}`}
              aria-pressed={ui.sample === i}
              title={s.slug}
              className={`h-7 rounded-sm overflow-hidden border transition-all ${
                ui.sample === i ? 'border-flame' : 'border-line opacity-50 hover:opacity-100'
              }`}
            >
              <img src={srcOf(s)} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
        <button
          onClick={e => step(1, e)}
          aria-label="Next photo"
          className="shrink-0 w-7 h-7 rounded-sm border border-line text-ink hover:border-flame hover:text-flame transition-colors"
        >
          ›
        </button>
        <span className="shrink-0 w-10 text-right font-mono text-[10px] text-mute tabular-nums">
          {String(ui.sample + 1).padStart(2, '0')}/{samples.length}
        </span>
      </div>
      </div>
    </Window>
  )
}

// A labelled confidence bar that fills in from zero
function Bar({ name, p, i, dim = false }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 min-w-0">
      <span className="relative h-4 rounded-sm bg-panel-2 overflow-hidden">
        <span
          className="absolute inset-y-0 left-0 bg-flame/70 bar-grow"
          style={{ width: `${Math.max(2, p * 100)}%`, animationDelay: `${i * 90}ms` }}
        />
        <span className="relative px-1.5 text-[10px] leading-4 text-ink whitespace-nowrap">{name}</span>
      </span>
      <span className={`tabular-nums ${dim ? 'text-body' : 'text-live'}`}>{(p * 100).toFixed(1)}%</span>
    </li>
  )
}
