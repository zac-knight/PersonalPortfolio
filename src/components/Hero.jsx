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
      className="relative h-screen flex flex-col bg-[#f0f0f0] overflow-hidden snap-start"
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
            className="absolute rounded-full border border-gray-400"
            style={{
              width: 400,
              height: 400,
              animation: `wave-out ${wave.duration} ease-out infinite`,
              animationDelay: wave.delay,
            }}
          />
        ))}
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center flex-1 z-10">

        {/* Large Static Circle around content */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute rounded-full border border-gray-300 pointer-events-none"
            style={{ width: 720, height: 720 }}
          />

          <div className="flex flex-col items-center justify-center gap-3 py-16">
            {/* Profile Photo */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300">
              <img
                src="/profile.png"
                alt="Profile"
                className="w-full h-full object-cover grayscale"
              />
            </div>

            {/* Subtitle */}
            <p className="text-gray-400 tracking-[0.3em] text-sm uppercase mt-2">
              Software Engineer
            </p>

            {/* Typing Animation */}
            <div className="text-4xl font-bold text-gray-900 flex items-center gap-2">
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
              <span className="w-[3px] h-10 bg-teal-500 inline-block animate-pulse" />
            </div>

            {/* Nav Links */}
            <nav className="flex gap-10 mt-4 text-xs tracking-widest text-gray-400 uppercase">
              {['About', 'Experience', 'Skills', 'Projects'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="px-4 py-2 rounded-full border border-transparent hover:border-gray-300 hover:text-gray-600 transition-all duration-300 cursor-pointer bg-transparent"
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