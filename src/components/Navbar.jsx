import { useEffect, useState } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { HiMenuAlt4, HiX } from 'react-icons/hi'
import { Button } from './ui'

const LINKS = ['About', 'Experience', 'Education', 'Skills', 'Projects', 'Contact']

export function Logo() {
  return (
    <a href="#hero" className="flex items-center gap-2.5 text-ink">
      <span className="w-8 h-8 rounded-md bg-cream text-canvas flex items-center justify-center font-serif text-[15px] leading-none pt-0.5">
        ZK
      </span>
      <span className="text-[17px] tracking-tight">zacknight.dev</span>
    </a>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  // Full-screen menu: lock page scroll, close on Escape or when the desktop nav takes over
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = e => e.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth >= 1280 && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(null)

  // Highlight the last section whose top has passed the middle of the viewport
  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight / 2
      let current = null
      for (const link of LINKS) {
        const el = document.getElementById(link.toLowerCase())
        if (el && el.getBoundingClientRect().top <= mid) current = el.id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 dots-b transition-colors duration-300 ${
        open ? 'bg-canvas' : scrolled ? 'bg-canvas/85 backdrop-blur-md' : 'bg-canvas'
      }`}
    >
      <div className="flex items-center h-16 sm:h-[72px] px-6 sm:px-12 lg:px-20 xl:px-28">
        <Logo />

        <nav className="hidden xl:flex items-center gap-7 2xl:gap-9 ml-14 2xl:ml-24 text-[15px] text-body">
          {LINKS.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className={`relative py-1 transition-colors duration-300 hover:text-ink ${
                active === link.toLowerCase() ? 'text-ink' : ''
              }`}
            >
              {link}
              <span
                className={`absolute left-0 -bottom-0.5 h-px w-full bg-cream origin-left transition-transform duration-500 ease-out ${
                  active === link.toLowerCase() ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-6">
          <a
            href="https://github.com/zac-knight"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden sm:flex items-center gap-2 text-body hover:text-ink transition-colors"
          >
            <FaGithub size={19} />
          </a>
          <a
            href="https://www.linkedin.com/in/zac-knight/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hidden sm:flex items-center gap-2 text-body hover:text-ink transition-colors"
          >
            <FaLinkedin size={19} />
          </a>
          <span className="hidden sm:inline-flex">
            <Button href="mailto:zknight03@outlook.com">Get in touch</Button>
          </span>
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="xl:hidden w-10 h-10 rounded-md border border-line flex items-center justify-center text-ink"
          >
            {open ? <HiX size={18} /> : <HiMenuAlt4 size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Menu"
          className="drop-in xl:hidden fixed inset-x-0 bottom-0 top-16 sm:top-[72px] z-40 bg-canvas flex flex-col px-6 sm:px-12 pt-8 pb-8 overflow-y-auto"
        >
          <ul className="flex flex-col">
            {LINKS.map((link, i) => (
              <li key={link} className="rise border-b border-line" style={{ '--d': `${60 + i * 50}ms` }}>
                <a
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 py-4 sm:py-5"
                >
                  <span className="font-mono text-[12px] text-mute w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span
                    className={`font-serif text-4xl sm:text-5xl transition-colors ${
                      active === link.toLowerCase() ? 'text-ink' : 'text-ink/70 group-hover:text-ink'
                    }`}
                  >
                    {link}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="rise mt-auto pt-10 flex flex-col gap-6" style={{ '--d': '420ms' }}>
            <Button href="mailto:zknight03@outlook.com" className="w-full sm:w-fit" onClick={() => setOpen(false)}>
              Get in touch
            </Button>
            <div className="flex items-center justify-between text-body">
              <div className="flex gap-6">
                <a href="https://github.com/zac-knight" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ink">
                  <FaGithub size={17} /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/zac-knight/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ink">
                  <FaLinkedin size={17} /> LinkedIn
                </a>
              </div>
              <span className="font-mono text-[12px] text-mute">Brisbane, AU</span>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
