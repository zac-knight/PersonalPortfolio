import { useEffect, useRef, useState } from 'react'

const experiences = [
  {
    title: 'Founding President',
    company: 'QUT AI & ML Society',
    dates: 'May 2025 – Present',
    type: 'Volunteer',
    points: [
      "Founded and served as the first President, establishing the society's vision, governance, and operations to drive student engagement in AI and machine learning",
      'Grew the club to 300+ active members, achieving the highest engagement among QUT technology societies and earning feature placement on the QUT front page',
      'Directed and hosted the AIML Hackathon as Master of Ceremonies and lead organiser, delivering the largest standalone club hackathon in QUT history (115+ participants, 20 teams)',
      'Led the BANDS x AIML Industry Night as co-MC and organiser, connecting 110 students with 30+ industry organisations',
      'Launched the AIML Projects division, supporting structured, team-based machine learning initiatives',
      'Scaled digital presence to 740+ Instagram and 680+ LinkedIn followers within one year',
    ],
  },
  {
    title: 'Engineering Work Integrated Learning Placement',
    company: 'QUT Engineering Team',
    dates: 'Jul 2025 – Dec 2025',
    type: 'Work',
    points: [
      'Supported the effective operation and supervision of engineering laboratory spaces, including the Launchpad Makerspace',
      'Provided hands-on technical guidance and debugging assistance for laser cutter software and digital fabrication workflows',
      'Assisted students by explaining the purpose, capabilities, and limitations of available tools and equipment',
      'Delivered guided site tours of the Launchpad Makerspace, introducing facilities, equipment, and usage protocols',
    ],
  },
  {
    title: 'Vice President',
    company: 'Code Network',
    dates: 'Mar 2025 – May 2025',
    type: 'Volunteer',
    points: [
      'Led cross-functional initiatives coordinating efforts across Marketing, Events, and Industry Engagement departments',
      'Collaborated with the Marketing Team to design and launch 10+ digital and print graphics',
      'Developed a structured 12-month event calendar, achieving consistent attendance of 30-40 members throughout the semester',
      'Chaired 10 club events including guest speaker functions and member networking nights',
    ],
  },
  {
    title: 'Projects Officer',
    company: 'Code Network',
    dates: 'Oct 2024 – Mar 2025',
    type: 'Volunteer',
    points: [
      'Led the BetterTimetable project at QUT, enhancing the student experience through a more intuitive timetable-building platform',
      'Delivered automatic timetable generation, custom planning, and personalised schedule saving, attracting 30+ students to the project',
      "Built server-side operations to convert QUT's public course data into a structured internal API enabling real-time timetable generation",
    ],
  },
  {
    title: 'Software Developer Intern',
    company: 'Queensland Police Service',
    dates: 'Apr 2024 – Oct 2024',
    type: 'Work',
    points: [
      'Collaborated in a multi-skilled Agile team to design and develop a large-scale web application using Next.js, TypeScript, and SQL for Specialist Investigators Training',
      'Planned and delivered 110 user stories across a 6-month timeline using 6 Release Plans and 12 Sprint Plans',
      'Delivered a communication platform, library system, and a revamped learning management system with role-based access',
      'Led user training with comprehensive guides, a 56-minute demo, and fortnightly client showcases',
    ],
  },
  {
    title: 'Sales Co-worker',
    company: 'IKEA',
    dates: 'Feb 2022 – Present',
    type: 'Work',
    points: [
      'Increased sales by actively engaging with customers on the showroom floor and offering tailored solutions',
      "Utilised IKEA's sales and inventory tools daily to check stock, locate items, and ensure quick responses to customer inquiries",
      'Provided hands-on support in maintaining appealing, organised displays aligned with visual merchandising guidelines',
      'Assisted customers with self-serve technology, online ordering, and delivery options',
    ],
  },
]

const parseStartDate = (dates) => new Date(dates.split('–')[0].trim())
const getYear = (dates) => {
  if (dates.includes('Present')) return 'NOW'
  const match = dates.split('–')[0].trim().match(/\d{4}/)
  return match ? match[0] : ''
}
const sorted = [...experiences].sort((a, b) => {
  const diff = parseStartDate(b.dates) - parseStartDate(a.dates)
  if (diff !== 0) return diff
  return ({ Volunteer: 1, Work: 2 })[a.type] - ({ Volunteer: 1, Work: 2 })[b.type]
})

export default function Experience() {
  const scrollRef = useRef(null)
  const innerRef = useRef(null)
  const dotRefs = useRef([])
  const [fillPx, setFillPx] = useState(0)
  const [revealedDots, setRevealedDots] = useState(new Array(sorted.length).fill(false))
  const [orbTop, setOrbTop] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

useEffect(() => {
  const el = scrollRef.current
  if (!el) return

  const onScroll = () => {
    const scrollTop = el.scrollTop
    const slotH = el.clientHeight
    const expScrollTop = Math.max(0, scrollTop - slotH)
    const totalExpHeight = sorted.length * slotH
    const filled = Math.min(totalExpHeight, expScrollTop + slotH * 0.5)
    setFillPx(filled)
    setOrbTop(filled)
    const newRevealed = sorted.map((_, i) => {
      const dotPos = (i + 0.5) * slotH
      return filled >= dotPos
    })
    setRevealedDots(newRevealed)
  }

  // NEW: bubble scroll out of the section when at the bottom
  const onWheel = (e) => {
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    const atTop = el.scrollTop <= 2
    if ((atBottom && e.deltaY > 0) || (atTop && e.deltaY < 0)) {
      const outer = document.getElementById('scroll-container')
      if (outer) outer.scrollBy({ top: e.deltaY > 0 ? window.innerHeight : -window.innerHeight, behavior: 'smooth' })
    }
  }

  // NEW: bubble touch swipe out of the section when at the bottom
  let touchStartY = 0
  const onTouchStart = (e) => { touchStartY = e.touches[0].clientY }
  const onTouchEnd = (e) => {
    const delta = touchStartY - e.changedTouches[0].clientY
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    const atTop = el.scrollTop <= 2
    if ((atBottom && delta > 30) || (atTop && delta < -30)) {
      const outer = document.getElementById('scroll-container')
      if (outer) outer.scrollBy({ top: delta > 0 ? window.innerHeight : -window.innerHeight, behavior: 'smooth' })
    }
  }

  el.addEventListener('scroll', onScroll, { passive: true })
  el.addEventListener('wheel', onWheel, { passive: true })
  el.addEventListener('touchstart', onTouchStart, { passive: true })
  el.addEventListener('touchend', onTouchEnd, { passive: true })

  onScroll()

  return () => {
    el.removeEventListener('scroll', onScroll)
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchend', onTouchEnd)
  }
}, [])

  // LINE: on mobile sits at x=24px from left; on desktop sits at 50%
  const lineLeft = isMobile ? '24px' : '50%'
  const lineTransform = isMobile ? 'none' : 'translateX(-1px)'

  return (
    <section
      id="experience"
      className="snap-start"
      style={{ height: '100vh', width: '100%', background: '#0a0a0a' }}
    >
      <div
        ref={scrollRef}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
        }}
      >
        {/* Title slot */}
        <div
          style={{
            height: '100vh',
            scrollSnapAlign: 'start',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p className="text-slate-400 tracking-[0.3em] text-sm uppercase">
            E X P E R I E N C E
          </p>
        </div>

        {/* Experience slots */}
        <div ref={innerRef} style={{ position: 'relative' }}>

          {/* Track */}
          <div style={{
            position: 'absolute',
            left: lineLeft,
            transform: lineTransform,
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'rgba(56,189,248,0.07)',
            zIndex: 0,
          }} />

          {/* Fill */}
          <div style={{
            position: 'absolute',
            left: lineLeft,
            transform: lineTransform,
            top: 0,
            width: '2px',
            height: `${fillPx}px`,
            background: 'linear-gradient(to bottom, #0ea5e9, #38bdf8)',
            boxShadow: '0 0 8px 3px rgba(56,189,248,0.45)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />

          {/* Orb */}
          <div style={{
            position: 'absolute',
            left: lineLeft,
            transform: isMobile ? 'translateX(-7px)' : 'translateX(-50%)',
            top: `${orbTop - 8}px`,
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#7dd3fc',
            boxShadow: '0 0 22px 9px rgba(56,189,248,0.65)',
            zIndex: 3,
            opacity: fillPx > 8 ? 1 : 0,
            pointerEvents: 'none',
          }} />

          {sorted.map((exp, index) => {
            const isLeft = index % 2 === 0
            const year = getYear(exp.dates)
            const dotRevealed = revealedDots[index]

            const dot = (
              <div
                ref={(el) => { dotRefs.current[index] = el }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#38bdf8',
                  boxShadow: '0 0 12px 5px rgba(56,189,248,0.65)',
                  opacity: dotRevealed ? 1 : 0,
                  transform: dotRevealed ? 'scale(1)' : 'scale(0.1)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                  flexShrink: 0,
                }}
              />
            )

            const textContent = (isLeftSide) => (
              <div className={isLeftSide ? 'text-right pr-10' : 'text-left pl-10'}>
                <span className="text-xs tracking-widest uppercase font-semibold text-sky-400">
                  {exp.type}
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1 leading-snug">
                  {exp.title}
                </h3>
                <p className="font-semibold text-sm mt-1 text-sky-400">
                  {exp.company}
                </p>
                <p className="text-slate-500 text-xs tracking-widest uppercase mt-1">
                  {exp.dates}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {exp.points.map((point, i) => (
                    <li key={i} className={`text-slate-400 text-sm leading-relaxed ${isLeftSide ? 'text-right' : 'text-left'}`}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )

            const yearLabel = (
              <span style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'rgba(148,163,184,0.15)',
                lineHeight: 1,
              }}>
                {year}
              </span>
            )

            if (isMobile) {
              return (
                <div
                  key={index}
                  style={{
                    height: '100vh',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '52px',
                    paddingRight: '20px',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {/* Dot pinned to line */}
                  <div style={{
                    position: 'absolute',
                    left: '18px',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {dot}
                  </div>
                  {/* All content to the right */}
                  <div className="text-left w-full">
                    <span className="text-xs tracking-widest uppercase font-semibold text-sky-400">
                      {exp.type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-1 leading-snug">
                      {exp.title}
                    </h3>
                    <p className="font-semibold text-sm mt-1 text-sky-400">
                      {exp.company}
                    </p>
                    <p className="text-slate-500 text-xs tracking-widest uppercase mt-1">
                      {exp.dates}
                    </p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {exp.points.map((point, i) => (
                        <li key={i} className="text-slate-400 text-[13px] leading-relaxed text-left">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            }

            // Desktop layout (unchanged)
            return (
              <div
                key={index}
                style={{
                  height: '100vh',
                  scrollSnapAlign: 'start',
                  display: 'grid',
                  gridTemplateColumns: '1fr 60px 1fr',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {isLeft
                    ? textContent(true)
                    : <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingRight: '8px' }}>{yearLabel}</div>
                  }
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 5 }}>
                  {dot}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  {!isLeft
                    ? textContent(false)
                    : <div style={{ paddingLeft: '8px' }}>{yearLabel}</div>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}