"use client"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
     setMounted(true)
    const updateCursor = (e: MouseEvent) => {
       
      setPosition({ x: e.clientX, y: e.clientY })

      const path = e.composedPath() as HTMLElement[]
      const interactive = path.some(
        (el) =>
          el instanceof HTMLElement &&
          (el.tagName === "A" ||
            el.tagName === "BUTTON" ||
            el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.getAttribute("role") === "button")
      )
      setIsPointer(interactive)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    window.addEventListener("mousemove", updateCursor)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", updateCursor)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const scale = isClicking ? 0.85 : isPointer ? 1.2 : 1
  if (!mounted) return null
  return createPortal(
    <>
      {/* Main Cursor */}
      <div
        className="pointer-events-none fixed z-[99999]"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isPointer ? "drop-shadow-2xl" : "drop-shadow-lg"}
        >
          <path
            d="M8 4L8 24L13.5 18.5L16.5 26L20 24.5L17 16.5L24 16L8 4Z"
            fill="#22c55e"
            opacity="0.4"
            className="blur-[2px]"
          />
          <path
            d="M8 4L8 24L13.5 18.5L16.5 26L20 24.5L17 16.5L24 16L8 4Z"
            fill="#16a34a"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 8L10 20L14 16L16 21L17.5 20.5L15.5 15.5L20 15.5L10 8Z"
            fill="#22c55e"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Glow */}
      <div
        className="pointer-events-none fixed z-[99998]"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
          transition: "all 0.1s ease-out",
        }}
      >
        <div
          className={`rounded-full ${
            isPointer ? "h-16 w-16" : "h-12 w-12"
          } ${isClicking ? "scale-75" : "scale-100"} transition-all duration-200`}
          style={{
            backgroundColor: "rgba(22, 163, 74, 0.2)",
            filter: "blur(12px)",
          }}
        />
      </div>
    </>,
    document.body
  )
}
