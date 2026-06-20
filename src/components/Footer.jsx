import { FaHouse } from 'react-icons/fa6'

export default function Footer() {
  const scrollToTop = () => {
    document.getElementById('scroll-container').scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={scrollToTop}
        className="w-12 h-12 rounded-full bg-sky-500/90 border border-sky-400/40 flex items-center justify-center text-white hover:bg-sky-400 transition-all duration-300 shadow-lg shadow-sky-500/20 backdrop-blur-sm"
      >
        <FaHouse size={18} />
      </button>
    </div>
  )
}

