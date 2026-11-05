// Rule-based ASL fingerspelling from MediaPipe's 21 hand landmarks.
// Each finger is read as extended or curled from joint geometry, then matched
// against the static one-hand letters whose shapes those states distinguish.
// Every result carries the evidence it was based on, so the decision is explainable.
// Motion letters (J, Z) and letters that differ only by subtle contact or
// orientation (M/N/S/T/E, K/V, G/H/P/Q) are deliberately not claimed.

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0))

// A finger is extended when its tip is clearly further from the wrist than its middle joint
function fingerState(lm, tip, pip, mcp) {
  const w = lm[0]
  const ratio = dist(lm[tip], w) / Math.max(1e-6, dist(lm[pip], w))
  // Straightness: tip→mcp distance relative to the bone lengths along the finger
  const along = dist(lm[tip], lm[pip]) + dist(lm[pip], lm[mcp])
  const straight = dist(lm[tip], lm[mcp]) / Math.max(1e-6, along)
  return { extended: ratio > 1.15 && straight > 0.8, ratio, straight }
}

export function readHand(lm) {
  const palm = dist(lm[0], lm[9]) // wrist to middle-finger base: hand size
  const index = fingerState(lm, 8, 6, 5)
  const middle = fingerState(lm, 12, 10, 9)
  const ring = fingerState(lm, 16, 14, 13)
  const pinky = fingerState(lm, 20, 18, 17)
  // Thumb is out when its tip is far from the index base, relative to hand size
  const thumbSpread = dist(lm[4], lm[5]) / palm
  const thumb = { extended: thumbSpread > 0.6, spread: thumbSpread }
  const spreadIM = dist(lm[8], lm[12]) / palm // gap between index and middle tips
  const pinch = dist(lm[4], lm[8]) / palm // thumb tip to index tip
  return { index, middle, ring, pinky, thumb, spreadIM, pinch }
}

const LETTERS = [
  { letter: 'B', why: '4 fingers straight up, thumb folded across the palm', test: h => h.index.extended && h.middle.extended && h.ring.extended && h.pinky.extended && !h.thumb.extended },
  { letter: 'W', why: 'index, middle and ring extended; pinky and thumb folded', test: h => h.index.extended && h.middle.extended && h.ring.extended && !h.pinky.extended },
  { letter: 'F', why: 'thumb and index touching in a circle; middle, ring and pinky extended', test: h => h.pinch < 0.35 && h.middle.extended && h.ring.extended && h.pinky.extended },
  { letter: 'Y', why: 'thumb and pinky out; index, middle and ring curled', test: h => h.thumb.extended && h.pinky.extended && !h.index.extended && !h.middle.extended && !h.ring.extended },
  { letter: 'I', why: 'only the pinky extended', test: h => h.pinky.extended && !h.thumb.extended && !h.index.extended && !h.middle.extended && !h.ring.extended },
  { letter: 'L', why: 'thumb and index extended at a right angle; others curled', test: h => h.thumb.extended && h.index.extended && !h.middle.extended && !h.ring.extended && !h.pinky.extended },
  { letter: 'V', why: 'index and middle extended and spread apart', test: h => h.index.extended && h.middle.extended && !h.ring.extended && !h.pinky.extended && h.spreadIM > 0.35 },
  { letter: 'U', why: 'index and middle extended and held together', test: h => h.index.extended && h.middle.extended && !h.ring.extended && !h.pinky.extended && h.spreadIM <= 0.35 },
  { letter: 'D', why: 'only the index extended, thumb touching the other fingers', test: h => h.index.extended && !h.middle.extended && !h.ring.extended && !h.pinky.extended && !h.thumb.extended },
  { letter: 'O', why: 'all fingertips curved to meet the thumb in a circle', test: h => !h.index.extended && !h.middle.extended && h.pinch < 0.3 },
  { letter: 'A', why: 'fist with the thumb resting up the side', test: h => !h.index.extended && !h.middle.extended && !h.ring.extended && !h.pinky.extended && h.thumb.spread > 0.4 },
]

export const SUPPORTED = LETTERS.map(l => l.letter).sort()

// Returns { letter, why, fingers } or { letter: null, why, fingers }
export function fingerspell(landmarks) {
  const h = readHand(landmarks)
  const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'].map(f => `${f} ${h[f].extended ? 'out' : 'curled'}`)
  for (const l of LETTERS) if (l.test(h)) return { letter: l.letter, why: l.why, fingers }
  return { letter: null, why: 'finger pattern does not match a supported letter', fingers }
}
