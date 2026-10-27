import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { Logo } from './Navbar'

const SECTIONS = ['About', 'Experience', 'Education', 'Skills', 'Projects', 'Contact']

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/zac-knight/', Icon: FaLinkedin },
  { label: 'GitHub', href: 'https://github.com/zac-knight', Icon: FaGithub },
  { label: 'Email', href: 'mailto:zknight03@outlook.com', Icon: MdEmail },
]

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 px-6 sm:px-12 lg:px-20 xl:px-28 py-12">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-body max-w-xs leading-relaxed">
            Master of AI student and Computer Science graduate in Brisbane, Australia, building toward a career in AI and software.
          </p>
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-wide text-mute mb-4">Sections</p>
          <ul className="grid grid-cols-2 gap-y-2.5">
            {SECTIONS.map(s => (
              <li key={s}>
                <a href={`#${s.toLowerCase()}`} className="text-body hover:text-ink transition-colors">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-wide text-mute mb-4">Elsewhere</p>
          <ul className="flex flex-col gap-2.5">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-body hover:text-ink transition-colors"
                >
                  <Icon size={14} /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between gap-2 px-6 sm:px-12 lg:px-20 xl:px-28 py-5 border-t border-line text-[13px] text-mute">
        <p>&copy; {new Date().getFullYear()} Zac Knight · Brisbane, Queensland, Australia</p>
        <p className="font-mono">built with react + tailwind</p>
      </div>
    </footer>
  )
}
