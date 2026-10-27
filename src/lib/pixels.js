// Procedural pixel-art bitmaps used for the hero monogram and skills illustration.

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

const LETTER_W = 13
const LETTER_H = 18
const STROKE = 4

function letterZ(x, y) {
  if (y < STROKE || y >= LETTER_H - STROKE) return true
  return distToSegment(x, y, LETTER_W - 1.5, STROKE - 1, 0.5, LETTER_H - STROKE) < 1.9
}

function letterK(x, y) {
  if (x < STROKE) return true
  const mid = LETTER_H / 2 - 0.5
  return (
    distToSegment(x, y, STROKE - 1, mid, LETTER_W - 1, 0) < 1.8 ||
    distToSegment(x, y, STROKE + 1, mid - 1, LETTER_W - 1, LETTER_H - 1) < 1.8
  )
}

// "ZK" monogram with a stepped pixel extrusion, tone 0 = face, tone 1 = side.
export function monogram(depth = 3, spacing = 6) {
  const face = new Set()
  const letters = [letterZ, letterK]
  letters.forEach((inside, i) => {
    const ox = i * (LETTER_W + spacing)
    for (let y = 0; y < LETTER_H; y++) {
      for (let x = 0; x < LETTER_W; x++) {
        if (inside(x, y)) face.add(`${x + ox},${y}`)
      }
    }
  })

  const side = new Set()
  for (let d = 1; d <= depth; d++) {
    for (const key of face) {
      const [x, y] = key.split(',').map(Number)
      const k = `${x + d},${y + d}`
      if (!face.has(k)) side.add(k)
    }
  }

  const cells = [
    ...[...side].map(k => [...k.split(',').map(Number), 1]),
    ...[...face].map(k => [...k.split(',').map(Number), 0]),
  ]
  return { cells, width: LETTER_W * 2 + spacing + depth, height: LETTER_H + depth }
}

// A small feed-forward network: tone 0 = nodes, tone 1 = weights.
export function neuralNet({ width = 76, height = 46, layers = [3, 4, 4, 2], radius = 3.2, reach = 0.35 } = {}) {
  const margin = radius + 1.5
  const nodes = layers.map((count, li) => {
    const x = margin + (li * (width - 1 - 2 * margin)) / (layers.length - 1)
    return Array.from({ length: count }, (_, k) => [x, ((k + 1) * height) / (count + 1) - 0.5])
  })

  const nodeCells = new Set()
  for (const layer of nodes) {
    for (const [cx, cy] of layer) {
      for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
          if (Math.hypot(x - cx, y - cy) <= radius) nodeCells.add(`${x},${y}`)
        }
      }
    }
  }

  const edgeCells = new Set()
  for (let li = 0; li < nodes.length - 1; li++) {
    for (const [ax, ay] of nodes[li]) {
      // Only connect to nodes at a similar relative height, so the weights stay legible
      for (const [bx, by] of nodes[li + 1].filter(([, y]) => Math.abs(y - ay) / height <= reach)) {
        const steps = Math.ceil(Math.hypot(bx - ax, by - ay) * 2)
        for (let s = 0; s <= steps; s++) {
          const k = `${Math.round(ax + ((bx - ax) * s) / steps)},${Math.round(ay + ((by - ay) * s) / steps)}`
          if (!nodeCells.has(k)) edgeCells.add(k)
        }
      }
    }
  }

  const cells = [
    ...[...edgeCells].map(k => [...k.split(',').map(Number), 1]),
    ...[...nodeCells].map(k => [...k.split(',').map(Number), 0]),
  ]
  return { cells, width, height }
}
