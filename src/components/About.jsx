import { useEffect, useRef, useState } from 'react'
import { FaLinkedin, FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { FaHouse } from 'react-icons/fa6'

export default function About() {
  const imgRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = imgRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      className="min-h-screen flex items-center snap-start py-16 px-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full gap-10 md:gap-0">
        {/* Left - Photo */}
        <div className="flex items-center justify-center md:justify-end md:pr-10">
          <div
            ref={imgRef}
            className={`w-[260px] h-[360px] sm:w-[320px] sm:h-[440px] md:w-[420px] md:h-[580px] overflow-hidden rounded-lg transition-all duration-[3000ms] ease-out ${
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
            }`}
          >
            <img
              src={`${import.meta.env.BASE_URL}profile-large.png`}
              alt="About"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Right - Text */}
        <div className="flex flex-col justify-center md:pl-10 md:pr-20 max-w-2xl mx-auto md:mx-0">
          <div className="flex flex-col gap-6 md:gap-10">
            <p className="text-slate-400 tracking-[0.3em] text-sm uppercase">
              A B O U T
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              My{' '}
              <span className="underline decoration-sky-400">
                background
              </span>
            </h2>
          </div>
          <p className="text-slate-300 leading-relaxed text-justify text-base md:text-sm">
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