import { FaLinkedin, FaDiscord, FaGithub } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

export default function Contact() {
  return (
    <section
      id="contact"
      className="min-h-screen w-full snap-start flex flex-col items-center justify-center relative"
    >
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-6 py-16 text-center gap-6 sm:gap-8">
        {/* Section Label */}
        <p className="text-slate-400 tracking-[0.3em] text-sm uppercase">
          C O N T A C T
        </p>
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 max-w-xl leading-tight">
          Let&apos;s build something together.
        </h2>
        {/* Subtext */}
        <p className="text-slate-400 text-sm sm:text-base max-w-md leading-relaxed">
          Whether you have a project in mind, a question, or just want to connect, feel free to reach out.
        </p>
        {/* CTA Button */}
        <a
          href="mailto:zknight03@outlook.com"
          className="mt-2 px-6 sm:px-8 py-3 border border-sky-500/40 text-sky-400 text-sm tracking-widest uppercase rounded-full hover:bg-sky-500/10 transition-all duration-300"
        >
          Say Hello
        </a>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-8 flex flex-col items-center gap-6 md:flex-row md:justify-between">

          {/* Left: Name + Role */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-slate-100 font-bold text-sm tracking-[0.2em] uppercase">
              Zac Knight
            </span>
            <span className="text-slate-500 text-xs tracking-widest uppercase text-center md:text-left">
              Machine Learning / Software Engineer
            </span>
          </div>

          {/* Center: Nav Links */}
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-slate-400 text-xs tracking-widest uppercase">
            <a href="#hero" className="hover:text-sky-400 transition-colors duration-200">Home</a>
            <a href="#about" className="hover:text-sky-400 transition-colors duration-200">About</a>
            <a href="#experience" className="hover:text-sky-400 transition-colors duration-200">Experience</a>
            <a href="#education" className="hover:text-sky-400 transition-colors duration-200">Education</a>
            <a href="#skills" className="hover:text-sky-400 transition-colors duration-200">Skills</a>
            <a href="#projects" className="hover:text-sky-400 transition-colors duration-200">Projects</a>
          </nav>

          {/* Right: Social Icons */}
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/in/zac-knight/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-slate-700 rounded flex items-center justify-center text-slate-400 hover:border-sky-500/60 hover:text-sky-400 transition-all duration-200"
            >
              <FaLinkedin size={14} />
            </a>
            <a
              href="https://discord.gg/CqkUzVVkXX"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-slate-700 rounded flex items-center justify-center text-slate-400 hover:border-sky-500/60 hover:text-sky-400 transition-all duration-200"
            >
              <FaDiscord size={14} />
            </a>
            <a
              href="https://github.com/zac-knight"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-slate-700 rounded flex items-center justify-center text-slate-400 hover:border-sky-500/60 hover:text-sky-400 transition-all duration-200"
            >
              <FaGithub size={14} />
            </a>
            <a
              href="mailto:zac@example.com"
              className="w-9 h-9 border border-slate-700 rounded flex items-center justify-center text-slate-400 hover:border-sky-500/60 hover:text-sky-400 transition-all duration-200"
            >
              <MdEmail size={15} />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/60 px-6 sm:px-12 py-4 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-2 text-center">
          <p className="text-slate-600 text-xs tracking-widest uppercase">
            &copy; 2026 Zac Knight | Brisbane, Queensland, Australia
          </p>
          <p className="text-slate-600 text-xs tracking-widest uppercase">
            React + Tailwind CSS
          </p>
        </div>
      </footer>
    </section>
  )
}