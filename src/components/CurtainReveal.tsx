import React, { useState, useEffect, useRef } from "react"
import "./CurtainReveal.css"

// Module-level session guard: persists across client-side SPA route transitions,
// but resets automatically on full browser page reload / refresh.
let hasPlayedInSession = false

interface CurtainRevealProps {
  onComplete?: () => void
}

export default function CurtainReveal({ onComplete }: CurtainRevealProps) {
  const [stage, setStage] = useState<"closed" | "opening" | "finished" | "unmounted">(() => {
    // If running in browser and user requested reduced motion, or has already viewed intro
    if (typeof window !== "undefined") {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (isReduced || hasPlayedInSession) {
        return "unmounted"
      }
    }
    return "closed"
  })

  const timersRef = useRef<number[]>([])

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }

  const handleSkip = () => {
    clearAllTimers()
    hasPlayedInSession = true
    setStage("unmounted")
    if (onComplete) {
      onComplete()
    }
  }

  useEffect(() => {
    // If already unmounted (e.g. reduced motion or already played)
    if (stage === "unmounted") {
      if (!hasPlayedInSession) {
        hasPlayedInSession = true
        if (onComplete) onComplete()
      }
      return
    }

    // Safety fallback: if user presses Escape key, skip curtain
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip()
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    // Sequence timing:
    // 0ms - 650ms: Closed curtains & glowing wordmark arrival
    // 650ms - 2100ms: Curtains part smoothly outward revealing the hero behind
    // 2100ms: Overlay finished & onComplete callback triggers hero text stagger
    // 2500ms: Unmounted from DOM tree
    const timer1 = window.setTimeout(() => {
      setStage("opening")
    }, 650)

    const timer2 = window.setTimeout(() => {
      setStage("finished")
      hasPlayedInSession = true
      if (onComplete) {
        onComplete()
      }
    }, 2150)

    const timer3 = window.setTimeout(() => {
      setStage("unmounted")
    }, 2550)

    timersRef.current = [timer1, timer2, timer3]

    return () => {
      clearAllTimers()
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  if (stage === "unmounted") {
    return null
  }

  return (
    <div
      className={`curtain-reveal-overlay ${stage}`}
      role="dialog"
      aria-modal="true"
      aria-label="WAAK Haute Occasionwear - Curtain Reveal"
    >
      {/* Accessible Skip Button */}
      <button
        type="button"
        className="curtain-skip-btn"
        onClick={handleSkip}
        aria-label="Skip introductory curtain animation"
      >
        <span>Skip Intro</span>
        <span className="curtain-skip-icon" aria-hidden="true">→</span>
      </button>

      {/* Left Velvet Curtain Panel */}
      <div className="curtain-panel curtain-panel-left" aria-hidden="true">
        <div className="curtain-fabric-texture" />
        <div className="curtain-folds" />
        <div className="curtain-sheen" />
        <div className="curtain-shadow-gather" />
        <div className="curtain-edge-trim" />
      </div>

      {/* Right Velvet Curtain Panel */}
      <div className="curtain-panel curtain-panel-right" aria-hidden="true">
        <div className="curtain-fabric-texture" />
        <div className="curtain-folds" />
        <div className="curtain-sheen" />
        <div className="curtain-shadow-gather" />
        <div className="curtain-edge-trim" />
      </div>

      {/* Top Theatrical Valance / Pelmet */}
      <div className="curtain-pelmet" aria-hidden="true" />

      {/* Center Branding & Heritage Ornament */}
      <div className="curtain-emblem-wrap" aria-hidden="true">
        <svg
          className="curtain-ornament"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Heritage Indian Rosette / Jali Star Motif */}
          <circle cx="24" cy="24" r="3" fill="currentColor" />
          <path
            d="M24 6C24 14 18 20 18 24C18 28 24 34 24 42C24 34 30 28 30 24C30 20 24 14 24 6Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          <path
            d="M6 24C14 24 20 18 24 18C28 18 34 24 42 24C34 24 28 30 24 30C20 30 14 24 6 24Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        </svg>

        <h1 className="curtain-wordmark">WAAK</h1>

        <div className="curtain-tagline-wrap">
          <span className="curtain-tagline-line" />
          <span className="curtain-tagline">HAUTE OCCASIONWEAR</span>
          <span className="curtain-tagline-line" />
        </div>
      </div>
    </div>
  )
}
