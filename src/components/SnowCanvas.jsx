import { useEffect, useRef } from 'react'

export default function SnowCanvas({ density = 160000, speed = 10 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function makeParticle() {
      const size = Math.random() * 1.8 + 0.4
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        opacity: Math.random() * 0.35 + 0.05,
        speedY: (Math.random() * 0.4 + 0.1) * (speed / 3),
        speedX: (Math.random() - 0.5) * 0.3,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.008 + 0.002,
        wobbleAmp: Math.random() * 0.4 + 0.1,
      }
    }

    function init() {
      resize()
      particles = Array.from({ length: density }, makeParticle)
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.wobble += p.wobbleSpeed
        p.x += p.speedX + Math.sin(p.wobble) * p.wobbleAmp
        p.y += p.speedY
        if (p.y > canvas.height + 4) { p.y = -4; p.x = Math.random() * canvas.width }
        if (p.x > canvas.width + 4) p.x = -4
        if (p.x < -4) p.x = canvas.width + 4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(56,189,248,${p.opacity})`
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', init)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', init)
    }
  }, [density, speed])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}