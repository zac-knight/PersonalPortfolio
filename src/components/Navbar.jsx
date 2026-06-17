import { FaLinkedin, FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-6 z-50">
      {/* Social Icons Left */}
      <div className="flex gap-5">
        <a href="#" className="text-slate-400 hover:text-sky-400 transition-colors duration-300">
          <FaLinkedin size={22} />
        </a>
        <a href="#" className="text-slate-400 hover:text-sky-400 transition-colors duration-300">
          <FaTwitter size={22} />
        </a>
        <a href="#" className="text-slate-400 hover:text-sky-400 transition-colors duration-300">
          <FaGithub size={22} />
        </a>
        <a href="#" className="text-slate-400 hover:text-sky-400 transition-colors duration-300">
          <FaInstagram size={22} />
        </a>
      </div>

      {/* Get In Touch Right */}
      <a
        href="#contact"
        className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors duration-300 text-sm tracking-widest uppercase"
      >
        <MdEmail size={20} />
        Get In Touch
      </a>
    </nav>
  )
}
