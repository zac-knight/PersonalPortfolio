// Lazy loaders for the in-browser models used by the live lab. Nothing is
// downloaded until a visitor picks a task, and each model is loaded once.
// Libraries come from public CDNs, so the static site needs no server.

const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14'
const MP_MODELS = 'https://storage.googleapis.com/mediapipe-models'
const cache = new Map()

const once = (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn().catch(e => { cache.delete(key); throw e }))
  return cache.get(key)
}

const script = src =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = () => reject(new Error(`Could not load ${src}`))
    document.head.appendChild(s)
  })

const mediapipe = () =>
  once('mp', async () => {
    const vision = await import(/* @vite-ignore */ `${MP}/vision_bundle.mjs`)
    const files = await vision.FilesetResolver.forVisionTasks(`${MP}/wasm`)
    return { vision, files }
  })

// MediaPipe tasks run in VIDEO mode so the same model serves photos and webcam
const mpTask = (key, make) =>
  once(key, async () => {
    const { vision, files } = await mediapipe()
    return make(vision, files)
  })

export const loadPose = () =>
  mpTask('pose', (v, f) =>
    v.PoseLandmarker.createFromOptions(f, {
      baseOptions: { modelAssetPath: `${MP_MODELS}/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numPoses: 2,
    })
  )

export const loadHands = () =>
  mpTask('hands', (v, f) =>
    v.HandLandmarker.createFromOptions(f, {
      baseOptions: { modelAssetPath: `${MP_MODELS}/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 2,
    })
  )

export const loadFace = () =>
  mpTask('face', (v, f) =>
    v.FaceLandmarker.createFromOptions(f, {
      baseOptions: { modelAssetPath: `${MP_MODELS}/face_landmarker/face_landmarker/float16/1/face_landmarker.task`, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 4,
      outputFaceBlendshapes: true,
    })
  )

export const loadObjects = () =>
  once('coco', async () => {
    await script('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js')
    await script('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js')
    return window.cocoSsd.load({ base: 'lite_mobilenet_v2' })
  })

export const loadClip = onProgress =>
  once('clip', async () => {
    const t = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2')
    t.env.allowLocalModels = false
    const files = {}
    const pipe = await t.pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
      // Report combined download progress across the model files
      progress_callback: p => {
        if (p.status !== 'progress' || !p.total) return
        files[p.file] = [p.loaded, p.total]
        const [l, tot] = Object.values(files).reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0])
        onProgress?.(l / tot)
      },
    })
    return { pipe, RawImage: t.RawImage }
  })

// Facial expressions: face-api.js's 7-class expression network, run on a face crop
// (the face is already located by MediaPipe, so no separate detector is needed).
// The ESM build bundles its own TensorFlow.js, separate from COCO-SSD's copy.
export const loadExpressions = () =>
  once('expr', async () => {
    const faceapi = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/dist/face-api.esm.js')
    await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model')
    return faceapi
  })

// Object naming: COCO-SSD only knows 80 classes, so a pen or a multimeter held up
// to the camera comes back as "remote". This names each region from a ~300-label
// vocabulary (everyday items plus workshop, electronics and robotics, chemical lab
// and civil/construction gear) with CLIP. The label text embeddings are computed
// offline (scripts/build-object-vocab.mjs), so only CLIP's image half downloads.
const CLIP_MODEL = 'Xenova/clip-vit-base-patch32'

export const loadObjectNamer = onProgress =>
  once('namer', async () => {
    const t = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2')
    t.env.allowLocalModels = false
    const files = {}
    const progress_callback = p => {
      if (p.status !== 'progress' || !p.total) return
      files[p.file] = [p.loaded, p.total]
      const [l, tot] = Object.values(files).reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0])
      onProgress?.(l / tot)
    }
    const [processor, model, vocab] = await Promise.all([
      t.AutoProcessor.from_pretrained(CLIP_MODEL),
      t.CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL, { progress_callback }),
      fetch(`${import.meta.env.BASE_URL}models/object-vocab.json`).then(r => {
        if (!r.ok) throw new Error('Could not load the object vocabulary')
        return r.json()
      }),
    ])
    const { dim, scale, labels, groups } = vocab
    const weights = Int8Array.from(atob(vocab.data), c => c.charCodeAt(0))

    // Name each canvas: top 3 labels with softmax probabilities (CLIP's logit scale is 100)
    const name = async canvases => {
      if (!canvases.length) return []
      const images = canvases.map(c => t.RawImage.fromCanvas(c))
      const { image_embeds } = await model(await processor(images))
      return canvases.map((_, r) => {
        const v = image_embeds.data.subarray(r * dim, (r + 1) * dim)
        let norm = 0
        for (let d = 0; d < dim; d++) norm += v[d] * v[d]
        norm = Math.sqrt(norm) * scale
        const logits = labels.map((_, i) => {
          let s = 0
          for (let d = 0; d < dim; d++) s += weights[i * dim + d] * v[d]
          return (100 * s) / norm
        })
        const top = Math.max(...logits)
        const exps = logits.map(l => Math.exp(l - top))
        const sum = exps.reduce((a, b) => a + b, 0)
        return exps
          .map((e, i) => ({ label: labels[i], group: groups[i], score: e / sum }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
      })
    }
    return { name, size: labels.length }
  })
