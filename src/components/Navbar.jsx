import { FaLinkedin, FaDiscord, FaGithub } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between px-6 py-6 md:px-0 md:max-w-6xl md:mx-auto">
        
        {/* Left icons */}
        <div className="flex gap-6">
          <a
            href="https://www.linkedin.com/in/zac-knight/"
            className="text-slate-400 hover:text-sky-400 transition-colors duration-300"
          >
            <FaLinkedin size={26} />
          </a>

          <a
            href="https://github.com/zac-knight"
            className="text-slate-400 hover:text-sky-400 transition-colors duration-300"
          >
            <FaGithub size={26} />
          </a>
        </div>

        {/* Right link */}
        <a
          href="#contact"
          className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors duration-300 text-base tracking-widest uppercase"
        >
          <MdEmail size={22} />
          Get In Touch
        </a>
      </div>
    </nav>
  )
}