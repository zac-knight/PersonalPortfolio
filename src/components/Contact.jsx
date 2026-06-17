import { FaHouse, FaPhone, FaLocationDot } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'

export default function Contact() {
  return (
    <section
      id="contact"
      className="h-screen w-full bg-[#0a0a0a] snap-start flex flex-col items-center justify-center relative"
    >
      {/* Title */}
      <p className="text-slate-400 tracking-[0.3em] text-sm uppercase mb-2">
        C O N T A C T
      </p>

      <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">
        I have got just what you need.{' '}
        <span className="underline decoration-sky-400">
          Let's talk.
        </span>
      </h2>

      {/* Contact Details */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-4 text-slate-300">
          <MdEmail size={24} className="text-sky-400" />
          <span className="text-lg">zknight03@outlook.com</span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <FaLocationDot size={22} className="text-sky-400" />
          <span className="text-lg">Brisbane, Australia</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3 w-full max-w-2xl px-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Name"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />

          <input
            type="email"
            placeholder="Email"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />
        </div>

        <input
          type="text"
          placeholder="Subject"
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
        />

        <textarea
          placeholder="Message"
          rows={4}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-y"
        />

        <button className="w-full bg-sky-500 hover:bg-sky-400 transition-all duration-300 text-white font-semibold py-4 rounded-lg shadow-lg shadow-sky-500/20">
          Submit
        </button>
      </div>
    </section>
  )
}

