import React, { useState, useEffect } from "react"
import { AppProvider, useApp } from "./context/AppContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import CartDrawer from "./components/CartDrawer"
import WishlistDrawer from "./components/WishlistDrawer"
import CheckoutModal from "./components/CheckoutModal"
import Home from "./Home"
import ProductDetail from "./ProductDetail"
import Account from "./Account"
import PolicyView from "./components/PolicyView"

function MainContent() {
  const { currentRoute, isCheckoutOpen, setIsCheckoutOpen } = useApp()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [isCursorHovered, setIsCursorHovered] = useState(false)

  // Track window scroll progress and back-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100)
      }
      setShowBackToTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Desktop subtle cursor accent tracking
  useEffect(() => {
    // Only bind on pointer: fine devices
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest("a, button, input, select, textarea, .clickable, [role='button']")) {
        setIsCursorHovered(true)
      } else {
        setIsCursorHovered(false)
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseover", handleMouseOver, { passive: true })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseover", handleMouseOver)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Subtle Desktop Cursor Accent */}
      <div
        className={`waak-cursor-dot ${isCursorHovered ? "hovered" : ""}`}
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`
        }}
        aria-hidden="true"
      />

      <Navbar />

      {/* Page view with smooth transition */}
      <main
        key={currentRoute}
        style={{
          flex: 1,
          animation: "pageFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {currentRoute === "/account" && <Account />}
        {currentRoute === "/product" && <ProductDetail />}
        {currentRoute === "/" && <Home />}
        {[
          "/privacy-policy",
          "/terms-of-service",
          "/terms-and-conditions",
          "/shipping-policy",
          "/shipping-and-delivery",
          "/returns-and-exchanges",
          "/care-and-preservation",
          "/contact",
          "/contact-us",
        ].includes(currentRoute) && <PolicyView route={currentRoute} />}
      </main>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* Back to Top Floating Button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top-btn ${showBackToTop ? "visible" : ""}`}
        aria-label="Back to top"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {/* Embedded keyframe for route fade */}
      <style>{`
        @keyframes pageFadeIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  )
}

