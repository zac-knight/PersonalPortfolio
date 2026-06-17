import { TypeAnimation } from 'react-type-animation'
import { FaLinkedin, FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { FaHouse } from 'react-icons/fa6'

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen snap-start relative min-h-screen flex flex-col bg-[#f0f0f0] overflow-hidden"
    >

      {/* Concentric Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[600, 450, 300].map((size) => (
          <div
            key={size}
            className="absolute rounded-full border border-gray-300"
            style={{ width: size, height: size }}
          />
        ))}
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center flex-1 z-10">

        {/* Profile Photo */}
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 mb-6">
          <img
            src="/profile.png"
            alt="Profile"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        {/* Subtitle */}
        <p className="text-gray-400 tracking-[0.3em] text-sm uppercase mb-3">
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
        <nav className="flex gap-10 mt-8 text-xs tracking-widest text-gray-400 uppercase">
          {['About', 'Experience', 'Skills', 'Projects'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-gray-600 transition"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

    </section>
  )
}