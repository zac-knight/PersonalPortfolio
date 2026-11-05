import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { Button, Eyebrow, Expandable, LiveMeta, Painted, Reveal, Window } from './ui'
import roles from '../data/roles'
import { SplitText } from './fx'
import { useInViewOnce } from '../lib/motion'

const CHANNELS = [
  { key: 'email', value: 'zknight03@outlook.com', href: 'mailto:zknight03@outlook.com' },
  { key: 'linkedin', value: 'in/zac-knight', href: 'https://www.linkedin.com/in/zac-knight/' },
  { key: 'github', value: 'zac-knight', href: 'https://github.com/zac-knight' },
  { key: 'location', value: 'Brisbane, QLD, Australia' },
]

export default function Contact() {
  const [termRef, typing] = useInViewOnce(0.4)
  return (
    <section id="contact" className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
      <Reveal className="flex flex-col justify-center gap-7 sm:gap-8 lg:gap-5 short:gap-4 px-6 sm:px-12 lg:px-20 xl:px-28 py-16 sm:py-24 lg:py-14 short:py-10">
        <div>
          <Eyebrow tag="06">Contact</Eyebrow>
        </div>
        <h2 className="font-serif text-ink text-4xl sm:text-6xl lg:text-[54px] short:text-5xl leading-[1.05] tracking-tight max-w-xl">
          <SplitText text="Let's build something" stagger={70} />{' '}
          <SplitText delay={300} className="italic text-flame" text="together." />
        </h2>
        <p className="text-body text-lg lg:text-base leading-relaxed max-w-lg">
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
          <div className="flex flex-col gap-5 lg:gap-3.5 pt-2 lg:pt-0 max-w-xl">
            {roles.map(({ group, dot, titles }) => (
              <div key={group}>
                <p className="flex items-center gap-2 mb-3 lg:mb-2 text-[12px] uppercase tracking-wide text-mute">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {group}
                </p>
                <ul className="flex flex-wrap gap-2 lg:gap-1.5">
                  {titles.map(title => (
                    <li
                      key={title}
                      className="chip px-2.5 py-1.5 lg:px-2 lg:py-1 rounded-md border border-line bg-panel-2/50 text-[13px] lg:text-[12px] text-ink/90"
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
        <Painted variant="meadow" className="h-full flex items-center px-4 sm:px-12 lg:px-14 xl:px-20 py-10 sm:py-16 lg:py-10">
          <div className="w-full">
          <Window title="~/contact · zsh" className="w-full">
            <div ref={termRef} className={`font-mono text-[12.5px] sm:text-[14px] leading-[2.1] short:leading-[1.9] px-5 sm:px-7 py-6 short:py-5 ${typing ? 'typing' : ''}`}>
              <p className="type-line" style={{ '--i': 0 }}>
                <span className="text-live">zac@brisbane</span>
                <span className="text-mute"> ~ </span>
                <span className="text-ink">$ contact</span>
              </p>
              {CHANNELS.map((c, i) => (
                <p key={c.key} className="type-line flex gap-3" style={{ '--i': i + 1 }}>
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
              <p className="type-line text-live" style={{ '--i': CHANNELS.length + 1 }}>✓ open to new opportunities</p>
              <p className="type-line" style={{ '--i': CHANNELS.length + 2 }}>
                <span className="text-live">zac@brisbane</span>
                <span className="text-mute"> ~ </span>
                <span className="text-ink">$ </span>
                <span className="caret text-ink">▍</span>
              </p>
            </div>
          </Window>
          </div>
        </Painted>
      </Reveal>
    </section>
  )
}
