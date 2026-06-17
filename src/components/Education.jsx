import { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

const courses = [
  // Semester 1, 2022
  'IFB102 Introduction to Computer Systems',
  'IFB103 IT Systems Design',
  'IFB104 Building IT Systems',
  'IFB105 Database Management',

  // Semester 2, 2022
  'CAB201 Programming Principles',
  'CAB202 Microprocessors and Digital Systems',
  'CAB210 User Experience Fundamentals',
  'IAB207 Rapid Web Application Development',

  // Semester 1, 2023
  'CAB203 Discrete Structures',
  'CAB230 Web Computing',
  'CAB302 Software Development',
  'IAB230 Design of Enterprise IoT',

  // Semester 2, 2023
  'CAB222 Networks',
  'CAB432 Cloud Computing',
  'IFB295 IT Project Management',
  'MXB103 Introductory Computational Mathematics',

  // Semester 1, 2024
  'CAB301 Algorithms and Complexity',
  'CAB320 Artificial Intelligence',
  'CAB420 Machine Learning',
  'IFB398 Capstone Project (Phase 1)',

  // Semester 2, 2024
  'IFB240 Cyber Security',
  'MZB125 Introductory Engineering Mathematics',
  'CAB403 Systems Programming',
  'IFB399 IT Capstone Project (Phase 2)',

  // Semester 1, 2025
  'EGB101 Engineering Design and Prof. Practice',
  'EGB120 Foundations of Electrical Engineering',
  'IFB452 Blockchain Technology',
  'MZB127 Engineering Mathematics and Statistics',

  // Semester 2, 2025
  'CAB401 High Performance & Parallel Computing',
  'MZB221 Electrical Engineering Mathematics'
]

const education = [
  {
    degree: 'Master of Artificial Intelligence',
    institution: 'Queensland University of Technology',
    dates: 'Feb 2026 – Present',
    gpa: 'TBD',
    points: [
      'Expected completion July 2027',
    ],
    courses: [],
  },
  {
    degree: 'Bachelor of Information Technology',
    institution: 'Queensland University of Technology',
    dates: 'Feb 2022 – Nov 2025',
    gpa: '6.6 / 7.0',
    points: [
      'Major: Computer Science',
      'Minor: Engineering Foundations'
    ],
    courses: courses,
  },
]

export default function Education() {
  const [expandedIndex, setExpandedIndex] = useState(null)

  // Sort by unit code
  const sortedCourses = [...courses].sort((a, b) => {
    const codeA = a.split(' ')[0]
    const codeB = b.split(' ')[0]
    return codeA.localeCompare(codeB)
  })

  // Split into 2 vertical columns (fill down first)
  const splitIntoColumns = (arr, columns = 2) => {
    const perColumn = Math.ceil(arr.length / columns)
    return Array.from({ length: columns }, (_, i) =>
      arr.slice(i * perColumn, (i + 1) * perColumn)
    )
  }

  const columns = splitIntoColumns(sortedCourses, 2)

  return (
    <section
      id="education"
      className="h-screen w-full bg-[#0a0a0a] snap-start flex flex-col items-center justify-center relative"
    >
      {/* Title */}
      <div className="mb-10">
        <p className="text-slate-400 tracking-[0.3em] text-sm uppercase">
          E D U C A T I O N
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-6 w-full max-w-3xl px-8">
        {education.map((edu, index) => (
          <div
            key={index}
            className="bg-slate-900 border border-sky-500/20 rounded-2xl p-8 flex flex-col gap-3 shadow-lg shadow-black/30 hover:border-sky-400/40 transition-all duration-300"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-slate-100">
                  {edu.degree}
                </h3>
                <p className="text-sky-400 font-semibold text-base">
                  {edu.institution}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-slate-500 text-xs tracking-widest uppercase">
                  {edu.dates}
                </span>
                <span className="text-slate-300 text-sm font-semibold">
                  GPA: {edu.gpa}
                </span>
              </div>
            </div>

            {/* Bullet points */}
            <ul className="list-disc list-inside text-slate-300 text-sm leading-relaxed">
              {edu.points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>

            {/* Courses */}
            {edu.courses.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="flex items-center gap-2 text-sky-400 text-xs tracking-widest uppercase hover:text-sky-300 transition-colors duration-200"
                >
                  {expandedIndex === index ? (
                    <>
                      Hide Courses <FaChevronUp size={10} />
                    </>
                  ) : (
                    <>
                      View Units <FaChevronDown size={10} />
                    </>
                  )}
                </button>

                {expandedIndex === index && (
                  <div className="mt-4 flex gap-8 max-h-24 overflow-y-auto no-scrollbar pr-2">
                    {columns.map((col, colIndex) => (
                      <div
                        key={colIndex}
                        className="flex flex-col gap-1 flex-1"
                      >
                        {col.map((course, i) => (
                          <p
                            key={i}
                            className="text-slate-400 text-xs leading-tight"
                          >
                            {course}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}