import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { HiX } from 'react-icons/hi'

// Full-screen image viewer. `images` is [{ src, alt, caption? }]; `index` is the
// open image and `onIndex` moves between them. Esc closes, ←/→ and swipes browse.
// Rendered into <body> so transformed ancestors can't offset or clip it.
export default function Lightbox({ images, index, onIndex, onClose }) {
  const closeRef = useRef(null)
  const touch = useRef(null)
  const many = images.length > 1
  const go = dir => onIndex((index + dir + images.length) % images.length)

  useEffect(() => {
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
    const onKey = e => {
      if (e.key === 'Escape') onClose()
      else if (many && e.key === 'ArrowRight') onIndex(i => (i + 1) % images.length)
      else if (many && e.key === 'ArrowLeft') onIndex(i => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [images.length, many, onClose, onIndex])

  const img = images[index]
  const nav = 'shrink-0 w-11 h-11 rounded-full border border-line bg-panel/80 backdrop-blur flex items-center justify-center text-ink hover:border-flame hover:text-flame transition-colors'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={img.alt}
      className="lightbox fixed inset-0 z-[85] flex flex-col bg-black/92 backdrop-blur-sm"
      // A click anywhere except the image or a control closes the viewer
      onClick={e => !e.target.closest('img, button') && onClose()}
      onTouchStart={e => { touch.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touch.current === null || !many) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        touch.current = null
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 shrink-0">
        <span className="font-mono text-[12px] text-body tabular-nums">
          {many ? `${String(index + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}` : ''}
        </span>
        <button ref={closeRef} onClick={onClose} aria-label="Close image" className={nav}>
          <HiX size={18} />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center gap-2 sm:gap-4 px-2 sm:px-6">
        {many && (
          <button onClick={() => go(-1)} aria-label="Previous image" className={`${nav} hidden sm:flex`}>
            <FaChevronLeft size={14} />
          </button>
        )}
        <div className="flex-1 min-w-0 h-full flex items-center justify-center">
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className="lightbox-img max-w-full max-h-full object-contain rounded-md shadow-2xl shadow-black/60"
          />
        </div>
        {many && (
          <button onClick={() => go(1)} aria-label="Next image" className={`${nav} hidden sm:flex`}>
            <FaChevronRight size={14} />
          </button>
        )}
      </div>

      <div className="shrink-0 flex items-center justify-center gap-4 px-4 py-4 min-h-[64px]">
        {many && (
          <button onClick={() => go(-1)} aria-label="Previous image" className={`${nav} sm:hidden`}>
            <FaChevronLeft size={14} />
          </button>
        )}
        {img.caption && <p className="text-center text-[13px] sm:text-sm text-body max-w-2xl">{img.caption}</p>}
        {many && (
          <button onClick={() => go(1)} aria-label="Next image" className={`${nav} sm:hidden`}>
            <FaChevronRight size={14} />
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}
