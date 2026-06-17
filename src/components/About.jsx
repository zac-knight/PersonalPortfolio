import { FaLinkedin, FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { FaHouse } from 'react-icons/fa6'

export default function About() {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center bg-[#f0f0f0] snap-start"
    >
      {/* Main Content */}
      <div className="grid grid-cols-2 w-full h-full">

        {/* Left - Photo */}
        <div className="flex items-center justify-end pr-10">
          <div className="w-[420px] h-[580px] overflow-hidden rounded-lg">
            <img
              src="/profile-large.png"
              alt="About"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>

        {/* Right - Text */}
        <div className="flex flex-col justify-center pl-10 pr-20 max-w-2xl">
          <p className="text-gray-400 tracking-[0.3em] text-sm uppercase mb-6">
            A B O U T
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Here is a <span className="underline decoration-teal-500">little</span> background
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            Hey 👋 I am a Software Engineer based in Brisbane, Australia.
            I recently completed my degree in Computer Science and have a
            passion for building clean, efficient, and meaningful software.
            I love exploring new technologies and turning ideas into reality
            through code.
          </p>
        </div>
      </div>
    </section>
  )
}