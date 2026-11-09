import { useCallback, useEffect, useRef, useState } from 'react'
import { loadClip, loadExpressions, loadFace, loadHands, loadObjectNamer, loadObjects, loadPose } from '../lib/liveModels'
import { SUPPORTED, fingerspell } from '../lib/fingerspell'

// Live, in-browser computer vision. Pick a source (the current demo photo, an
// uploaded photo or the webcam) and a task; the model runs on this device and
// every result comes with the evidence it was based on.

const TASKS = [
  { key: 'objects', label: 'Objects', model: 'COCO-SSD boxes + CLIP naming · ~300 labels incl. engineering & robotics' },
  { key: 'zeroshot', label: 'Zero-shot', model: 'CLIP ViT-B/32 · your own labels' },
  { key: 'hands', label: 'Sign letters', model: 'MediaPipe hands · 21 keypoints + fingerspelling rules' },
  { key: 'face', label: 'Face', model: 'MediaPipe face mesh + face-api expressions' },
  { key: 'pose', label: 'Body pose', model: 'MediaPipe pose · 33 keypoints' },
]
const SOURCES = [
  { key: 'upload', label: 'Upload' },
  { key: 'webcam', label: 'Webcam' },
]
// One-tap label sets for zero-shot; CLIP can only choose between the labels it is given
const PRESETS = {
  Everyday: ['a person', 'a dog', 'a cat', 'a bird', 'a car', 'food', 'a plant', 'a building', 'a computer'],
  Animals: ['a dog', 'a cat', 'a bird', 'a horse', 'a fish', 'an insect', 'a cow', 'a rabbit'],
  Moods: ['a happy person', 'a sad person', 'an angry person', 'a surprised person', 'a calm person'],
  Weather: ['sunny weather', 'cloudy weather', 'rainy weather', 'foggy weather', 'snowy weather'],
  Food: ['pizza', 'a salad', 'fruit', 'a burger', 'cake', 'coffee', 'sushi'],
}
const DEFAULT_LABELS = PRESETS.Everyday
const POSE_EDGES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]]
const HAND_EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]]

// ── Object naming helpers ──────────────────────────────────────────────────────
// Overlap of two [x, y, w, h] boxes as intersection over union
const iou = (a, b) => {
  const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]))
  const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]))
  const inter = ix * iy
  return inter / (a[2] * a[3] + b[2] * b[3] - inter || 1)
}
// A square 224px crop around a box, with a little context, for CLIP
const cropOf = (src, [x, y, w, h], pad = 0.12) => {
  const size = Math.max(w, h) * (1 + pad * 2)
  const c = document.createElement('canvas')
  c.width = c.height = 224
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 224, 224)
  ctx.drawImage(src, x + w / 2 - size / 2, y + h / 2 - size / 2, size, size, 0, 0, 224, 224)
  return c
}
// The area a hand is likely holding something in: the hand's box grown around its
// palm and fingers, kept square and inside the frame
const heldBox = (lm, W, H) => {
  const xs = lm.map(p => p.x * W)
  const ys = lm.map(p => p.y * H)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const size = Math.min(W, H, Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 2)
  const x = Math.max(0, Math.min(W - size, cx - size / 2))
  const y = Math.max(0, Math.min(H - size, cy - size / 2))
  return [x, y, size, size]
}
const pct = p => `${(p * 100).toFixed(0)}%`

// Which MediaPipe blendshapes (facial muscle scores) support each expression,
// used to explain the expression network's answer in readable terms
const EVIDENCE = {
  happy: ['mouthSmileLeft', 'mouthSmileRight', 'cheekSquintLeft', 'cheekSquintRight'],
  sad: ['mouthFrownLeft', 'mouthFrownRight', 'browInnerUp', 'mouthLowerDownLeft'],
  angry: ['browDownLeft', 'browDownRight', 'noseSneerLeft', 'mouthPressLeft'],
  surprised: ['jawOpen', 'browInnerUp', 'eyeWideLeft', 'eyeWideRight'],
  fearful: ['eyeWideLeft', 'eyeWideRight', 'browInnerUp', 'mouthStretchLeft'],
  disgusted: ['noseSneerLeft', 'noseSneerRight', 'mouthUpperUpLeft', 'mouthUpperUpRight'],
  neutral: [],
}
const pretty = k => k.replace(/(Left|Right)$/, '').replace(/([A-Z])/g, ' $1').toLowerCase()
function expressionWhy(label, bs) {
  if (label === 'neutral') {
    const strongest = Object.entries(bs).filter(([k]) => !k.startsWith('eyeBlink') && !k.startsWith('eyeLook') && k !== '_neutral').sort((a, b) => b[1] - a[1])[0]
    return `no facial muscle is strongly engaged${strongest ? ` (largest: ${pretty(strongest[0])} ${strongest[1].toFixed(2)})` : ''}`
  }
  const seen = new Set()
  const cues = (EVIDENCE[label] || [])
    .map(k => [k, bs[k] || 0])
    .sort((a, b) => b[1] - a[1])
    .filter(([k]) => !seen.has(pretty(k)) && seen.add(pretty(k)))
  const strong = cues.filter(([, v]) => v >= 0.1).slice(0, 2)
  if (!strong.length) {
    return `no single muscle cue is strong${cues[0] ? ` (largest: ${pretty(cues[0][0])} ${cues[0][1].toFixed(2)})` : ''}, so the network is reading the face's overall appearance`
  }
  return strong.map(([k, v]) => `${pretty(k)} ${v.toFixed(2)}`).join(' and ')
}

// Faces in a still photo: the face mesh's detector is built for faces near the
// camera, so small faces in a large photo are also searched for in overlapping
// quarters at a larger scale. Results are merged by face centre.
function detectFaces(m, src, still) {
  const W = src.videoWidth || src.naturalWidth
  const H = src.videoHeight || src.naturalHeight
  let ts = performance.now()
  const found = []
  const add = (lm, blend) => {
    const cx = lm.reduce((a, p) => a + p.x, 0) / lm.length
    const cy = lm.reduce((a, p) => a + p.y, 0) / lm.length
    if (found.some(f => Math.hypot(f.cx - cx, f.cy - cy) < 0.06)) return
    found.push({ lm, blend, cx, cy })
  }
  const full = m.detectForVideo(src, ts)
  full.faceLandmarks.forEach((lm, i) => add(lm, full.faceBlendshapes[i]))
  if (still) {
    for (const [x0, y0] of [[0, 0], [0.45, 0], [0, 0.45], [0.45, 0.45]]) {
      const c = document.createElement('canvas')
      c.width = Math.round(W * 0.55)
      c.height = Math.round(H * 0.55)
      c.getContext('2d').drawImage(src, x0 * W, y0 * H, c.width, c.height, 0, 0, c.width, c.height)
      const r = m.detectForVideo(c, (ts += 1))
      r.faceLandmarks.forEach((lm, i) => add(lm.map(p => ({ x: x0 + p.x * 0.55, y: y0 + p.y * 0.55, z: p.z })), r.faceBlendshapes[i]))
    }
  }
  return found
}

// Head direction from the face mesh: nose offset between the cheeks (yaw) and
// nose height between the eyes and chin (pitch)
function headDirection(lm) {
  const nose = lm[1], l = lm[234], r = lm[454], eyeL = lm[33], eyeR = lm[263], chin = lm[152]
  const yaw = (nose.x - (l.x + r.x) / 2) / Math.max(1e-6, Math.abs(r.x - l.x))
  const eyeY = (eyeL.y + eyeR.y) / 2
  const pitch = (nose.y - eyeY) / Math.max(1e-6, chin.y - eyeY)
  let label = 'looking straight ahead'
  let why = `nose centred between the cheeks (yaw ${yaw.toFixed(2)}) and eyes (pitch ${pitch.toFixed(2)})`
  if (Math.abs(yaw) > 0.1 && Math.abs(yaw) >= Math.abs(pitch - 0.42)) {
    label = yaw < 0 ? 'looking to their left' : 'looking to their right'
    why = `nose sits ${Math.abs(yaw * 100).toFixed(0)}% of face width off-centre (yaw ${yaw.toFixed(2)})`
  } else if (pitch < 0.3) {
    label = 'looking up'
    why = `nose close to eye level (pitch ${pitch.toFixed(2)} < 0.30)`
  } else if (pitch > 0.55) {
    label = 'looking down'
    why = `nose close to the chin (pitch ${pitch.toFixed(2)} > 0.55)`
  }
  return { label, why }
}

export default function LiveLab({ initialTask = 'objects', initialSource = 'upload' }) {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const sourceRef = useRef(null) // HTMLImageElement or HTMLVideoElement being analysed
  const loopRef = useRef(0)
  const runId = useRef(0)
  const [task, setTask] = useState(initialTask)
  const [source, setSource] = useState(initialSource)
  const [upload, setUpload] = useState(null)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [labels, setLabels] = useState(DEFAULT_LABELS.join(', '))
  const namesRef = useRef([]) // the latest CLIP names: [{ bbox, held, fine }]
  const namingRef = useRef(false)

  const labelList = labels.split(',').map(s => s.trim()).filter(Boolean)

  // ── Drawing ───────────────────────────────────────────────────────────────
  const draw = useCallback(res => {
    const canvas = canvasRef.current
    const src = sourceRef.current
    if (!canvas || !src) return
    const W = src.videoWidth || src.naturalWidth
    const H = src.videoHeight || src.naturalHeight
    if (!W || !H) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const cw = canvas.clientWidth
    const ch = canvas.clientHeight
    if (canvas.width !== Math.round(cw * dpr)) {
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#0f0e0d'
    ctx.fillRect(0, 0, cw, ch)
    // Contain-fit so nothing is cropped from the analysis
    const s = Math.min(cw / W, ch / H)
    const ox = (cw - W * s) / 2
    const oy = (ch - H * s) / 2
    const mirror = src === videoRef.current
    ctx.save()
    if (mirror) {
      ctx.translate(cw, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(src, ox, oy, W * s, H * s)
    ctx.restore()
    const X = x => (mirror ? cw - (x * s + ox) : x * s + ox)
    const Y = y => y * s + oy
    const tag = (text, x, y, col = '61,220,151') => {
      ctx.font = '600 11px "Geist Mono", ui-monospace, monospace'
      const tw = ctx.measureText(text).width + 8
      x = Math.max(0, Math.min(x, cw - tw)) // keep the label inside the frame
      ctx.fillStyle = `rgb(${col})`
      ctx.fillRect(x, Math.max(0, y - 15), tw, 15)
      ctx.fillStyle = '#0d0c0b'
      ctx.fillText(text, x + 4, Math.max(0, y - 15) + 11)
    }

    if (!res) return
    ctx.lineWidth = 2
    if (res.kind === 'objects') {
      for (const d of res.items) {
        const [x, y, w, h] = d.bbox
        const x0 = Math.min(X(x), X(x + w))
        ctx.strokeStyle = 'rgb(240,136,62)'
        ctx.strokeRect(x0, Y(y), w * s, h * s)
        tag(d.fine ? `${d.fine[0].label} ${pct(d.fine[0].score)}` : `${d.class} ${pct(d.score)}`, x0, Y(y), '240,136,62')
      }
      // Whatever a hand is holding, named by CLIP
      for (const h of res.held || []) {
        if (!h.fine) continue
        const [x, y, w, hh] = h.bbox
        const x0 = Math.min(X(x), X(x + w))
        ctx.save()
        ctx.setLineDash([6, 4])
        ctx.strokeStyle = 'rgb(61,220,151)'
        ctx.strokeRect(x0, Y(y), w * s, hh * s)
        ctx.restore()
        tag(`holding · ${h.fine[0].label} ${pct(h.fine[0].score)}`, x0, Y(y))
      }
    }
    if (res.kind === 'pose') {
      for (const lm of res.items) {
        ctx.strokeStyle = 'rgb(61,220,151)'
        for (const [a, b] of POSE_EDGES) {
          if ((lm[a].visibility ?? 1) < 0.4 || (lm[b].visibility ?? 1) < 0.4) continue
          ctx.beginPath()
          ctx.moveTo(X(lm[a].x * W), Y(lm[a].y * H))
          ctx.lineTo(X(lm[b].x * W), Y(lm[b].y * H))
          ctx.stroke()
        }
        for (const p of lm) {
          if ((p.visibility ?? 1) < 0.4) continue
          ctx.beginPath()
          ctx.arc(X(p.x * W), Y(p.y * H), 3, 0, Math.PI * 2)
          ctx.fillStyle = '#f6eee7'
          ctx.fill()
        }
      }
    }
    if (res.kind === 'hands') {
      res.items.forEach(h => {
        ctx.strokeStyle = 'rgb(227,179,65)'
        for (const [a, b] of HAND_EDGES) {
          ctx.beginPath()
          ctx.moveTo(X(h.lm[a].x * W), Y(h.lm[a].y * H))
          ctx.lineTo(X(h.lm[b].x * W), Y(h.lm[b].y * H))
          ctx.stroke()
        }
        for (const p of h.lm) {
          ctx.beginPath()
          ctx.arc(X(p.x * W), Y(p.y * H), 2.5, 0, Math.PI * 2)
          ctx.fillStyle = '#f6eee7'
          ctx.fill()
        }
        const xs = h.lm.map(p => X(p.x * W))
        tag(h.spell.letter ? `letter ${h.spell.letter}` : 'no letter', Math.min(...xs), Y(Math.min(...h.lm.map(p => p.y)) * H) - 4, '227,179,65')
      })
    }
    if (res.kind === 'face') {
      res.items.forEach(f => {
        ctx.fillStyle = 'rgba(246,238,231,0.85)'
        for (let i = 0; i < f.lm.length; i += 4) ctx.fillRect(X(f.lm[i].x * W) - 1, Y(f.lm[i].y * H) - 1, 2, 2)
        const xs = f.lm.map(p => X(p.x * W))
        tag(`${f.expression} · ${f.eyes.replace('eyes ', 'eyes ')} · ${f.head.label.replace('looking ', '').replace('to their ', '')}`, Math.min(...xs), Y(Math.min(...f.lm.map(p => p.y)) * H) - 4)
      })
    }
  }, [])

  // ── Running a task on one frame ───────────────────────────────────────────
  const analyse = useCallback(async (src, t, opts = {}) => {
    const ts = performance.now()
    if (t === 'objects') {
      const [m, hands] = await Promise.all([loadObjects(), loadHands().catch(() => null)])
      const W = src.videoWidth || src.naturalWidth
      const H = src.videoHeight || src.naturalHeight
      const items = await m.detect(src, 20, 0.45)
      // Regions around hands, unless COCO-SSD already boxed something there
      const things = items.filter(d => d.class !== 'person')
      const held = hands
        ? hands.detectForVideo(src, ts).landmarks
            .map(lm => ({ bbox: heldBox(lm, W, H) }))
            .filter(h => !things.some(d => iou(d.bbox, h.bbox) > 0.15))
        : []
      return { kind: 'objects', items, held }
    }
    if (t === 'pose') {
      const m = await loadPose()
      return { kind: 'pose', items: m.detectForVideo(src, ts).landmarks }
    }
    if (t === 'hands') {
      const m = await loadHands()
      const r = m.detectForVideo(src, ts)
      return {
        kind: 'hands',
        items: r.landmarks.map((lm, i) => ({ lm, side: r.handedness[i]?.[0]?.categoryName, spell: fingerspell(r.worldLandmarks?.[i] || lm) })),
      }
    }
    if (t === 'face') {
      const [m, faceapi] = await Promise.all([loadFace(), loadExpressions()])
      const W = src.videoWidth || src.naturalWidth
      const H = src.videoHeight || src.naturalHeight
      const items = []
      for (const face of detectFaces(m, src, !src.videoWidth)) {
        const lm = face.lm
        const bs = Object.fromEntries((face.blend?.categories || []).map(c => [c.categoryName, c.score]))
        const closed = ((bs.eyeBlinkLeft || 0) + (bs.eyeBlinkRight || 0)) / 2
        // Square face crop with a little margin, as the expression net expects
        const xs = lm.map(p => p.x * W)
        const ys = lm.map(p => p.y * H)
        const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 1.15
        const cx = (Math.max(...xs) + Math.min(...xs)) / 2
        const cy = (Math.max(...ys) + Math.min(...ys)) / 2
        const crop = document.createElement('canvas')
        crop.width = crop.height = 112
        crop.getContext('2d').drawImage(src, cx - size / 2, cy - size / 2, size, size, 0, 0, 112, 112)
        const probs = await faceapi.nets.faceExpressionNet.predictExpressions(crop)
        const ranked = Object.entries(probs).sort((a, b) => b[1] - a[1])
        items.push({
          lm, closed, eyes: closed > 0.5 ? 'eyes closed' : 'eyes open', head: headDirection(lm),
          expression: ranked[0][0], expressionP: ranked[0][1], runnerUp: ranked[1], why: expressionWhy(ranked[0][0], bs),
        })
      }
      return { kind: 'face', items }
    }
    if (t === 'zeroshot') {
      const { pipe, RawImage } = await loadClip(p => setStatus(`Downloading CLIP… ${(p * 100).toFixed(0)}%`))
      const c = frameCanvas(src)
      const out = await pipe(await RawImage.fromURL(c.toDataURL('image/jpeg', 0.9)), opts.labels, { hypothesis_template: 'a photo of {}.' })
      return { kind: 'zeroshot', items: out.map(o => ({ label: o.label, score: o.score })) }
    }
    return null
  }, [])

  // ── Naming objects with CLIP ──────────────────────────────────────────────
  // Crops are taken straight away (so they match this frame), then named. Person
  // boxes are left as "person"; only the four most confident other boxes are named.
  const nameRegions = useCallback(async (src, res) => {
    const regions = [
      ...res.items.filter(d => d.class !== 'person').sort((a, b) => b.score - a.score).slice(0, 4),
      ...(res.held || []).map(h => ({ ...h, held: true })),
    ]
    if (!regions.length) return []
    const crops = regions.map(r => cropOf(src, r.bbox))
    const namer = await loadObjectNamer(p => setStatus(`Downloading CLIP to name objects… ${(p * 100).toFixed(0)}%`))
    const names = await namer.name(crops)
    return regions.map((r, i) => ({ bbox: r.bbox, held: !!r.held, fine: names[i] }))
  }, [])

  // Give each current box the name of the best-overlapping named box from the last pass
  const attachNames = res => {
    const match = (bbox, held) => {
      let best = null
      let bestIou = 0.3
      for (const n of namesRef.current) {
        if (n.held !== held) continue
        const o = iou(n.bbox, bbox)
        if (o > bestIou) [best, bestIou] = [n, o]
      }
      return best?.fine
    }
    for (const d of res.items) if (d.class !== 'person') d.fine = match(d.bbox, false)
    for (const h of res.held || []) h.fine = match(h.bbox, true)
    return res
  }

  // ── Source handling ───────────────────────────────────────────────────────
  const stopLoop = () => {
    cancelAnimationFrame(loopRef.current)
    loopRef.current = 0
  }

  useEffect(() => {
    const id = ++runId.current
    const counter = runId
    const video = videoRef.current
    stopLoop()
    namesRef.current = []
    let stream
    const start = async () => {
      try {
        if (source === 'webcam') {
          setStatus('Starting webcam…')
          stream = await navigator.mediaDevices.getUserMedia({ video: { width: 960, height: 720, facingMode: 'user' }, audio: false })
          if (id !== runId.current) return stream.getTracks().forEach(t => t.stop())
          const v = videoRef.current
          v.srcObject = stream
          await v.play()
          sourceRef.current = v
        } else {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = upload
          if (!upload) {
            sourceRef.current = null
            setStatus('Choose a photo to analyse. It stays on your device.')
            return
          }
          await img.decode()
          if (id !== runId.current) return
          sourceRef.current = img
        }
        draw(null) // show the photo or camera frame while the model loads
        setStatus(`Loading ${TASKS.find(t => t.key === task).model.split(' · ')[0]}…`)
        if (source !== 'webcam' || task === 'zeroshot') {
          const res = await analyse(sourceRef.current, task, { labels: labelList })
          if (id !== runId.current) return
          setResult(res)
          draw(res)
          setStatus('')
          if (task === 'objects') {
            // Show COCO-SSD's boxes at once, then replace their labels with CLIP's names
            setStatus('Naming objects…')
            namesRef.current = await nameRegions(sourceRef.current, res)
            if (id !== runId.current) return
            const named = attachNames({ ...res })
            setResult(named)
            draw(named)
            setStatus('')
          }
          if (source === 'webcam') liveZeroShot(id)
          return
        }
        // Webcam: run every frame for MediaPipe, a few times a second for COCO-SSD
        let last = 0
        let lastNamed = -Infinity
        let busy = false
        const loop = async now => {
          if (id !== runId.current) return
          loopRef.current = requestAnimationFrame(loop)
          if (busy || (task === 'objects' && now - last < 150)) return
          busy = true
          last = now
          try {
            const res = await analyse(videoRef.current, task)
            if (id === runId.current) {
              if (task === 'objects') {
                attachNames(res)
                // Re-name roughly once a second in the background; boxes keep their last names meanwhile
                if (!namingRef.current && now - lastNamed > 900) {
                  namingRef.current = true
                  lastNamed = now
                  nameRegions(videoRef.current, res)
                    .then(n => {
                      if (id === runId.current) {
                        namesRef.current = n
                        setStatus('')
                      }
                    })
                    .catch(e => id === runId.current && setStatus(`Could not name objects: ${e.message}`))
                    .finally(() => (namingRef.current = false))
                }
              }
              setResult(res)
              draw(res)
              if (task !== 'objects' || namesRef.current.length) setStatus('')
            }
          } finally {
            busy = false
          }
        }
        loopRef.current = requestAnimationFrame(loop)
      } catch (e) {
        if (id === runId.current) setStatus(e.name === 'NotAllowedError' ? 'Webcam permission was declined.' : `Could not run: ${e.message}`)
      }
    }
    // Zero-shot on webcam: classify a frame every ~1.5s (CLIP is heavier)
    const liveZeroShot = async myId => {
      while (myId === runId.current) {
        await new Promise(r => setTimeout(r, 1500))
        if (myId !== runId.current || !videoRef.current) break
        const res = await analyse(videoRef.current, 'zeroshot', { labels: labelList })
        if (myId === runId.current) {
          setResult(res)
          draw(res)
        }
      }
    }
    start()
    return () => {
      counter.current++
      stopLoop()
      stream?.getTracks().forEach(t => t.stop())
      if (video) video.srcObject = null
    }
    // labelList is read at run time; re-running on every keystroke would be wasteful
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, source, upload, analyse, draw, nameRegions])

  // Redraw on resize
  useEffect(() => {
    const ro = new ResizeObserver(() => draw(result))
    if (canvasRef.current) ro.observe(canvasRef.current)
    return () => ro.disconnect()
  }, [draw, result])

  const reclassify = async (list = labelList) => {
    if (!sourceRef.current) return
    setStatus('Classifying…')
    const res = await analyse(sourceRef.current, 'zeroshot', { labels: list })
    setResult(res)
    draw(res)
    setStatus('')
  }

  const t = TASKS.find(x => x.key === task)

  return (
    <div className="flex flex-col">
      {/* Task groups */}
      <div className="flex border-b border-line font-mono text-[10px] uppercase tracking-wide overflow-x-auto no-scrollbar">
        {TASKS.map((x, i) => (
          <button
            key={x.key}
            onClick={() => {
              if (x.key === task) return
              setTask(x.key)
              setResult(null)
            }}
            aria-pressed={task === x.key}
            className={`relative flex-1 shrink-0 min-w-[64px] px-2 py-2 transition-colors ${task === x.key ? 'text-flame' : 'text-mute hover:text-body'} ${i ? 'border-l border-line' : ''}`}
          >
            {x.label}
            {task === x.key && <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-flame" />}
          </button>
        ))}
      </div>

      <div className="relative bg-[#0f0e0d]">
        <canvas ref={canvasRef} className="block w-full aspect-[4/3]" role="img" aria-label={`Live ${t.label.toLowerCase()} result`} />
        <video ref={videoRef} className="hidden" playsInline muted />
        {status && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/70 px-3 py-2 font-mono text-[11px] text-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-flame animate-pulse" />
            {status}
          </div>
        )}
      </div>

      {/* Sources */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-t border-line font-mono text-[10px] uppercase tracking-wide">
        <span className="text-mute pr-1">source</span>
        {SOURCES.map(x => (
          <button
            key={x.key}
            onClick={() => {
              if (x.key === source) return
              setSource(x.key)
              setResult(null)
            }}
            aria-pressed={source === x.key}
            className={`rounded-sm border px-2 py-1 transition-colors ${source === x.key ? 'border-flame text-flame' : 'border-line text-body hover:text-ink'}`}
          >
            {x.label}
          </button>
        ))}
        {source === 'upload' && (
          <label className="ml-auto cursor-pointer rounded-sm border border-line px-2 py-1 text-body hover:text-ink">
            choose file
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) {
                  setUpload(URL.createObjectURL(f))
                  setResult(null)
                }
              }}
            />
          </label>
        )}
      </div>

      {/* Readout: the result and why */}
      <div aria-live="polite" className="px-4 py-3 border-t border-line font-mono text-[11px] h-[168px] short:h-[140px] overflow-y-auto thin-scroll">
        <p className="uppercase tracking-wide text-mute">{t.model} · runs on this device</p>

        {task === 'zeroshot' && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(PRESETS).map(([name, list]) => {
              const on = labels === list.join(', ')
              return (
                <button
                  key={name}
                  onClick={() => {
                    setLabels(list.join(', '))
                    reclassify(list)
                  }}
                  aria-pressed={on}
                  className={`rounded-full border px-2 py-0.5 ${on ? 'border-flame text-flame' : 'border-line text-body hover:text-ink'}`}
                >
                  {name}
                </button>
              )
            })}
          </div>
        )}
        {task === 'zeroshot' && (
          <div className="mt-2 flex gap-2">
            <input
              value={labels}
              onChange={e => setLabels(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && reclassify()}
              aria-label="Labels to choose between, separated by commas"
              className="flex-1 min-w-0 rounded-sm border border-line bg-panel-2 px-2 py-1 text-ink outline-none focus:border-flame"
            />
            <button onClick={() => reclassify()} className="rounded-sm border border-line px-2 py-1 text-body hover:text-ink">run</button>
          </div>
        )}

        {result?.kind === 'zeroshot' && (
          <>
            <ul className="mt-2 flex flex-col gap-1">
              {result.items.slice(0, 3).map((o, i) => (
                <li key={o.label} className="grid grid-cols-[1fr_auto] gap-3">
                  <span className={i ? 'text-body' : 'text-ink'}>{o.label}</span>
                  <span className={i ? 'text-body' : 'text-live'}>{(o.score * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-body leading-relaxed">
              Why: CLIP turns the photo and each label into vectors and picks the label whose vector is closest. Change the labels and press run to compare.
            </p>
          </>
        )}

        {result?.kind === 'objects' && (
          <div className="mt-2 text-ink leading-relaxed">
            {result.items.length || result.held?.some(h => h.fine) ? (
              <ul className="flex flex-col gap-0.5">
                {(result.held || []).filter(h => h.fine).map((h, i) => (
                  <li key={`h${i}`}>
                    <span className="text-live">holding</span> {h.fine[0].label} {pct(h.fine[0].score)}
                    <span className="text-body"> · then {h.fine.slice(1).map(f => `${f.label} ${pct(f.score)}`).join(', ')}</span>
                  </li>
                ))}
                {result.items.map((d, i) => (
                  <li key={i}>
                    {d.fine ? `${d.fine[0].label} ${pct(d.fine[0].score)}` : `${d.class} ${pct(d.score)}`}
                    {d.fine && <span className="text-body"> · COCO-SSD said {d.class} {pct(d.score)}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              'Nothing found yet. Hold an object up near the camera, or try a closer photo.'
            )}
            <span className="block mt-1 text-body">
              Why: COCO-SSD finds where things are (80 classes). Each box, and the area around any hand, is then cropped and compared by CLIP against ~300 labels, including tools, electronics, robotics parts, lab glassware and construction gear. The percentage is CLIP’s confidence among those labels.
            </span>
          </div>
        )}

        {result?.kind === 'pose' && (
          <p className="mt-2 text-ink leading-relaxed">
            {result.items.length ? `${result.items.length} body${result.items.length > 1 ? 'ies' : ''} · 33 keypoints each` : 'No body found. Step back so your shoulders and hips are in frame.'}
            <span className="block mt-1 text-body">Why: joints are drawn only where the model is at least 40% sure that point is visible.</span>
          </p>
        )}

        {result?.kind === 'hands' && (
          <div className="mt-2 text-ink leading-relaxed">
            {result.items.length ? (
              result.items.map((h, i) => (
                <p key={i}>
                  <span className="text-gold">{h.spell.letter ? `Letter ${h.spell.letter}` : 'No letter'}</span>
                  {' · '}because {h.spell.why}
                  <span className="block text-body">{h.spell.fingers.join(' · ')}</span>
                </p>
              ))
            ) : (
              <p>No hand found. Hold one hand up, palm towards the camera.</p>
            )}
            <p className="mt-1 text-body">Reads static ASL letters {SUPPORTED.join(' ')} from which fingers are extended, how far apart, and whether the thumb touches the index. Letters that need motion or subtle contact are not guessed.</p>
          </div>
        )}

        {result?.kind === 'face' && (
          <div className="mt-2 text-ink leading-relaxed">
            {result.items.length ? (
              result.items.map((f, i) => (
                <p key={i} className={i ? 'mt-1.5' : ''}>
                  Face {i + 1}: <span className="text-live">{f.expression} {(f.expressionP * 100).toFixed(0)}%</span>
                  <span className="text-body"> (next: {f.runnerUp[0]} {(f.runnerUp[1] * 100).toFixed(0)}%)</span> ·{' '}
                  <span className="text-live">{f.eyes}</span> · <span className="text-live">{f.head.label}</span>
                  {f.why && <span className="block text-body">Why {f.expression}: {f.why}</span>}
                  <span className="block text-body">Why {f.eyes}: blink score {f.closed.toFixed(2)} (closed above 0.50)</span>
                  <span className="block text-body">Why {f.head.label.replace('looking ', '')}: {f.head.why}</span>
                </p>
              ))
            ) : (
              <p>No face found. Face the camera with both eyes visible.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Copies the current frame (photo or video) to a canvas no larger than 448px
function frameCanvas(src) {
  const W = src.videoWidth || src.naturalWidth
  const H = src.videoHeight || src.naturalHeight
  const s = Math.min(1, 448 / Math.max(W, H))
  const c = document.createElement('canvas')
  c.width = Math.round(W * s)
  c.height = Math.round(H * s)
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height)
  return c
}
