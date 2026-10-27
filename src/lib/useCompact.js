import { useEffect, useState } from 'react'

// True below the lg breakpoint, where every section collapses to one column
export default function useCompact(query = '(max-width: 1023px)') {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setCompact(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return compact
}
