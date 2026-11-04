// Classic image-processing stages computed in the browser on real pixels:
// greyscale → Gaussian blur → Sobel gradients → Canny edges (non-maximum
// suppression + hysteresis). Everything works on Float32Array greyscale images.

// Rec. 601 luma from RGBA pixels
export function greyscale(rgba, w, h) {
  const g = new Float32Array(w * h)
  for (let i = 0; i < g.length; i++) {
    g[i] = (0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2]) / 255
  }
  return g
}

// Separable 5-tap Gaussian (σ ≈ 1.1), clamped at the borders
export function gaussian(src, w, h) {
  const k = [0.0614, 0.2448, 0.3877, 0.2448, 0.0614]
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0
      for (let i = -2; i <= 2; i++) s += src[y * w + Math.min(w - 1, Math.max(0, x + i))] * k[i + 2]
      tmp[y * w + x] = s
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0
      for (let i = -2; i <= 2; i++) s += tmp[Math.min(h - 1, Math.max(0, y + i)) * w + x] * k[i + 2]
      out[y * w + x] = s
    }
  }
  return out
}

// 3×3 Sobel: gradient magnitude and direction
export function sobel(src, w, h) {
  const mag = new Float32Array(w * h)
  const dir = new Float32Array(w * h)
  let max = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = (dx, dy) => src[(y + dy) * w + x + dx]
      const gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1)
      const gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1)
      const m = Math.hypot(gx, gy)
      mag[y * w + x] = m
      dir[y * w + x] = Math.atan2(gy, gx)
      if (m > max) max = m
    }
  }
  return { mag, dir, max }
}

// Canny: thin edges to local maxima along the gradient, then keep weak edges
// only where they connect to strong ones
export function canny(mag, dir, w, h, max) {
  const thin = new Float32Array(w * h)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const a = ((dir[i] * 180) / Math.PI + 180) % 180
      let n1, n2
      // Neighbours along the gradient direction (y grows downward in images)
      if (a < 22.5 || a >= 157.5) [n1, n2] = [i - 1, i + 1]
      else if (a < 67.5) [n1, n2] = [i - w - 1, i + w + 1]
      else if (a < 112.5) [n1, n2] = [i - w, i + w]
      else [n1, n2] = [i - w + 1, i + w - 1]
      if (mag[i] >= mag[n1] && mag[i] >= mag[n2]) thin[i] = mag[i]
    }
  }
  const high = max * 0.16
  const low = high * 0.4
  const edges = new Uint8Array(w * h)
  const stack = []
  for (let i = 0; i < thin.length; i++) {
    if (thin[i] >= high && !edges[i]) {
      edges[i] = 1
      stack.push(i)
      while (stack.length) {
        const j = stack.pop()
        const jx = j % w
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const k = j + dy * w + dx
            if (jx + dx < 0 || jx + dx >= w || k < 0 || k >= thin.length) continue
            if (!edges[k] && thin[k] >= low) {
              edges[k] = 1
              stack.push(k)
            }
          }
        }
      }
    }
  }
  return edges
}
