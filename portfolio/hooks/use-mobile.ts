// src/hooks/use-mobile.ts
"use client"

import { useEffect, useState } from "react"

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check window width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Run once on mount
    checkMobile()

    // Listen for resize events
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [breakpoint])

  return isMobile
}
