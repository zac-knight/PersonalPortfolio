import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { Button, Eyebrow, Expandable, LiveMeta, Painted, Reveal, Window } from './ui'
import roles from '../data/roles'

const CHANNELS = [
  { key: 'email', value: 'zknight03@outlook.com', href: 'mailto:zknight03@outlook.com' },
  { key: 'linkedin', value: 'in/zac-knight', href: 'https://www.linkedin.com/in/zac-knight/' },
  { key: 'github', value: 'zac-knight', href: 'https://github.com/zac-knight' },
  { key: 'location', value: 'Brisbane, QLD, Australia' },
]

export default function Contact() {
  return (
    <section id="contact" className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
      <Reveal className="flex flex-col justify-center gap-7 sm:gap-8 px-6 sm:px-12 lg:px-20 xl:px-28 py-16 sm:py-24">
        <div>
          <Eyebrow tag="06">Contact</Eyebrow>
        </div>
        <h2 className="font-serif text-ink text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-xl">
          Let&apos;s build something together.
        </h2>
        <p className="text-body text-lg leading-relaxed max-w-lg">
          Whether you have a role, a project in mind, a question, or just want to connect,
          my inbox is always open.
        </p>
        <LiveMeta label="Open">to AI, data, software &amp; systems roles</LiveMeta>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button href="mailto:zknight03@outlook.com">
            <MdEmail size={15} /> Say hello
          </Button>
          <Button href="https://www.linkedin.com/in/zac-knight/" target="_blank" rel="noopener noreferrer" variant="ghost">
            <FaLinkedin size={14} /> LinkedIn
          </Button>
          <Button href="https://github.com/zac-knight" target="_blank" rel="noopener noreferrer" variant="ghost">
            <FaGithub size={14} /> GitHub
          </Button>
        </div>
        <Expandable collapsed={170} more="Show all roles" less="Show fewer roles">
          <div className="flex flex-col gap-5 pt-2 max-w-xl">
            {roles.map(({ group, dot, titles }) => (
              <div key={group}>
                <p className="flex items-center gap-2 mb-3 text-[12px] uppercase tracking-wide text-mute">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {group}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {titles.map(title => (
                    <li
                      key={title}
                      className="px-2.5 py-1.5 rounded-md border border-line bg-panel-2/50 text-[13px] text-ink/90"
                    >
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Expandable>
      </Reveal>

      <Reveal delay={120} className="lg:border-l border-line">
        <Painted variant="meadow" className="h-full flex items-center px-4 sm:px-12 lg:px-20 xl:px-28 py-10 sm:py-16">
          <Window title="~/contact · zsh" className="w-full">
            <div className="font-mono text-[12.5px] sm:text-[14px] leading-[2.1] px-5 sm:px-7 py-6">
              <p>
                <span className="text-live">zac@brisbane</span>
                <span className="text-mute"> ~ </span>
                <span className="text-ink">$ contact</span>
              </p>
              {CHANNELS.map(c => (
                <p key={c.key} className="flex gap-3">
                  <span className="text-mute w-20 shrink-0">{c.key}</span>
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="text-flame hover:underline underline-offset-4 truncate"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className="text-ink/90">{c.value}</span>
                  )}
                </p>
              ))}
              <p className="text-live">✓ open to new opportunities</p>
              <p>
                <span className="text-live">zac@brisbane</span>
                <span className="text-mute"> ~ </span>
                <span className="text-ink">$ </span>
                <span className="caret text-ink">▍</span>
              </p>
            </div>
          </Window>
        </Painted>
      </Reveal>
    </section>
  )
}
