// Builds public/models/object-vocab.json: CLIP text embeddings for every label in
// scripts/object-vocabulary.json, so the live lab can name objects from a large
// vocabulary while only downloading CLIP's image half in the browser.
//
// Run after editing the vocabulary:
//   npm i --no-save @huggingface/transformers && node scripts/build-object-vocab.mjs
//
// Each label is described with several prompts and the embeddings are averaged
// (prompt ensembling), which makes CLIP noticeably more reliable. Vectors are
// L2-normalised and stored as int8 to keep the file small.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { AutoTokenizer, CLIPTextModelWithProjection } from '@huggingface/transformers'

const MODEL = 'Xenova/clip-vit-base-patch32'
const TEMPLATES = ['a photo of {}.', 'a close-up photo of {}.', 'a photo of a person holding {}.', 'a blurry photo of {}.']
const root = new URL('..', import.meta.url)

const groups = JSON.parse(readFileSync(new URL('scripts/object-vocabulary.json', root), 'utf8'))
const labels = Object.values(groups).flat()
const groupOf = Object.fromEntries(Object.entries(groups).flatMap(([g, ls]) => ls.map(l => [l, g])))

const tokenizer = await AutoTokenizer.from_pretrained(MODEL)
const model = await CLIPTextModelWithProjection.from_pretrained(MODEL, { dtype: 'fp32' })

const normalise = v => {
  const n = Math.hypot(...v)
  return v.map(x => x / n)
}

const vectors = []
for (const label of labels) {
  const inputs = tokenizer(TEMPLATES.map(t => t.replace('{}', label)), { padding: true, truncation: true })
  const { text_embeds } = await model(inputs)
  const [rows, dim] = text_embeds.dims
  const mean = new Array(dim).fill(0)
  for (let r = 0; r < rows; r++) {
    const row = normalise(Array.from(text_embeds.data.slice(r * dim, (r + 1) * dim)))
    row.forEach((x, i) => (mean[i] += x / rows))
  }
  vectors.push(normalise(mean))
}

const dim = vectors[0].length
const max = vectors.flat().reduce((m, x) => Math.max(m, Math.abs(x)), 0)
const scale = 127 / max
const bytes = Int8Array.from(vectors.flat().map(x => Math.round(x * scale)))

mkdirSync(new URL('public/models/', root), { recursive: true })
writeFileSync(
  new URL('public/models/object-vocab.json', root),
  JSON.stringify({ model: MODEL, templates: TEMPLATES, dim, scale, labels, groups: labels.map(l => groupOf[l]), data: Buffer.from(bytes.buffer).toString('base64') })
)
console.log(`Wrote ${labels.length} labels × ${dim} dims`)
