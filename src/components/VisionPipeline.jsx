import { useEffect, useRef, useState } from 'react'
import samples from '../data/vision'
import { canny, gaussian, greyscale, sobel } from '../lib/vision'
import { prefersReduced } from '../lib/motion'
import { Window } from './ui'
import LiveLab from './LiveLab'

// A computer-vision pipeline over public-domain photos. The classic transforms
// (greyscale, Gaussian blur, Sobel gradients, Canny edges) are computed live in
// the browser from each photo's pixels; the detection and classification stages
// show real model output (COCO-SSD, MobileNet v2, CLIP zero-shot, OWLv2 and
// MediaPipe), precomputed offline so the page stays static (src/data/vision.js).

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
// Stages a photo has nothing for are skipped and their tabs disabled
const skips = (st, S) => st === 'parts' && !hasParts(S)

// The best live task for a demo photo
const liveTaskFor = S =>
  S.hands?.length || S.slug === 'asl' ? 'hands' : S.faces?.length ? 'face' : S.poses?.length ? 'pose' : S.classifier === 'clip' ? 'zeroshot' : 'objects'

const WIPE_MS = 480
const IDLE_MS = 9000 // after a manual pick, hold before auto-advancing again
const PW = 320 // processing width for the live transforms
const ASPECT = 4 / 3 // display frame

const base = import.meta.env.BASE_URL
const srcOf = s => `${base}cv/${s.path || s.slug}.jpg`
const thumbOf = s => `${base}cv/thumb/${(s.path || s.slug).replace('/', '-')}.jpg`

// Families for the photo filter
const FAMILY_OF_GROUP = {
  'Eyes open vs closed': 'body', 'Head direction': 'body', 'Mask on vs off': 'body', 'Exercise pose': 'body',
  'Sign language': 'hands',
  'Recycling types': 'objects', 'Fruits and vegetables': 'objects', 'Fruit ripeness': 'objects', 'Clothing items': 'objects', 'Playing cards and coins': 'objects',
  'Cat breeds': 'nature', 'Dog breeds': 'nature', 'Bird species': 'nature', 'Flower types': 'nature', 'Healthy vs diseased leaves': 'nature', 'Weather conditions': 'nature', 'Satellite land types': 'nature',
  'Handwritten digits': 'writing', 'Alphabet letters': 'writing', 'Road and traffic signs': 'writing', Doodles: 'writing',
  'Cracked vs uncracked concrete': 'industry', 'Defective products': 'industry', 'Circuit boards': 'industry',
}
const familiesOf = s => {
  const f = []
  if (s.slug === 'expressions') f.push('body')
  if (s.slug === 'thumbsup') f.push('hands')
  if (s.group && FAMILY_OF_GROUP[s.group]) f.push(FAMILY_OF_GROUP[s.group])
  return f
}
const FAMILIES = [
  { key: 'all', label: 'All' },
  { key: 'body', label: 'Body & people' },
  { key: 'hands', label: 'Hands & signs' },
  { key: 'objects', label: 'Everyday objects' },
  { key: 'nature', label: 'Animals & nature' },
  { key: 'writing', label: 'Writing & symbols' },
  { key: 'industry', label: 'Industry & quality' },
].map(f => ({ ...f, members: samples.map((s, i) => i).filter(i => f.key === 'all' || familiesOf(samples[i]).includes(f.key)) }))

// The photo after (or before) index i within a list of visible indices, wrapping
const nextIn = (list, i, dir) => {
  const L = list?.length ? list : samples.map((_, k) => k)
  const at = L.indexOf(i)
  return L[(at < 0 ? 0 : at + dir + L.length) % L.length]
}

// Title for a photo: its category, numbered when several photos share one
const GROUP_SIZE = samples.reduce((m, s) => (s.group ? m.set(s.group, (m.get(s.group) || 0) + 1) : m), new Map())
const titleOf = s => {
  if (!s.group) return `${s.slug}.jpg`
  const n = GROUP_SIZE.get(s.group)
  if (n < 2) return s.group.toLowerCase()
  const i = samples.filter(x => x.group === s.group).indexOf(s) + 1
  return `${s.group.toLowerCase()} ${i}/${n}`
}

// Whether a prediction matches the expected answer, where one is known
const correct = (label, truth) => truth && label === truth
// Overall score across every prediction with a known answer
const SCORE = samples.reduce(
  (acc, s) => {
    if (s.truth) acc.push(s.classes[0][0] === s.truth)
    for (const t of s.tiles || []) if (t.truth) acc.push(t.classes[0][0] === t.truth)
    return acc
  },
  []
)
const SCORE_TEXT = `${SCORE.filter(Boolean).length}/${SCORE.length} correct across the demo`

// A colour per land type on the satellite grid, in order of first appearance
const GRID_COLOURS = ['61,220,151', '227,179,65', '96,165,250', '240,136,62', '201,162,240', '240,98,90']
const gridColour = (S, label) => {
  const seen = [...new Set(S.tiles.map(t => t.classes[0][0]))]
  return GRID_COLOURS[seen.indexOf(label) % GRID_COLOURS.length]
}

// MediaPipe pose topology (33 landmarks): face, arms, torso and legs
const POSE_EDGES = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32],
  [15, 17], [15, 19], [16, 18], [16, 20], [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
]
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
// Trim CLIP prompts like "a photo of a stop sign" to "stop sign" for display
const short = n => n.replace(/^(a|an|the) /i, '')

export default function VisionPipeline({ className = '' }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const run = useRef({ sample: 0, stage: 0, t0: 0, touched: -Infinity, paused: false })
  const stripRef = useRef(null)
  // 'demo' plays the precomputed pipeline; 'live' runs models in the browser
  const [mode, setMode] = useState('demo')
  const [liveSource, setLiveSource] = useState('photo')
  const [liveKey, setLiveKey] = useState(0)
  const [family, setFamily] = useState('all')
  const visible = FAMILIES.find(f => f.key === family).members
  const goLive = (src = 'upload') => {
    setLiveSource(src)
    setLiveKey(k => k + 1)
    setMode('live')
  }
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
          // Keep only the last few processed photos in memory
          for (const k of cache.keys()) {
            if (cache.size <= 4) break
            if (k !== i && k !== r.sample) {
              cache.delete(k)
              images.delete(k)
            }
          }
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
      x = Math.max(0, Math.min(x, cw - tw)) // keep the label inside the frame
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
          const text = hand.gestures.length ? `${pretty(hand.gestures[0][0])} ${conf(hand.gestures[0][1])}` : `hand ${h + 1}`
          tag(text, Math.min(...xs), Math.min(...ys) - 4, col)
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
        face.landmarks.slice(0, Math.ceil(t * face.landmarks.length)).forEach(([lx, ly]) => {
          ctx.fillRect(lx * s + ox - 1, ly * s + oy - 1, 2, 2)
        })
        ctx.globalAlpha = 1
        if (t === 1) {
          const [name, score] = face.expressions[0]
          tag(face.detail ? name : `${name} ${conf(score)}`, x * s + ox, y * s + oy, '61,220,151')
        }
      })
    }

    // Body pose: 33 keypoints joined into a skeleton, traced in from the head down
    const drawPoses = (S, elapsed) => {
      const { s, ox, oy } = fit(S.w, S.h)
      const t = Math.min(1, Math.max(0, (elapsed - 250) / 1100))
      if (!t) return
      S.poses.forEach(lm => {
        const shown = POSE_EDGES.slice(0, Math.ceil(t * POSE_EDGES.length))
        ctx.lineWidth = 3
        ctx.strokeStyle = 'rgba(61,220,151,0.9)'
        for (const [a, b] of shown) {
          if (lm[a][2] < 0.3 || lm[b][2] < 0.3) continue
          ctx.beginPath()
          ctx.moveTo(lm[a][0] * s + ox, lm[a][1] * s + oy)
          ctx.lineTo(lm[b][0] * s + ox, lm[b][1] * s + oy)
          ctx.stroke()
        }
        lm.forEach(([x, y, v], i) => {
          if (v < 0.3 || i > Math.ceil(t * 33)) return
          ctx.beginPath()
          ctx.arc(x * s + ox, y * s + oy, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#f6eee7'
          ctx.fill()
        })
      })
      if (t === 1) {
        const xs = S.poses[0].map(p => p[0] * s + ox)
        const ys = S.poses[0].map(p => p[1] * s + oy)
        tag(`pose · 33 keypoints`, Math.max(0, Math.min(...xs)), Math.max(14, Math.min(...ys)), '61,220,151')
      }
    }

    // Per-panel or per-cell classification: a box per tile with its top label,
    // green when it matches the expected answer and red when it does not
    const drawTiles = (S, elapsed) => {
      const { s, ox, oy } = fit(S.w, S.h)
      const grid = S.tileMode === 'grid'
      S.tiles.forEach((tile, i) => {
        const appear = Math.min(1, Math.max(0, (elapsed - 250 - i * (grid ? 60 : 220)) / 260))
        if (!appear) return
        const [x, y, w, h] = tile.box
        const [label, p] = tile.classes[0]
        const col = tile.truth ? (correct(label, tile.truth) ? '61,220,151' : '240,98,90') : grid ? gridColour(S, label) : '227,179,65'
        ctx.globalAlpha = appear
        if (grid) {
          ctx.fillStyle = `rgba(${col},0.28)`
          ctx.fillRect(x * s + ox + 1, y * s + oy + 1, w * s - 2, h * s - 2)
        }
        ctx.lineWidth = grid ? 1 : 2
        ctx.strokeStyle = `rgba(${col},0.95)`
        ctx.strokeRect(x * s + ox + 1, y * s + oy + 1, w * s - 2, h * s - 2)
        const short = label.replace(/^(a|an|the) /, '').replace(/ with .*/, '')
        tag(grid ? short : `${short} ${conf(p)}${tile.truth ? (correct(label, tile.truth) ? ' ✓' : ' ✗') : ''}`, x * s + ox + 1, y * s + oy + 15, col)
        ctx.globalAlpha = 1
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
      if (S.tiles && !S.faces) drawTiles(S, elapsed)
      if (S.poses?.length) drawPoses(S, elapsed)
      if (S.hands?.length) return drawHands(S, elapsed)
      if (S.faces?.length) return drawFaces(S, elapsed)
      if (!S.objects?.length) return
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
      load(nextIn(r.visible, sample, 1)) // preload the next photo in the current group
    }

    const tick = now => {
      if (!r.paused && now - r.touched > IDLE_MS && !reduced) {
        if (now - r.t0 > STAGES[r.stage].ms) {
          if (r.stage < STAGES.length - 1) {
            let next = r.stage + 1
            while (next < STAGES.length && skips(STAGES[next].key, samples[r.sample])) next++
            if (next < STAGES.length) go(r.sample, next, now)
            else {
              const n = nextIn(r.visible, r.sample, 1)
              if (cache.has(n)) go(n, 0, now)
            }
          }
          else {
            const next = nextIn(r.visible, r.sample, 1)
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

  useEffect(() => {
    run.current.paused = mode === 'live'
  }, [mode])

  // Auto-advance stays inside the chosen family
  useEffect(() => {
    run.current.visible = visible
  }, [visible])

  useEffect(() => {
    const strip = stripRef.current
    const thumb = strip?.querySelector('[aria-pressed="true"]')
    if (!strip || !thumb) return
    strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2, behavior: 'smooth' })
  }, [ui.sample])

  const S = samples[ui.sample]
  // Short laptop screens get a more compact readout
  const compact = typeof window !== 'undefined' && window.matchMedia('(min-width: 64rem) and (max-height: 820px)').matches
  const stage = STAGES[ui.stage]
  const jump = (sample, stageIdx, e) => run.current.api?.jump(sample, stageIdx, e.timeStamp)
  // Previous / next photo, wrapping around
  const step = (dir, e) => jump(nextIn(visible, ui.sample, dir), 0, e)
  const pickFamily = (key, e) => {
    setFamily(key)
    const members = FAMILIES.find(f => f.key === key).members
    if (!members.includes(ui.sample)) jump(members[0], 0, e)
  }
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

  // Panel / grid-cell labels grouped for the detect readout
  const tileGroups = Object.values(
    (S.tiles || []).reduce((acc, t) => {
      const label = short(t.classes[0][0])
      ;(acc[label] ??= { label, n: 0 }).n++
      return acc
    }, {})
  ).sort((a, b) => b.n - a.n)

  const readout = {
    rgb: ['input', `${S.w} × ${S.h} RGB · resampled to ${PW}px for the live stages`],
    grey: ['luma', 'Y = 0.299 R + 0.587 G + 0.114 B'],
    blur: ['gaussian', '5 × 5 separable kernel · σ ≈ 1.1 · suppresses noise before gradients'],
    sobel: ['gradient', '|∇I| = √(Gx² + Gy²) · 3 × 3 Sobel operators'],
    canny: ['canny', 'non-maximum suppression + hysteresis thresholding'],
  }[stage.key]

  return (
    <Window
      title={mode === 'live' ? 'live · runs on this device' : titleOf(S)}
      right={
        <div className="flex rounded-sm border border-line font-mono text-[10px] uppercase tracking-wide overflow-hidden">
          {['demo', 'live'].map(m => (
            <button
              key={m}
              onClick={() => (m === 'live' ? goLive('upload') : setMode('demo'))}
              aria-pressed={mode === m}
              className={`px-2 py-0.5 whitespace-nowrap transition-colors ${mode === m ? 'bg-flame text-canvas' : 'text-body hover:text-ink'}`}
            >
              {m === 'live' ? <><span className="hidden sm:inline">try it </span>live</> : 'demo'}
            </button>
          ))}
        </div>
      }
      className={className}
    >
      {/* Arrow keys browse photos while the pointer or focus is on the demo */}
      <div onKeyDown={onKey} onPointerEnter={e => e.currentTarget.focus({ preventScroll: true })} tabIndex={-1} className="outline-none">
      {mode === 'live' && <LiveLab key={liveKey} initialTask={liveTaskFor(S)} initialSource={liveSource} />}
      {/* The demo stays mounted (its canvas loop owns the refs) but is hidden while live */}
      <div className={mode === 'live' ? 'hidden' : ''}>
      {/* Stage track */}
      <div className="flex border-b border-line font-mono text-[10px] overflow-x-auto no-scrollbar">
        {STAGES.map((st, i) => (
          <button
            key={st.key}
            onClick={e => jump(ui.sample, i, e)}
            aria-pressed={ui.stage === i}
            disabled={skips(st.key, S)}
            className={`relative flex-1 shrink-0 sm:shrink sm:min-w-0 min-w-[44px] px-0 py-2 text-[10px] sm:text-[9.5px] tracking-tight transition-colors ${
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
      <div aria-live="polite" className="px-4 py-3 border-t border-line font-mono text-[11px] h-[128px] short:h-[112px] overflow-y-auto thin-scroll">
        {readout && (
          <div key={stage.key} className="pixel">
            <p className="uppercase tracking-wide text-mute">{readout[0]}</p>
            <p className="mt-1.5 text-ink leading-relaxed">{readout[1]}</p>
          </div>
        )}
        {/* Detect: the most specific result available for this photo */}
        {stage.key === 'detect' && (
          <div key="detect" className="pixel">
            {S.poses?.length ? (
              <>
                <p className="uppercase tracking-wide text-mute">mediapipe pose landmarker · 33 keypoints × {S.poses.length}</p>
                <p className="mt-1.5 text-ink leading-relaxed">Shoulders, elbows, wrists, hips, knees and ankles located on the body, then joined into a skeleton.</p>
              </>
            ) : S.hands?.length ? (
              <>
                <p className="uppercase tracking-wide text-mute">mediapipe hand landmarker · 21 keypoints × {S.hands.length} hands</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {S.hands.map((h, i) => (
                    <li key={i} className="flex justify-between text-ink">
                      <span>{h.handedness.toLowerCase()} hand · wrist → 5 finger chains</span>
                      <span className={i ? 'text-gold' : 'text-live'}>21 pts</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : S.faces?.length ? (
              <>
                <p className="uppercase tracking-wide text-mute">
                  {S.faceModel === 'mediapipe' ? 'mediapipe face mesh · 478 keypoints' : 'ssd face detector + 68-point landmarks'} · {S.faces.length} faces
                </p>
                <ul className={`mt-1.5 grid gap-x-4 gap-y-1 ${S.faces.some(f => f.detail) ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {S.faces.map((f, i) => (
                    <li key={i} className="flex justify-between gap-2 text-ink min-w-0">
                      <span className="truncate">face {i + 1}{f.detail ? ` · ${f.expressions[0][0]}` : ''}</span>
                      <span className="text-live tabular-nums shrink-0">{f.detail ? f.detail.replace(' · ', ' ') : f.score.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                {S.tiles && S.faces.length < S.tiles.length && (
                  <p className="mt-1 text-mute normal-case">
                    {S.faces.length} of {S.tiles.length} found: side profiles hide one eye.
                  </p>
                )}
              </>
            ) : S.tiles ? (
              <>
                <p className="uppercase tracking-wide text-mute">
                  clip zero-shot · {S.tileMode === 'grid' ? `${S.tiles.length} grid cells classified separately` : `each of ${S.tiles.length} panels classified separately`}
                </p>
                <ul className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
                  {tileGroups.slice(0, 4).map(g => (
                    <li key={g.label} className="flex justify-between gap-2 text-ink min-w-0">
                      <span className="truncate">{g.label}</span>
                      <span className="text-live tabular-nums shrink-0">×{g.n}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : S.slug === 'asl' ? (
              <>
                <p className="uppercase tracking-wide text-mute">mediapipe hand landmarker · 1 of 25 drawn hands found</p>
                <p className="mt-1.5 text-ink leading-relaxed">
                  Trained on real hands, so it can’t read 1918 engravings.{' '}
                  <button onClick={() => goLive('webcam')} className="text-flame hover:text-ink underline underline-offset-2">Decode your own signs live</button>.
                </p>
              </>
            ) : S.objects.length ? (
              <>
                <p className="uppercase tracking-wide text-mute">coco-ssd · tiled 1×1 + 2×2 + 3×3 · {S.objects.length} objects</p>
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
              </>
            ) : (
              <>
                <p className="uppercase tracking-wide text-mute">coco-ssd · no objects from its 80 classes</p>
                <p className="mt-1.5 text-ink leading-relaxed">Nothing here is one of COCO's 80 everyday objects, which is why the open-vocabulary parts stage and CLIP do the work for this photo.</p>
              </>
            )}
          </div>
        )}
        {stage.key === 'parts' && hasParts(S) && (
          <div key="parts" className="pixel">
            <p className="uppercase tracking-wide text-mute">
              owlv2 · open-vocabulary, text-prompted · {S.parts.length} parts
            </p>
            <ul className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
              {partGroups.slice(0, compact ? 4 : 6).map(g => (
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
        {/* Classify: per panel, per face, per hand, or the whole image */}
        {stage.key === 'classify' && (
          <div key="classify" className="pixel">
            <p className="flex justify-between gap-3 uppercase tracking-wide text-mute">
              <span className="truncate">
                {S.tiles && S.tileMode !== 'grid' ? 'clip zero-shot · per panel'
                  : S.hands?.some(h => h.gestures.length) ? 'gesture recognizer · per-hand classification'
                  : S.faces && !S.classifier ? 'expression net · 7 classes · top per face'
                  : S.classifier === 'clip' ? `clip zero-shot · ${S.group?.toLowerCase()}`
                  : 'mobilenet v2 · imagenet top 3'}
              </span>
              {(S.truth || S.tiles?.some(t => t.truth)) && <span className="normal-case shrink-0">{SCORE_TEXT}</span>}
            </p>
            <ul className={`mt-1.5 ${(S.tiles && S.tileMode !== 'grid') || (S.faces && !S.classifier) ? 'grid grid-cols-2 gap-x-3 gap-y-1' : 'flex flex-col gap-1'}`}>
              {S.tiles && S.tileMode !== 'grid'
                ? S.tiles.map((t, i) => (
                    <Bar key={i} name={`${i + 1} · ${short(t.classes[0][0])}${t.truth ? (correct(t.classes[0][0], t.truth) ? ' ✓' : ' ✗') : ''}`} p={t.classes[0][1]} i={i} bad={t.truth && !correct(t.classes[0][0], t.truth)} />
                  ))
                : S.hands?.some(h => h.gestures.length)
                  ? S.hands.map((h, i) => <Bar key={i} name={`${h.handedness.toLowerCase()} · ${pretty(h.gestures[0][0])}`} p={h.gestures[0][1]} i={i} />)
                  : S.faces && !S.classifier
                    ? S.faces.map((f, i) => <Bar key={i} name={`${i + 1} · ${f.expressions[0][0]}`} p={f.expressions[0][1]} i={i} />)
                    : S.classes.slice(0, 3).map(([name, p], i) => (
                        <Bar key={name} name={`${short(name)}${i === 0 && S.truth ? (correct(name, S.truth) ? ' ✓' : ` ✗ · expected ${short(S.truth)}`) : ''}`} p={p} i={i} dim={i > 0} bad={i === 0 && S.truth && !correct(name, S.truth)} />
                      ))}
            </ul>
          </div>
        )}
      </div>

      </div>

      {/* Photo filter and picker (demo only; live mode uses uploads or the webcam) */}
      <div className={mode === 'live' ? 'hidden' : ''}>
      <div className="flex gap-1 px-3 pt-2.5 short:pt-2 overflow-x-auto no-scrollbar font-mono text-[10px]" role="group" aria-label="Filter photos by group">
        {FAMILIES.filter(f => f.members.length).map(f => (
          <button
            key={f.key}
            onClick={e => pickFamily(f.key, e)}
            aria-pressed={family === f.key}
            className={`shrink-0 rounded-full border px-2.5 py-1 whitespace-nowrap transition-colors ${
              family === f.key ? 'border-flame bg-flame/15 text-flame' : 'border-line text-body hover:text-ink'
            }`}
          >
            {f.label} <span className="text-mute">{f.members.length}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 short:py-2">
        <button
          onClick={e => step(-1, e)}
          aria-label="Previous photo"
          className="shrink-0 w-7 h-7 rounded-sm border border-line text-ink hover:border-flame hover:text-flame transition-colors"
        >
          ‹
        </button>
        {/* Scrolls sideways; the current photo is kept in view */}
        <div ref={stripRef} className="flex-1 min-w-0 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {visible.map(i => samples[i]).map((s, k) => ({ s, i: visible[k] })).map(({ s, i }) => (
            <button
              key={s.slug}
              onClick={e => jump(i, 0, e)}
              aria-label={`Run the pipeline on ${s.slug}`}
              aria-pressed={ui.sample === i}
              title={s.slug}
              className={`shrink-0 w-9 h-7 rounded-sm overflow-hidden border transition-all ${
                ui.sample === i ? 'border-flame' : 'border-line opacity-50 hover:opacity-100'
              }`}
            >
              <img src={thumbOf(s)} alt="" className="w-full h-full object-cover" loading="lazy" />
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
        <span className="shrink-0 w-11 text-right font-mono text-[10px] text-mute tabular-nums">
          {String(Math.max(1, visible.indexOf(ui.sample) + 1)).padStart(2, '0')}/{String(visible.length).padStart(2, '0')}
        </span>
      </div>
      </div>
      </div>
    </Window>
  )
}

// A labelled confidence bar that fills in from zero
function Bar({ name, p, i, dim = false, bad = false }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 min-w-0">
      <span className="relative h-4 rounded-sm bg-panel-2 overflow-hidden">
        <span
          className={`absolute inset-y-0 left-0 bar-grow ${bad ? 'bg-rose/60' : 'bg-flame/70'}`}
          style={{ width: `${Math.max(2, p * 100)}%`, animationDelay: `${i * 90}ms` }}
        />
        <span className="relative px-1.5 text-[10px] leading-4 text-ink whitespace-nowrap truncate block">{name}</span>
      </span>
      <span className={`tabular-nums ${dim ? 'text-body' : 'text-live'}`}>{(p * 100).toFixed(1)}%</span>
    </li>
  )
}
