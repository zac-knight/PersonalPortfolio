import { FaArrowRight } from 'react-icons/fa'
import { Painted, Reveal, Window } from './ui'

const base = import.meta.env.BASE_URL

const CHAPTERS = [
  {
    badge: 'AIML',
    label: '01 / Currently',
    name: 'QUT AI & Machine Learning Society',
    role: 'Founding President',
    where: 'Queensland University of Technology · May 2025 – present',
    body: [
      "The society was set up to give students earlier exposure to artificial intelligence and machine learning. As its founding President, I helped build its vision, governance and operations from the ground up. In less than a year it grew to 300+ members and became one of the largest and most active student clubs on campus. Members get hands-on with AI through weekly project nights, industry workshops, hackathons and networking events.",
      "As lead organiser and MC I ran the AIML Hackathon: 115+ participants across 20 teams, and QUT's biggest standalone student club hackathon to date. With QUT BANDS (the Business Analysis and Data Science Club), we co-hosted an Industry Night with presentations, panels and open networking. It connected 110 students with professionals from organisations including NTI, Microsoft, Suncorp, Deloitte and PwC.",
      "Beyond campus, I contributed to AgentCamp 2026: Brisbane Edition, a full day of building with Microsoft Foundry, MCP, Azure AI and multi-agent systems alongside Brisbane's wider AI community.",
      "I was named President of the Year at the QUT Guild Awards and featured in the Australian Business Journal's 10 Australian AI Innovators Delivering Practical Solutions in 2026, and the society made the QUT front page. The recognition has my name on it, but it belongs just as much to the executive team and the members who kept showing up.",
    ],
    facts: [
      ['Role', 'Founding President'],
      ['Recognition', 'President of the Year · QUT Guild Awards'],
      ['Press', 'QUT front page · ABJ top 10 AI innovators'],
      ['Events', 'Project nights · Workshops · Hackathon · Industry Night'],
    ],
    figures: [
      {
        src: `${base}community/hackathon-presenting.jpg`,
        file: 'aiml-hackathon.jpg',
        alt: 'Zac presenting the hackathon summary on stage at the QUT AI & ML Society hackathon',
        caption: 'Presenting the hackathon summary to a full atrium.',
        variant: 'dusk',
      },
      {
        src: `${base}community/hackathon-audience.jpg`,
        file: 'hackathon-crowd.jpg',
        alt: 'Students filling the tiered seating at the QUT AI & ML Society hackathon',
        caption: '115+ hackers, 20 teams, one weekend.',
        variant: 'meadow',
      },
    ],
    features: [
      {
        href: 'https://www.qut.edu.au/about/faculty-of-science/insights/club-spotlight-ai-and-ml-society',
        label: 'QUT front page · 12 March 2026',
        title: 'Club spotlight: AI & ML Society',
        body: 'QUT Science, IT and Maths talks with founding president Zac Knight about the society, its project nights and its growing community.',
        cta: 'Read the QUT story',
      },
      {
        href: 'https://lnkd.in/gEdUy5Pi',
        label: 'Australian Business Journal · 2026',
        title: '10 Australian AI Innovators Delivering Practical Solutions',
        body: "Zac was named among 10 Australian AI innovators for the society's work giving students hands-on AI and machine learning experience earlier in their studies.",
        cta: 'Read the article',
      },
    ],
  },
  {
    badge: 'CRDC',
    label: '02 / Industry project',
    name: 'Cotton Research and Development Corporation',
    role: 'Work Integrated Learning Student · Team Leader',
    where: 'QUT Industry Project · Aug 2026 – present',
    body: [
      "Through a QUT Industry Project, I lead Team 16: six students across AI, Data Science and Cyber Security streams. We're extending CRDC's Cotton Knowledge Hub, a citation-grounded RAG assistant over 1,995 cotton research reports from 1986 to 2025.",
      'We audited the production retrieval pipeline end to end and traced about 86% of the tokens read per question to a single reranking step. Our target architecture cuts model calls from about 42 to 3–4 per question, at an estimated 95% lower cost. Implementation is planned for Semester 1, 2027.',
    ],
    facts: [
      ['Program', 'QUT Industry Project · WIL'],
      ['Focus', 'RAG · Retrieval optimisation · Evaluation'],
      ['Team', '6 students · AI, Data Science, Cyber'],
    ],
    figures: [
      {
        src: `${base}projects/crdcHub/Source Viewer.png`,
        file: 'Source Viewer.png',
        alt: 'The Cotton Knowledge Hub answering a question beside the highlighted source PDF',
        caption: 'Every answer links back to the exact paragraph in the source report.',
        variant: 'meadow',
        position: 'object-left-top',
      },
    ],
    features: [
      {
        href: '#projects',
        label: 'Case study',
        title: 'Auditing and re-architecting a production RAG system',
        body: 'Findings, the target pipeline and the cost model, in the Projects section.',
        cta: 'See the project',
      },
    ],
  },
  {
    badge: 'QUT',
    label: '03 / The degrees',
    name: 'Queensland University of Technology',
    role: 'Master of Artificial Intelligence · Bachelor of IT (Computer Science), graduated',
    where: 'Brisbane, Australia · 2022 – present',
    body: [
      'I graduated with a Bachelor of Information Technology majoring in Computer Science, with a minor in Engineering Foundations, and a 6.6 GPA. The degree covered microprocessors and networks, cloud computing, AI and machine learning.',
      "Now I'm a postgrad going deeper into AI with a Master of Artificial Intelligence, holding a 6.5 GPA, due in July 2027. Along the way, a capstone with the Queensland Police Service and an industry project with CRDC put coursework in front of real users.",
    ],
    facts: [
      ['Master of AI', 'Postgraduate · 6.5 / 7.0 GPA · Due July 2027'],
      ['Bachelor of IT', 'Graduated · 6.6 / 7.0 GPA'],
      ['Bachelor major', 'Computer Science'],
      ['Bachelor minor', 'Engineering Foundations'],
    ],
  },
  {
    badge: 'QPS',
    label: '04 / First production team',
    name: 'Queensland Police Service',
    role: 'Work Integrated Learning Student',
    where: 'Brisbane, Australia · Apr – Oct 2024',
    body: [
      'I joined a multi-skilled agile team building a large web application for Specialist Investigators training, using Next.js, TypeScript and SQL. Over six months we planned and delivered 110 user stories across 6 release plans and 12 sprint plans.',
      'We delivered a communication platform, a library system and a revamped learning management system with role-based access. The work did not stop at code: I led user training with written guides, a 56-minute demo and fortnightly client showcases.',
    ],
    facts: [
      ['Stack', 'Next.js · TypeScript · SQL'],
      ['Delivered', '110 user stories'],
      ['Shipped', 'Forum · Library · LMS'],
    ],
    figures: [
      {
        src: `${base}projects/qpsHub/Dashboard.png`,
        file: 'Dashboard.png',
        alt: 'Dashboard of the QPS Post-Course Resource Hub',
        caption: 'The Post-Course Resource Hub dashboard.',
        variant: 'dusk',
        position: 'object-left-top',
      },
    ],
  },
  {
    badge: 'IKEA',
    label: '05 / The shop floor',
    name: 'IKEA',
    role: 'Sales Co-worker',
    where: 'Feb 2022 – present',
    body: [
      "Alongside every degree and role above, I've worked the IKEA showroom floor. I help customers find tailored solutions, check stock with IKEA's sales and inventory tools, and guide people through self-serve technology, online ordering and delivery.",
      'It keeps me close to the people technology is meant to serve, and it is regular practice at explaining things clearly.',
    ],
    facts: [
      ['Focus', 'Customer service · Visual merchandising'],
      ['Tools', 'Sales & inventory systems'],
    ],
  },
]

function Figure({ src, file, alt, caption, variant, position = 'object-center' }) {
  return (
    <figure>
      <Painted variant={variant} className="px-4 pt-4 rounded-t-lg">
        <Window title={file} className="rounded-b-none border-b-0">
          <img src={src} alt={alt} loading="lazy" className={`w-full aspect-[3/2] object-cover ${position}`} />
        </Window>
      </Painted>
      <figcaption className="px-4 py-3 text-[13px] text-body border border-t-0 border-line rounded-b-lg bg-panel/50">
        {caption}
      </figcaption>
    </figure>
  )
}

function Facts({ facts }) {
  return (
    <dl className="rounded-lg border border-line overflow-hidden">
      {facts.map(([term, value], i) => (
        <div
          key={term}
          className={`grid grid-cols-[130px_1fr] gap-4 px-4 py-3 bg-panel/50 font-mono text-[12px] uppercase tracking-wide ${
            i > 0 ? 'border-t border-line' : ''
          }`}
        >
          <dt className="text-mute">{term}</dt>
          <dd className="text-ink/90">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function FeatureCard({ href, label, title, body, cta }) {
  return (
    <a
      href={href}
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group h-full rounded-lg border border-line bg-panel-2/40 hover:bg-panel-2/70 transition-colors px-5 py-5 flex flex-col gap-3"
    >
      <span className="font-mono text-[11px] uppercase tracking-wide text-mute">{label}</span>
      <span className="font-serif text-2xl text-ink leading-snug">{title}</span>
      <span className="text-body leading-relaxed">{body}</span>
      <span className="mt-auto inline-flex items-center gap-2 text-[14px] text-ink">
        {cta}
        <FaArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
      </span>
    </a>
  )
}

// Chapters with more than two media items lay them out in rows beneath the text,
// so a tall side column doesn't leave the body column empty.
const SIDE_LIMIT = 2

function Chapter({ badge, label, name, role, where, body, facts, figures = [], features = [] }) {
  const mediaCount = figures.length + features.length
  const wide = mediaCount > SIDE_LIMIT
  const side = mediaCount > 0 && !wide

  const header = (
    <Reveal as="header" className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
      <span className="w-14 h-14 rounded-md bg-cream text-canvas flex items-center justify-center font-mono text-[12px] font-medium tracking-wide">
        {badge}
      </span>
      <p className="mt-2 font-mono text-[12px] uppercase tracking-wide text-mute">{label}</p>
      <h4 className="font-serif text-2xl sm:text-3xl text-ink leading-tight">{name}</h4>
      <p className="text-flame">{role}</p>
      <p className="font-mono text-[11px] uppercase tracking-wide text-mute">{where}</p>
    </Reveal>
  )

  const paragraphs = body.map((para, i) => (
    <p key={i} className="text-body leading-relaxed">{para}</p>
  ))

  return (
    <article
      className={`grid grid-cols-1 gap-8 lg:gap-12 px-6 sm:px-12 lg:px-20 xl:px-28 py-12 sm:py-16 border-t border-line ${
        side ? 'lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,0.85fr)]' : 'lg:grid-cols-[260px_minmax(0,1fr)]'
      }`}
    >
      {header}

      {wide ? (
        <div className="flex flex-col gap-8 min-w-0">
          <Reveal delay={80} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8 xl:gap-10">
            <div className="flex flex-col gap-5">{paragraphs}</div>
            <div className="xl:sticky xl:top-24 xl:self-start">
              <Facts facts={facts} />
            </div>
          </Reveal>
          {figures.length > 0 && (
            <Reveal delay={120} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {figures.map(fig => <Figure key={fig.file} {...fig} />)}
            </Reveal>
          )}
          {features.length > 0 && (
            <Reveal delay={160} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
            </Reveal>
          )}
        </div>
      ) : (
        <Reveal delay={80} className={`flex flex-col gap-5 ${side ? '' : 'max-w-3xl'}`}>
          {paragraphs}
          <div className="mt-2">
            <Facts facts={facts} />
          </div>
        </Reveal>
      )}

      {side && (
        <Reveal delay={160} className="flex flex-col gap-5 min-w-0">
          {figures.map(fig => <Figure key={fig.file} {...fig} />)}
          {features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
        </Reveal>
      )}
    </article>
  )
}

export default function AboutChapters() {
  return (
    <div className="mt-14 sm:mt-20">
      <Reveal className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-16 px-6 sm:px-12 lg:px-20 xl:px-28 pb-10 sm:pb-14">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-wide text-mute">The long version</p>
          <h3 className="mt-4 font-serif text-ink text-3xl sm:text-4xl leading-tight">Where it all comes from.</h3>
        </div>
        <p className="text-body leading-relaxed max-w-md lg:self-end">
          A student society, a research corporation, a university, a police service and a shop floor.
          Each one shaped a different part of how I work.
        </p>
      </Reveal>
      {CHAPTERS.map(chapter => (
        <Chapter key={chapter.name} {...chapter} />
      ))}
    </div>
  )
}
