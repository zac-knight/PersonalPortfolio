import { FaHouse, FaPhone, FaLocationDot } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'

export default function Contact() {
  return (
    <section
      id="contact"
      className="h-screen w-full bg-[#f0f0f0] snap-start flex flex-col items-center justify-center relative"
    >
      {/* Title */}
      <p className="text-gray-400 tracking-[0.3em] text-sm uppercase mb-2">
        C O N T A C T
      </p>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        I have got just what you need.{' '}
        <span className="underline">Lets talk.</span>
      </h2>

      {/* Contact Details */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-4 text-gray-700">
          <MdEmail size={24} className="text-teal-600" />
          <span className="text-lg">zknight03@outlook.com</span>
        </div>
        <div className="flex items-center gap-4 text-gray-700">
          <FaLocationDot size={22} className="text-teal-600" />
          <span className="text-lg">Brisbane, Australia</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3 w-full max-w-2xl px-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Name"
            className="flex-1 bg-gray-200 rounded-lg px-4 py-3 text-gray-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            type="email"
            placeholder="Email"
            className="flex-1 bg-gray-200 rounded-lg px-4 py-3 text-gray-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <input
          type="text"
          placeholder="Subject"
          className="w-full bg-gray-200 rounded-lg px-4 py-3 text-gray-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400"
        />
        <textarea
          placeholder="Message"
          rows={4}
          className="w-full bg-gray-200 rounded-lg px-4 py-3 text-gray-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400 resize-y"
        />
        <button className="w-full bg-teal-500 hover:bg-teal-600 transition text-white font-semibold py-4 rounded-lg">
          Submit
        </button>
      </div>
    </section>
  )
}