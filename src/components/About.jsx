import { FaLinkedin, FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { FaHouse } from 'react-icons/fa6'

export default function About() {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center bg-[#0a0a0a] snap-start"
    >
      {/* Main Content */}
      <div className="grid grid-cols-2 w-full h-full">
        {/* Left - Photo */}
        <div className="flex items-center justify-end pr-10">
          <div className="w-[420px] h-[580px] overflow-hidden rounded-lg border border-sky-500/20">
            <img
              src="/profile-large.png"
              alt="About"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>

        {/* Right - Text */}
        <div className="flex flex-col justify-center pl-10 pr-20 max-w-2xl">
          <p className="text-slate-400 tracking-[0.3em] text-sm uppercase mb-6">
            A B O U T
          </p>

          <h2 className="text-4xl font-bold text-slate-100 mb-8">
            Here is a{' '}
            <span className="underline decoration-sky-400">
              little
            </span>{' '}
            background
          </h2>

          <p className="text-slate-300 leading-relaxed text-justify">
            I am a Computer Science graduate currently pursuing a Master of
            Artificial Intelligence at QUT. Passionate about software development,
            machine learning, and emerging technologies, I enjoy solving complex
            problems and building innovative solutions that create real-world impact.

            <br /><br />

            My enthusiasm for AI and technology led me to found the QUT AI & ML
            Society, where I combine my technical interests with leadership and
            community building. Through my academic journey and extracurricular
            involvement, I have developed strong analytical, problem-solving, and
            communication skills while thriving in collaborative team environments.

            <br /><br />

            I am actively seeking opportunities to grow as a Software Engineer or
            Machine Learning Engineer, continuously expanding my knowledge and taking
            on new challenges. I am driven by curiosity, innovation, and a desire to
            contribute meaningful solutions to the future of technology.
          </p>
        </div>
      </div>
    </section>
  )
}
