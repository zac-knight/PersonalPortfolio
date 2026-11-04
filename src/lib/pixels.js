// Procedural pixel-art bitmap for the skills illustration.

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
