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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 dots-b transition-colors duration-300 ${
        scrolled || open ? 'bg-canvas/85 backdrop-blur-md' : 'bg-canvas'
      }`}
    >
      <div className="flex items-center h-16 sm:h-[72px] px-6 sm:px-12 lg:px-20 xl:px-28">
        <Logo />

        <nav className="hidden lg:flex items-center gap-9 ml-24 text-[15px] text-body">
          {LINKS.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-ink transition-colors">
              {link}
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
          <Button href="mailto:zknight03@outlook.com" className="hidden sm:inline-flex">
            Get in touch
          </Button>
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="lg:hidden w-10 h-10 rounded-md border border-line flex items-center justify-center text-ink"
          >
            {open ? <HiX size={18} /> : <HiMenuAlt4 size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-line px-5 py-4 flex flex-col">
          {LINKS.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="py-3 text-ink text-lg border-b border-line/60 last:border-0"
            >
              {link}
            </a>
          ))}
          <Button href="mailto:zknight03@outlook.com" className="mt-4 sm:hidden">
            Get in touch
          </Button>
        </nav>
      )}
    </header>
  )
}
