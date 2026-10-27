import { useMemo } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { Button, Eyebrow, Painted, PixelArt, Window } from './ui'
import { monogram } from '../lib/pixels'

const CREDENTIALS = [
  {
    label: 'QUT Industry Project · CRDC',
    title: 'Leading a six person team optimising a production RAG system',
    href: '#projects',
  },
  {
    label: 'Postgraduate · QUT',
    title: 'Master of Artificial Intelligence',
    href: '#education',
  },
  {
    label: 'QUT Guild Awards',
    title: 'President of the Year',
    href: '#about',
  },
  {
    label: 'Australian Business Journal · 2026',
    title: 'Top 10 Australian AI Innovators',
    href: '#about',
  },
]

export default function Hero() {
  const art = useMemo(() => monogram(), [])

  return (
    <section id="hero">
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr]">
        {/* Copy */}
        <div className="flex flex-col justify-center gap-7 sm:gap-8 px-6 sm:px-12 lg:px-20 xl:px-28 pt-10 sm:pt-24 pb-10 lg:pb-20">
          <div className="rise" style={{ '--d': '0ms' }}>
            <Eyebrow tag="Now">Master of AI @ QUT · open to AI, data &amp; software roles</Eyebrow>
          </div>
          <h1 style={{ '--d': '120ms' }} className="rise font-serif text-ink text-[42px] sm:text-6xl xl:text-[68px] leading-[1.05] tracking-tight max-w-3xl">
            AI student and builder, learning to make systems that learn.
          </h1>
          <p style={{ '--d': '240ms' }} className="rise text-body text-base sm:text-lg leading-relaxed max-w-2xl">
            I&apos;m Zac, a Computer Science graduate and Master of Artificial Intelligence
            postgrad in Brisbane. Founding President of the QUT AI &amp; ML Society, leading a RAG
            industry project with CRDC, and always shipping something new.
          </p>
          <p style={{ '--d': '360ms' }} className="rise font-mono text-sm text-mute h-5">
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
          <div style={{ '--d': '460ms' }} className="rise flex flex-wrap gap-3 sm:gap-4">
            <Button href="#projects">View projects</Button>
            <Button href="#contact" variant="ghost">Get in touch</Button>
          </div>
        </div>

        {/* Monogram */}
        <div className="relative hidden lg:flex items-center justify-center px-10 py-16 border-l border-line">
          <PixelArt
            {...art}
            tones={['#8f8a83', '#55514b']}
            className="w-full max-w-[420px]"
            label="Pixel art ZK monogram"
          />
        </div>
      </div>

      {/* Stats + portrait */}
      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 pb-10 sm:pb-14">
      <div style={{ '--d': '600ms' }} className="rise grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] rounded-lg border border-line overflow-hidden">
        <ul className="grid grid-cols-1 sm:grid-cols-2">
          {CREDENTIALS.map((c, i) => (
            <li
              key={c.title}
              className={`border-line ${i > 0 ? 'border-t' : ''} ${i === 1 ? 'sm:border-t-0' : ''} ${
                i % 2 === 1 ? 'sm:border-l' : ''
              }`}
            >
              <a
                href={c.href}
                className="group h-full flex flex-col justify-between gap-6 px-6 sm:px-8 py-6 sm:py-8 hover:bg-panel/60 transition-colors duration-300"
              >
                <span className="text-[11px] sm:text-xs uppercase tracking-wide text-mute">{c.label}</span>
                <span className="font-serif text-2xl sm:text-[28px] leading-snug text-ink transition-transform duration-500 ease-out group-hover:translate-x-1">{c.title}</span>
              </a>
            </li>
          ))}
        </ul>
        <Painted variant="dusk" className="border-t lg:border-t-0 lg:border-l border-line flex items-end justify-center px-8 pt-8 zoom-group">
          <Window title="industry_night.jpg" className="w-full max-w-[420px] rounded-b-none border-b-0">
            <img
              src={`${import.meta.env.BASE_URL}community/industry-night.jpg`}
              alt="Zac speaking at the podium at the AIML × BANDS Industry Night"
              className="w-full aspect-[3/2] object-cover"
            />
          </Window>
        </Painted>
      </div>
      </div>

    </section>
  )
}
