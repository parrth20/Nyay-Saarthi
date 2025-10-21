"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import "locomotive-scroll/dist/locomotive-scroll.min.css"

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<any>(null)
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle route changes
  useEffect(() => {
    setIsTransitioning(true)

    // Destroy scroll instance during transition
    if (scrollRef.current) {
      scrollRef.current.destroy()
      scrollRef.current = null
    }

    // Reset native scroll immediately
    window.scrollTo(0, 0)
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }

    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  // Initialize/reinitialize Locomotive Scroll
  useEffect(() => {
    if (isTransitioning) return

    let mounted = true

    const initLocomotiveScroll = async () => {
      try {
        // @ts-ignore
        const LocomotiveScroll = (await import("locomotive-scroll")).default

        // Wait for content to render
        await new Promise((resolve) => setTimeout(resolve, 300))

        if (!mounted || !containerRef.current) return

        const scroll = new LocomotiveScroll({
          el: containerRef.current,
          smooth: true,
          multiplier: 1,
          lerp: 0.08,
          smartphone: { smooth: true },
          tablet: { smooth: true },
        })

        scrollRef.current = scroll

        // Ensure we're at the top
        scroll.scrollTo(0, { duration: 0, disableLerp: true })

        // Update after a short delay
        const delays = [100, 300, 600]
        delays.forEach((delay) => {
          setTimeout(() => {
            if (mounted && scrollRef.current) {
              scrollRef.current.update()
            }
          }, delay)
        })
      } catch (err) {
        console.error("Failed to initialize Locomotive Scroll:", err)
      }
    }

    initLocomotiveScroll()

    return () => {
      mounted = false
      if (scrollRef.current) {
        scrollRef.current.destroy()
        scrollRef.current = null
      }
    }
  }, [isTransitioning])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        scrollRef.current.update()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      ref={containerRef}
      data-scroll-container
      style={{
        opacity: isTransitioning ? 0.5 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {children}
    </div>
  )
}