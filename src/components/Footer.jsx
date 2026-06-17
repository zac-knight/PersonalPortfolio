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
        className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white hover:bg-teal-700 transition"
      >
        <FaHouse size={18} />
      </button>
    </div>
  )
}