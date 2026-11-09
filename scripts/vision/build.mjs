// Rebuilds the vision demo data: src/data/vision.js plus the photos in public/cv.
//
//   node scripts/vision/build.mjs            # analyse every photo in photos.json
//   node scripts/vision/build.mjs eyes dog   # only these slugs (others keep their data)
//
// For each photo in scripts/vision/photos.json:
//  - new photos (with "file") are downloaded from Wikimedia Commons, resized and
//    credited from the file's own licence metadata (CC0 / public domain only);
//  - classes: CLIP ViT-B/32 zero-shot over the photo's label set (and per panel or
//    grid cell when "tiles" is set);
//  - parts: OWLv2 open-vocabulary detection of the photo's prompts;
//  - objects: COCO-SSD on the full frame plus overlapping 2×2 and 3×3 tiles, merged
//    with non-maximum suppression; each crop is then named by CLIP against the same
//    ~300-label vocabulary the live lab uses (public/models/object-vocab.json);
//  - text (when "ocr" is set): Tesseract OCR on a high-resolution copy, word boxes;
//  - poses / faces: MediaPipe pose landmarker / face landmarker in headless Chrome.
// Entries marked "keep" are copied unchanged from the current vision.js.
//
// Needs the dev dependencies (@huggingface/transformers, tesseract.js, sharp,
// playwright-core) and Google Chrome installed.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'
import { chromium } from 'playwright-core'
import { createWorker } from 'tesseract.js'
import {
  pipeline, AutoProcessor, CLIPVisionModelWithProjection, RawImage,
} from '@huggingface/transformers'

const root = new URL('../../', import.meta.url)
const at = p => new URL(p, root)
const photos = JSON.parse(readFileSync(at('scripts/vision/photos.json'), 'utf8'))
const only = new Set(process.argv.slice(2))
const DATA = at('src/data/vision.js')
const UA = { 'User-Agent': 'PortfolioVisionPipeline/1.0 (personal portfolio demo)' }
const MAX_W = 960
const MAX_H = 1200
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const r1 = x => Math.round(x)
const r2 = x => Math.round(x * 100) / 100
const r3 = x => Math.round(x * 1000) / 1000
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => console.log(...a)

// ── Existing data ────────────────────────────────────────────────────────────
const current = readFileSync(DATA, 'utf8')
const blocks = new Map()
for (const b of current.slice(current.indexOf('const vision = [')).split('\n  {\n').slice(1)) {
  const slug = b.match(/slug: "([^"]+)"/)[1]
  blocks.set(slug, '  {\n' + b.replace(/\n\]\n\nexport default vision\n?$/, '').replace(/\n$/, ''))
}

// ── Commons download ─────────────────────────────────────────────────────────
async function commons(file) {
  const q = new URLSearchParams({ action: 'query', titles: file, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '2000', format: 'json' })
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`https://commons.wikimedia.org/w/api.php?${q}`, { headers: UA })
    if (r.status === 429) { await sleep(15000 * (i + 1)); continue }
    const page = Object.values((await r.json()).query.pages)[0]
    const ii = page.imageinfo[0]
    const meta = ii.extmetadata
    const strip = h => (h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    const license = strip(meta.LicenseShortName?.value)
    if (!/^(cc0|public domain|pd)/i.test(license)) throw new Error(`${file}: licence "${license}" is not CC0 / public domain`)
    return { url: ii.thumburl || ii.url, author: strip(meta.Artist?.value) || 'Unknown', license, source: ii.descriptionurl }
  }
  throw new Error(`${file}: Commons kept rate-limiting`)
}

async function download(url) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: UA })
    if (r.status === 429) { await sleep(15000 * (i + 1)); continue }
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`)
    return Buffer.from(await r.arrayBuffer())
  }
  throw new Error(`${url}: rate-limited`)
}

// ── Model setup ──────────────────────────────────────────────────────────────
const CLIP = 'Xenova/clip-vit-base-patch32'
log('Loading CLIP, OWLv2 and the object vocabulary…')
const clip = await pipeline('zero-shot-image-classification', CLIP, { dtype: 'fp32' })
const owl = await pipeline('zero-shot-object-detection', 'Xenova/owlv2-base-patch16-ensemble', { dtype: 'q8' })
const clipProcessor = await AutoProcessor.from_pretrained(CLIP)
const clipVision = await CLIPVisionModelWithProjection.from_pretrained(CLIP, { dtype: 'fp32' })
const vocab = JSON.parse(readFileSync(at('public/models/object-vocab.json'), 'utf8'))
const vocabW = new Int8Array(Buffer.from(vocab.data, 'base64'))

const rawOf = async buf => {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return new RawImage(new Uint8ClampedArray(data), info.width, info.height, 3)
}
const crop = (buf, [x, y, w, h], W, H) => {
  const l = Math.max(0, r1(x)), t = Math.max(0, r1(y))
  return sharp(buf).extract({ left: l, top: t, width: Math.max(1, Math.min(W - l, r1(w))), height: Math.max(1, Math.min(H - t, r1(h))) }).toBuffer()
}

// "this is {}." scored best of the templates tried on the photos with known answers
async function classify(buf, labels, k = 5, template = 'this is {}.') {
  const out = await clip(await rawOf(buf), labels, { hypothesis_template: template })
  return out.sort((a, b) => b.score - a.score).slice(0, k).map(o => [o.label, r3(o.score)])
}

// Name a crop from the shared vocabulary (top label and its softmax probability)
async function nameCrop(buf) {
  const { image_embeds } = await clipVision(await clipProcessor(await rawOf(buf)))
  const v = image_embeds.data
  let n = 0
  for (let d = 0; d < vocab.dim; d++) n += v[d] * v[d]
  n = Math.sqrt(n) * vocab.scale
  const logits = vocab.labels.map((_, i) => {
    let s = 0
    for (let d = 0; d < vocab.dim; d++) s += vocabW[i * vocab.dim + d] * v[d]
    return (100 * s) / n
  })
  const top = Math.max(...logits)
  const ex = logits.map(l => Math.exp(l - top))
  const sum = ex.reduce((a, b) => a + b, 0)
  const best = ex.indexOf(Math.max(...ex))
  return [vocab.labels[best], ex[best] / sum]
}

const iou = (a, b) => {
  const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]))
  const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]))
  const i = ix * iy
  return i / (a[2] * a[3] + b[2] * b[3] - i || 1)
}

// OWLv2 parts: one label per region (class-agnostic NMS), strongest first
async function parts(buf, prompts) {
  if (!prompts?.length) return []
  const out = await owl(await rawOf(buf), prompts, { threshold: 0.2 })
  const boxes = out
    .map(o => ({ label: o.label, score: o.score, box: [o.box.xmin, o.box.ymin, o.box.xmax - o.box.xmin, o.box.ymax - o.box.ymin] }))
    .sort((a, b) => b.score - a.score)
  const kept = []
  for (const b of boxes) if (!kept.some(k => iou(k.box, b.box) > 0.5)) kept.push(b)
  return kept.slice(0, 18).map(b => [b.label, ...b.box.map(r1), r2(b.score)])
}

// OCR. Documents ("page") are read whole. In photos ("regions") text is found
// first (OWLv2 prompted with "text", "sign", "logo"…), then each region is cropped
// from the high-resolution copy, enlarged and read on its own: detect, then recognise.
const ocrWorker = await createWorker('eng')
const cleanWord = t => t.replace(/[^\p{L}\p{N}.,:'&%/-]/gu, '').replace(/^[.,:'/-]+|[.,:'/-]+$/g, '')
async function ocr(img, psm) {
  await ocrWorker.setParameters({ tessedit_pageseg_mode: psm })
  const { data } = await ocrWorker.recognize(img, {}, { blocks: true })
  const words = []
  for (const block of data.blocks || [])
    for (const para of block.paragraphs)
      for (const line of para.lines)
        for (const w of line.words) {
          const text = cleanWord(w.text)
          if (!text || w.confidence < 70) continue
          // single characters are mostly noise unless they are digits read confidently
          if (text.length < 2 && !(/\p{N}/u.test(text) && w.confidence >= 80) && w.confidence < 90) continue
          words.push({ text, conf: w.confidence / 100, box: w.bbox })
        }
  return words
}
async function readText(p, hires, buf, W, H) {
  const src = hires || buf
  const meta = await sharp(src).metadata()
  const k = meta.width / W // high-res pixels per stored pixel
  const out = []
  const push = (wd, ox, oy, s) => {
    const { x0, y0, x1, y1 } = wd.box
    const box = [(ox + x0 / s) / k, (oy + y0 / s) / k, (x1 - x0) / s / k, (y1 - y0) / s / k]
    if (box[2] < 5 || box[3] < 8) return // specks
    // in photos, short letter-only words are mostly noise (numbers are kept)
    if (p.ocr !== 'page' && !/\p{N}/u.test(wd.text) && wd.text.length < 3) return
    out.push([wd.text, ...box.map(r1), r2(wd.conf)])
  }
  if (p.ocr === 'page') {
    const s = Math.max(1, 2000 / meta.width)
    const img = await sharp(src).resize(r1(meta.width * s)).greyscale().normalise().png().toBuffer()
    for (const wd of await ocr(img, '3')) push(wd, 0, 0, s)
  } else {
    const regions = await owl(await rawOf(buf), p.textPrompts || ['text', 'sign', 'logo'], { threshold: 0.15 })
    const seen = []
    for (const r of regions.sort((a, b) => b.score - a.score)) {
      const bw = r.box.xmax - r.box.xmin, bh = r.box.ymax - r.box.ymin
      const box = [r.box.xmin - bw * 0.2, r.box.ymin - bh * 0.2, bw * 1.4, bh * 1.4]
      if (seen.some(q => iou(q, box) > 0.5) || seen.length >= 6) continue
      seen.push(box)
      const left = Math.max(0, r1(box[0] * k)), top = Math.max(0, r1(box[1] * k))
      const width = Math.min(meta.width - left, r1(box[2] * k)), height = Math.min(meta.height - top, r1(box[3] * k))
      if (width < 12 || height < 12) continue
      // Read the region several ways and keep whichever reading is most confident:
      // whole and with its border trimmed (a sign's rim confuses the layout step),
      // as is and inverted (light-on-dark text like STOP), and as sparse text
      const crops = [[left, top, width, height], [left + r1(width * 0.15), top + r1(height * 0.15), r1(width * 0.7), r1(height * 0.7)]]
      const readings = []
      for (const [cl, ct, cw, chh] of crops) {
        const s = Math.max(1, 360 / chh)
        const base = sharp(src).extract({ left: cl, top: ct, width: cw, height: chh }).resize(r1(cw * s)).greyscale().normalise()
        for (const [img, psm] of [
          [base.clone(), '6'], [base.clone().negate(), '6'], [base.clone(), '11'],
          [base.clone().threshold(140), '6'], [base.clone().negate().threshold(115), '6'], // black-and-white versions
        ])
          readings.push({ words: await ocr(await img.png().toBuffer(), psm), cl, ct, s })
      }
      const worth = r => r.words.reduce((a, w) => a + w.conf * w.text.length, 0)
      let best = readings.sort((a, b) => worth(b) - worth(a))[0]
      // Refine: crop tightly around the line(s) just found and read again
      if (best.words.length) {
        const xs = best.words.flatMap(w => [w.box.x0, w.box.x1]).map(v => best.cl + v / best.s)
        const ys = best.words.flatMap(w => [w.box.y0, w.box.y1]).map(v => best.ct + v / best.s)
        const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
        const padX = (x1 - x0) * 0.12, padY = (y1 - y0) * 0.35
        const rl = Math.max(0, r1(x0 - padX)), rt = Math.max(0, r1(y0 - padY))
        const rw = Math.min(meta.width - rl, r1(x1 - x0 + padX * 2)), rh = Math.min(meta.height - rt, r1(y1 - y0 + padY * 2))
        if (rw > 12 && rh > 12) {
          const s = Math.max(1, 120 / rh)
          const base = sharp(src).extract({ left: rl, top: rt, width: rw, height: rh }).resize(r1(rw * s)).greyscale().normalise()
          const refined = []
          for (const [img, psm] of [[base.clone(), '7'], [base.clone().negate(), '7'], [base.clone(), '6'], [base.clone().negate(), '6']])
            refined.push({ words: await ocr(await img.png().toBuffer(), psm), cl: rl, ct: rt, s })
          const top = refined.sort((a, b) => worth(b) - worth(a))[0]
          if (top.words.length >= best.words.length && worth(top) >= worth(best) * 0.8) best = top
        }
      }
      if (process.env.DEBUG_OCR) console.log('   region', r.label, r2(r.score), [left, top, width, height], readings.map(x => x.words.map(w => `${w.text}:${r2(w.conf)}`).join(' ') + ` (${worth(x).toFixed(1)})`))
      for (const wd of best.words) push(wd, best.cl, best.ct, best.s)
    }
  }
  // the same word read from overlapping regions: keep the most confident
  const kept = []
  const inside = (a, b) => {
    const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]))
    const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]))
    return (ix * iy) / (a[2] * a[3] || 1)
  }
  // a word mostly covered by a more confident word is a duplicate reading (e.g. "0" inside "20")
  for (const w of out.sort((a, b) => b[5] - a[5])) if (!kept.some(q => inside(w.slice(1, 5), q.slice(1, 5)) > 0.5)) kept.push(w)
  return kept.sort((a, b) => a[2] - b[2] || a[1] - b[1]).slice(0, 60)
}

function tileBoxes(t, W, H) {
  if (t.mode === 'panels') {
    const gap = 4
    const pw = Math.floor((W - gap * (t.n - 1)) / t.n)
    return Array.from({ length: t.n }, (_, i) => [i * (pw + gap), 0, pw, H])
  }
  const cw = W / t.cols, ch = H / t.rows
  return Array.from({ length: t.cols * t.rows }, (_, i) => [r1((i % t.cols) * cw), r1(Math.floor(i / t.cols) * ch), r1(cw), r1(ch)])
}

// ── Browser models: COCO-SSD and MediaPipe ───────────────────────────────────
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
await page.goto('about:blank')
await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js' })
await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js' })
await page.evaluate(async () => {
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14'
  const M = 'https://storage.googleapis.com/mediapipe-models'
  const v = await import(`${MP}/vision_bundle.mjs`)
  const files = await v.FilesetResolver.forVisionTasks(`${MP}/wasm`)
  window.coco = await window.cocoSsd.load({ base: 'mobilenet_v2' })
  window.pose = await v.PoseLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: `${M}/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task` }, runningMode: 'IMAGE', numPoses: 2 })
  window.face = await v.FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: `${M}/face_landmarker/face_landmarker/float16/1/face_landmarker.task` }, runningMode: 'IMAGE', numFaces: 4, outputFaceBlendshapes: true })
  const idx = c => [...new Set(c.flatMap(e => [e.start, e.end]))]
  const F = v.FaceLandmarker
  window.eyeIdx = [...new Set([F.FACE_LANDMARKS_LEFT_EYE, F.FACE_LANDMARKS_RIGHT_EYE, F.FACE_LANDMARKS_LEFT_EYEBROW, F.FACE_LANDMARKS_RIGHT_EYEBROW, F.FACE_LANDMARKS_LEFT_IRIS, F.FACE_LANDMARKS_RIGHT_IRIS].flatMap(idx))]
  window.hands = await v.HandLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: `${M}/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task` }, runningMode: 'IMAGE', numHands: 1, minHandDetectionConfidence: 0.3 })
  window.loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })
})
// The live lab's fingerspelling rules, so the demo and the live lab read signs identically
await page.addScriptTag({ content: readFileSync(at('src/lib/fingerspell.js'), 'utf8').replace(/^export /gm, '') + '\nwindow.fingerspell = fingerspell' })
log('Browser models ready')

async function browserAnalyse(buf, opts) {
  const src = `data:image/jpeg;base64,${buf.toString('base64')}`
  return page.evaluate(async ({ src, opts }) => {
    const img = await window.loadImg(src)
    const W = img.naturalWidth, H = img.naturalHeight
    // COCO-SSD: full frame + overlapping 2×2 and 3×3 tiles
    const found = []
    for (const n of [1, 2, 3]) {
      const tw = n === 1 ? W : (W / n) * 1.3
      const th = n === 1 ? H : (H / n) * 1.3
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x0 = n === 1 ? 0 : Math.min(W - tw, Math.max(0, (W / n) * i - (tw - W / n) / 2))
          const y0 = n === 1 ? 0 : Math.min(H - th, Math.max(0, (H / n) * j - (th - H / n) / 2))
          const c = document.createElement('canvas')
          c.width = Math.round(tw); c.height = Math.round(th)
          c.getContext('2d').drawImage(img, x0, y0, tw, th, 0, 0, c.width, c.height)
          for (const d of await window.coco.detect(c, 20, n === 1 ? 0.45 : 0.6)) {
            const [x, y, w, h] = d.bbox
            // drop detections cut off by a tile edge (they reappear whole in another tile)
            if (n > 1 && ((x < 2 && x0 > 0) || (y < 2 && y0 > 0) || (x + w > c.width - 2 && x0 + tw < W) || (y + h > c.height - 2 && y0 + th < H))) continue
            found.push({ cls: d.class, score: d.score, box: [x + x0, y + y0, w, h] })
          }
        }
    }
    const iou = (a, b) => {
      const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]))
      const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]))
      const i = ix * iy
      return i / (a[2] * a[3] + b[2] * b[3] - i || 1)
    }
    found.sort((a, b) => b.score - a.score)
    const objects = []
    for (const f of found) if (!objects.some(o => o.cls === f.cls && iou(o.box, f.box) > 0.4)) objects.push(f)
    const out = { W, H, objects: objects.slice(0, 30) }
    if (opts.pose) {
      const r = window.pose.detect(img)
      out.poses = r.landmarks.map(lm => lm.map(p => [Math.round(p.x * W), Math.round(p.y * H), Math.round((p.visibility ?? 1) * 100) / 100]))
    }
    if (opts.faces) {
      const r = window.face.detect(img)
      out.faces = r.faceLandmarks.map((lm, i) => {
        const xs = lm.map(p => p.x * W), ys = lm.map(p => p.y * H)
        const bs = Object.fromEntries((r.faceBlendshapes[i]?.categories || []).map(c => [c.categoryName, c.score]))
        const closed = ((bs.eyeBlinkLeft || 0) + (bs.eyeBlinkRight || 0)) / 2
        const open = Math.round((1 - closed) * 100) / 100
        const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)].map(Math.round)
        return {
          box, score: 1,
          landmarks: window.eyeIdx.map(k => [Math.round(lm[k].x * W), Math.round(lm[k].y * H)]),
          expressions: (open >= 0.5 ? [['eyes open', open], ['eyes closed', Math.round((1 - open) * 100) / 100]] : [['eyes closed', Math.round((1 - open) * 100) / 100], ['eyes open', open]]),
        }
      })
    }
    return out
  }, { src, opts })
}

// Sign charts: each hand OWLv2 found is cropped (square, with margin) and given to
// MediaPipe's hand landmarker; its 21 keypoints are read by the fingerspelling rules.
async function readSigns(buf, boxes) {
  const src = `data:image/jpeg;base64,${buf.toString('base64')}`
  return page.evaluate(async ({ src, boxes }) => {
    const img = await window.loadImg(src)
    const out = []
    for (const [x, y, w, h] of boxes) {
      const size = Math.max(w, h) * 1.5
      const cx = x + w / 2, cy = y + h / 2
      const c = document.createElement('canvas')
      c.width = c.height = 256
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, 256, 256)
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size, 0, 0, 256, 256)
      const r = window.hands.detect(c)
      if (!r.landmarks.length) { out.push(null); continue }
      const lm = r.landmarks[0].map(p => [Math.round(cx - size / 2 + p.x * size), Math.round(cy - size / 2 + p.y * size)])
      const spell = window.fingerspell(r.worldLandmarks?.[0] || r.landmarks[0])
      out.push({ handedness: r.handedness[0][0].categoryName, score: Math.round(r.handedness[0][0].score * 100) / 100, landmarks: lm, letter: spell.letter, why: spell.why })
    }
    return out
  }, { src, boxes })
}

async function signs(p, buf, W, H, content) {
  const found = (await owl(await rawOf(buf), ['hand'], { threshold: 0.1 }))
    .map(o => ({ score: o.score, box: [o.box.xmin, o.box.ymin, o.box.xmax - o.box.xmin, o.box.ymax - o.box.ymin] }))
    .filter(o => o.box[2] > 24 && o.box[3] > 24 && o.box[2] * o.box[3] < W * H * 0.2)
    .sort((a, b) => b.score - a.score)
  const boxes = []
  for (const f of found) if (!boxes.some(b => iou(b, f.box) > 0.3)) boxes.push(f.box)
  const reads = await readSigns(buf, boxes)
  // The chart's own order gives the right answer for each position
  const area = content || { x: 0, y: 0, w: W, h: H }
  const truthAt = ([x, y, w, h]) => {
    if (!p.signLayout) return null
    const nx = (x + w / 2 - area.x) / area.w, ny = (y + h / 2 - area.y) / area.h
    let best = null, bd = Infinity
    for (const [letter, cx, cy] of p.signLayout) {
      const d = Math.hypot(nx - cx, (ny - cy) * 1.2)
      if (d < bd) [best, bd] = [letter, d]
    }
    return bd < 0.12 ? best : null
  }
  const hands = []
  boxes.forEach((box, i) => {
    const r = reads[i]
    if (!r) return
    const truth = truthAt(box)
    hands.push({
      handedness: r.handedness, gestures: [[r.letter ? `letter ${r.letter}` : 'no letter', r.score]], landmarks: r.landmarks,
      letter: r.letter, why: r.why, ...(truth && { truth }),
    })
  })
  hands.sort((a, b) => a.landmarks[0][1] - b.landmarks[0][1] || a.landmarks[0][0] - b.landmarks[0][0])
  return { hands, found: boxes.length }
}

// ── Run ──────────────────────────────────────────────────────────────────────
mkdirSync(at('public/cv/cat'), { recursive: true })
mkdirSync(at('public/cv/thumb'), { recursive: true })
const entries = []
for (const p of photos) {
  if (p.keep || (only.size && !only.has(p.slug))) {
    if (blocks.has(p.slug)) entries.push(blocks.get(p.slug))
    else if (p.keep) throw new Error(`${p.slug}: no existing data to keep`)
    continue
  }
  log(`· ${p.slug}`)
  const imgPath = at(`public/cv/${p.path}.jpg`)
  let credit = p.credit
  let hires
  let content = null // where a padded chart sits inside the stored image
  if (p.file) {
    const c = await commons(p.file)
    credit = { author: c.author, license: c.license, source: c.source }
    hires = await download(c.url)
    // The demo shows photos in a 4:3 frame. Tall photos are cropped to 4:3 here, keeping
    // the most salient region (sharp's attention strategy), so nothing the models find
    // falls outside the visible frame.
    const meta = await sharp(hires).metadata()
    const [ow, oh] = (meta.orientation || 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height] // EXIF-rotated
    const img = sharp(hires).rotate().flatten({ background: '#ffffff' })
    // Charts ("fit": "pad") are letterboxed onto white instead, so no row is lost
    if (p.fit === 'pad') {
      const k = Math.min(MAX_W / ow, 720 / oh)
      content = { x: (MAX_W - ow * k) / 2, y: (720 - oh * k) / 2, w: ow * k, h: oh * k }
    }
    await (p.fit === 'pad'
      ? img.resize(MAX_W, 720, { fit: 'contain', background: '#ffffff' })
      : ow / oh < 1.25
        ? img.resize(MAX_W, 720, { fit: 'cover', position: sharp.strategy.attention })
        : img.resize(MAX_W, MAX_H, { fit: 'inside', withoutEnlargement: true })
    ).jpeg({ quality: 86, mozjpeg: true }).toFile(imgPath.pathname).then(() => {})
    // keep the high-resolution copy (used for OCR) laid out exactly like the stored image
    if (p.fit === 'pad') hires = await sharp(hires).rotate().flatten({ background: '#ffffff' }).resize(MAX_W * 2, 1440, { fit: 'contain', background: '#ffffff' }).png().toBuffer()
    await sleep(1500)
  } else if (!existsSync(imgPath)) {
    throw new Error(`${p.slug}: missing ${imgPath.pathname}`)
  }
  const buf = readFileSync(imgPath)
  await sharp(buf).resize(120).jpeg({ quality: 80 }).toFile(at(`public/cv/thumb/${p.path.replace('/', '-')}.jpg`).pathname)
  const { width: W, height: H } = await sharp(buf).metadata()

  const b = await browserAnalyse(buf, { pose: p.pose, faces: p.faces })
  const objects = []
  for (const o of b.objects) {
    let fine = null, fineScore = 0
    if (o.cls !== 'person' && o.box[2] * o.box[3] > 900) {
      const [label, score] = await nameCrop(await crop(buf, o.box, W, H))
      if (score >= 0.5 && label !== o.cls) [fine, fineScore] = [label, r2(score)]
    }
    objects.push([o.cls, ...o.box.map(r1), r2(o.score), fine, fineScore])
  }
  const tiles = p.tiles
    ? await Promise.all(tileBoxes(p.tiles, W, H).map(async (box, i) => {
        const t = { box, classes: await classify(await crop(buf, box, W, H), p.labels, 3, p.template) }
        if (p.tiles.truths?.[i]) t.truth = p.tiles.truths[i]
        return t
      }))
    : null
  const text = p.ocr ? await readText(p, hires, buf, W, H) : null
  const sign = p.signs ? await signs(p, buf, W, H, content) : null

  const e = {
    slug: p.slug, w: W, h: H, credit, path: p.path, group: p.group, classifier: 'clip',
    ...(p.truth && { truth: p.truth }),
    ...(tiles && { tileMode: p.tiles.mode }),
    ...(p.faces && { faceModel: 'mediapipe', faces: b.faces }),
    parts: await parts(buf, p.prompts),
    ...(text && { text }),
    ...(p.pose && { poses: b.poses }),
    ...(sign && { handsFound: sign.found, hands: sign.hands }),
    ...(tiles && { tiles }),
    classes: await classify(buf, p.labels, 5, p.template),
    objects,
  }
  entries.push(serialise(e))
  if (sign) log(`  signs: ${sign.hands.length}/${sign.found} hands read · ${sign.hands.map(h => `${h.truth || '?'}→${h.letter || '-'}`).join(' ')}`)
  log(`  ${e.classes[0][0]} ${e.classes[0][1]}${p.truth ? (e.classes[0][0] === p.truth ? ' ✓' : ` ✗ (${p.truth})`) : ''} · ${objects.length} objects · ${e.parts.length} parts${text ? ` · text: ${text.map(t => t[0]).join(' ').slice(0, 80)}` : ''}`)
}

await browser.close()
await ocrWorker.terminate()

// ── Write vision.js in the existing style ────────────────────────────────────
function serialise(e) {
  const J = v => JSON.stringify(v).replace(/,(?=[\[\d"n{-])/g, ', ').replace(/":/g, '": ')
  const list = (k, arr) => `    ${k}: [\n${arr.map(x => `      ${J(x)},`).join('\n')}${arr.length ? '\n' : ''}    ],`
  const lines = ['  {']
  for (const [k, v] of Object.entries(e)) {
    if (['faces', 'parts', 'poses', 'tiles', 'objects', 'text', 'hands'].includes(k)) lines.push(list(k, v))
    else if (k === 'credit' || k === 'classes') lines.push(`    ${k}: ${J(v)},`)
    else lines.push(`    ${k}: ${typeof v === 'number' ? v : JSON.stringify(v)},`)
  }
  lines.push('  },')
  return lines.join('\n')
}

const header = `// Public-domain (CC0 / PD) photos from Wikimedia Commons with real model output,
// computed offline by scripts/vision/build.mjs (edit scripts/vision/photos.json and
// re-run it to add or change photos):
//  - objects: COCO-SSD (MobileNet v2) run on the full frame and on overlapping
//    2×2 and 3×3 tiles, merged with non-maximum suppression. Each entry is
//    [cocoClass, x, y, w, h, score, fineLabel, fineScore] in natural pixels, where
//    fineLabel names the object's crop with CLIP against a ~300-label vocabulary
//    (null if below 0.5 confidence or the same as the COCO class; always null for people).
//  - classes: CLIP ViT-B/32 zero-shot over the photo's own label set.
//  - parts: OWLv2 (open-vocabulary, text-prompted) detections of finer details,
//    [prompt, x, y, w, h, score], one label per region, score >= 0.2.
//  - text: Tesseract OCR word boxes, [word, x, y, w, h, confidence].
//  - poses / faces: MediaPipe pose landmarker (33 points) / face landmarker (eye region).
//  - kind 'gesture': MediaPipe GestureRecognizer hands (21 landmarks + gesture).
//  - kind 'faces': face-api.js faces (box, 68 landmarks, expression scores).
`
writeFileSync(DATA, `${header}const vision = [\n${entries.join('\n')}\n]\n\nexport default vision\n`)
log(`Wrote ${entries.length} photos to src/data/vision.js`)
