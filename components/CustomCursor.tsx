// components/CustomCursor.tsx
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
            el.getAttribute("role") === "button" ||
            window.getComputedStyle(el).cursor === "pointer" ||
            el.hasAttribute("data-cursor-interactive"))
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

  // --- Cursor Animation States for the Flowing Digital Stream ---
  // Core "Focal Point" (brightest, smallest)
  const coreSize = isClicking ? 10 : isPointer ? 16 : 12;
  const coreOpacity = isClicking ? 1 : isPointer ? 0.8 : 0.6;
  const coreBlur = "blur(1px)"; // Very sharp for definition

  // Mid-layer "Flow" (medium size, slightly blurred)
  const midSize = isClicking ? 25 : isPointer ? 40 : 30;
  const midOpacity = isClicking ? 0.6 : isPointer ? 0.4 : 0.25;
  const midBlur = isClicking ? "blur(8px)" : isPointer ? "blur(15px)" : "blur(10px)";

  // Outer "Stream" (largest, most blurred)
  const outerSize = isClicking ? 40 : isPointer ? 70 : 50;
  const outerOpacity = isClicking ? 0.3 : isPointer ? 0.15 : 0.08;
  const outerBlur = isClicking ? "blur(18px)" : isPointer ? "blur(30px)" : "blur(20px)";

  if (!mounted) {
    return null
  }

  return createPortal(
    <>
      {/* Green Flowing Digital Stream Cursor */}
      <div
        className="pointer-events-none fixed z-[99999] flex items-center justify-center"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%)`,
          transition: "transform 0.05s linear", // Keeps the cursor movement very responsive
        }}
      >
        {/* Outer Stream - Ambient, large blur */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${outerSize}px`,
            height: `${outerSize}px`,
            backgroundColor: `rgba(22, 163, 74, ${outerOpacity})`, // Your brand green
            filter: outerBlur,
            transition: "all 0.4s ease-out", // Slower transition for a more fluid ambient effect
          }}
        />
        {/* Mid-layer Flow - More defined, responsive */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${midSize}px`,
            height: `${midSize}px`,
            backgroundColor: `rgba(22, 163, 74, ${midOpacity})`,
            filter: midBlur,
            transition: "all 0.25s ease-out", // Mid-speed transition
          }}
        />
        {/* Core Focal Point - The most direct pointer, brightest, sharpest */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${coreSize}px`,
            height: `${coreSize}px`,
            backgroundColor: `rgba(22, 163, 74, ${coreOpacity})`,
            filter: coreBlur,
            transition: "all 0.1s ease-out", // Fastest transition for direct feedback
          }}
        />
      </div>
    </>,
    document.body
  )
}