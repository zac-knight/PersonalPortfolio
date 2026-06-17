import { TypeAnimation } from 'react-type-animation'

export default function Hero() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col bg-[#0a0a0a] overflow-hidden snap-start"
    >
      {/* Ocean Wave Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[
          { delay: '0s', duration: '4.2s' },
          { delay: '2.3s', duration: '5.7s' },
          { delay: '5.1s', duration: '4.8s' },
          { delay: '8.4s', duration: '6.1s' },
          { delay: '11.2s', duration: '5.2s' },
        ].map((wave, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-sky-500/30"
            style={{
              width: 620,
              height: 620,
              animation: `wave-out ${wave.duration} ease-out infinite`,
              animationDelay: wave.delay,
            }}
          />
        ))}
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center flex-1 z-10 px-4">
        {/* Large Static Circle around content */}
        <div className="relative flex flex-col items-center justify-center">
          <div
            className="absolute rounded-full border border-sky-500/20 pointer-events-none"
            style={{
              width: 'min(650px, 90vw)',
              height: 'min(650px, 90vw)',
            }}
          />

          <div className="flex flex-col items-center justify-center gap-3 py-16 px-8">
            {/* Profile Photo */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-sky-400/40">
              <img
                src="/profile.png"
                alt="Profile"
                className="w-full h-full object-cover grayscale"
              />
            </div>

            {/* Subtitle */}
            <p className="text-slate-400 tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm uppercase mt-2">
              Aspiring ML Engineer
            </p>

            {/* Typing Animation */}
            <div className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-100 flex items-center gap-2 text-center">
              <TypeAnimation
                sequence={[
                  "And I'm addicted to ☕",
                  2000,
                  "And I love building things 🛠️",
                  2000,
                  "And I enjoy solving problems 🧠",
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
              <span className="w-[2px] md:w-[3px] h-7 md:h-10 bg-sky-400 inline-block animate-pulse" />
            </div>

            {/* Nav Links */}
            <nav className="flex flex-wrap justify-center gap-3 md:gap-10 mt-4 text-xs tracking-widest text-slate-400 uppercase">
              {['About', 'Experience', 'Education', 'Projects'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="px-3 md:px-4 py-2 rounded-full border border-transparent hover:border-sky-400/40 hover:text-sky-300 transition-all duration-300 cursor-pointer bg-transparent"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  )
}
