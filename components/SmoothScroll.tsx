"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import "locomotive-scroll/dist/locomotive-scroll.css"


let LocomotiveScroll: any
if (typeof window !== "undefined") {
  // @ts-ignore
  import("locomotive-scroll").then((mod) => {
    LocomotiveScroll = mod.default
  })
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!LocomotiveScroll || !containerRef.current) return

    
    const scroll = new LocomotiveScroll({
      el: containerRef.current,
      smooth: true,
      multiplier: 1,
      lerp: 0.08,
    })

   
    scroll.scrollTo(0, { duration: 0, disableLerp: true })
    scroll.update()

    return () => {
      if (scroll) scroll.destroy()
    }
  }, [pathname])

  return <div ref={containerRef} data-scroll-container>{children}</div>
}
