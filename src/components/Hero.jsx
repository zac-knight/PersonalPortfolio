import { useMemo } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { Button, Eyebrow, Painted, PixelArt, StatRow, Window } from './ui'
import { monogram } from '../lib/pixels'

const STATS = [
  { label: 'GPA', value: '6.6/7' },
  { label: 'Society members', value: '300+' },
  { label: 'User stories', value: '110+' },
  { label: 'Hackathon hackers', value: '115+' },
]

const TICKER = [
  { live: true, name: 'qut-aiml-society', id: '#300+', tag: 'members', by: 'Founding President', when: 'now' },
  { name: 'aiml-hackathon', id: '#115', tag: 'participants', by: '20 teams', when: '2025', tone: 'gold' },
  { name: 'qps-resource-hub', id: '#110', tag: 'stories shipped', by: 'QPS intern', when: '2024' },
  { name: 'bands-x-aiml', id: '#30+', tag: 'industry orgs', by: '110 students', when: '2025', tone: 'gold' },
  { name: 'better-timetable', id: '#30+', tag: 'students', by: 'Code Network', when: '2025' },
  { name: 'master-of-ai', id: '@QUT', tag: 'in progress', by: 'Zac K.', when: '2027', tone: 'gold' },
]

function Ticker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="dots-b overflow-hidden py-5 text-[15px] sm:text-[17px] whitespace-nowrap">
      <div className="marquee inline-flex">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-5 border-r border-line">
            {t.live && <span className="text-live">● LIVE</span>}
            <span className="text-flame">{t.name}</span>
            <span className="text-mute">{t.id}</span>
            <span className={t.tone === 'gold' ? 'text-gold' : 'text-live'}>● {t.tag}</span>
            <span className="text-ink">by {t.by}</span>
            <span className="text-mute">· {t.when}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  const art = useMemo(() => monogram(), [])

  return (
    <section id="hero">
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr]">
        {/* Copy */}
        <div className="flex flex-col justify-center gap-7 sm:gap-8 px-6 sm:px-12 lg:px-20 xl:px-28 pt-14 sm:pt-24 pb-12 lg:pb-20">
          <div>
            <Eyebrow tag="Now">Master of AI @ QUT — open to SWE &amp; ML roles</Eyebrow>
          </div>
          <h1 className="font-serif text-ink text-[42px] sm:text-6xl xl:text-[68px] leading-[1.05] tracking-tight max-w-3xl">
            Software &amp; machine learning engineer building systems that learn.
          </h1>
          <p className="text-body text-base sm:text-lg leading-relaxed max-w-2xl">
            I&apos;m Zac — a Computer Science graduate studying a Master of Artificial Intelligence
            in Brisbane. Founder of the QUT AI &amp; ML Society, former developer intern at the
            Queensland Police Service, and always shipping something new.
          </p>
          <p className="font-mono text-sm text-mute h-5">
            <span className="text-live">$</span>{' '}
            <TypeAnimation
              sequence={[
                'whoami → Hi, my name is Zac',
                2500,
                'echo $PASSION → machine learning',
                2500,
                'ls ./work → intelligent systems',
                2500,
                'cat goals.txt → meaningful software',
                2500,
              ]}
              wrapper="span"
              speed={55}
              repeat={Infinity}
              cursor={false}
              className="text-body"
            />
            <span className="caret text-ink">▍</span>
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Button href="#projects">View projects</Button>
            <Button href="#contact" variant="ghost">Get in touch</Button>
          </div>
        </div>

        {/* Monogram */}
        <div className="relative flex items-center justify-center px-10 py-10 lg:py-16 lg:border-l border-line">
          <PixelArt
            {...art}
            tones={['#8f8a83', '#55514b']}
            className="w-full max-w-[420px]"
            label="Pixel-art ZK monogram"
          />
        </div>
      </div>

      {/* Stats + portrait */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] border-t border-line">
        <StatRow stats={STATS} className="self-end" />
        <Painted variant="dusk" className="lg:border-l border-line min-h-[220px] flex items-end justify-center px-8 pt-8">
          <Window title="zac.png" className="w-full max-w-[340px] rounded-b-none border-b-0">
            <img
              src={`${import.meta.env.BASE_URL}profile.png`}
              alt="Portrait of Zac Knight"
              className="w-full h-40 object-cover object-[50%_35%] grayscale contrast-110"
            />
          </Window>
        </Painted>
      </div>

      <Ticker />
    </section>
  )
}
