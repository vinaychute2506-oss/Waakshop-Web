import React, { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"

export default function Navbar() {
  const { navigateTo, currentRoute, cartCount, wishlistCount, setIsCartOpen, setIsWishlistOpen, setActiveCategory } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Track header scroll state for sticky elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAccountMenuOpen(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleCategoryNav = (cat: string) => {
    setActiveCategory(cat)
    if (currentRoute !== "/") {
      navigateTo("/")
    }
    setMobileMenuOpen(false)
    setTimeout(() => {
      const el = document.getElementById("collection-section")
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  return (
    <>
      {/* Top Announcement Bar */}
      <div style={{
        backgroundColor: "var(--color-burgundy-deep)",
        color: "var(--color-gold-light)",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.15em",
        textAlign: "center",
        padding: "8px 16px",
        textTransform: "uppercase",
        borderBottom: "1px solid rgba(197, 162, 101, 0.2)"
      }}>
        Complimentary Express Shipping Across India · Rooted in Heritage
      </div>

      {/* Main Header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: isScrolled ? "rgba(244, 239, 230, 0.98)" : "rgba(244, 239, 230, 0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: isScrolled ? "1px solid rgba(110, 53, 41, 0.18)" : "1px solid var(--color-border-light)",
        boxShadow: isScrolled ? "0 4px 20px rgba(35, 8, 10, 0.08)" : "none",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: isScrolled ? "12px 24px" : "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "padding 0.3s ease"
        }}>
          {/* Left: Mobile hamburger & desktop main nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1 }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              style={{
                display: "none",
                color: "var(--color-burgundy)",
                padding: "8px",
                cursor: "pointer"
              }}
              className="mobile-hamburger"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
                )}
              </svg>
            </button>

            <nav className="desktop-nav" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <button
                onClick={() => handleCategoryNav("Kurta Sets")}
                className="nav-link editorial-underline"
              >
                Kurta Sets
              </button>
              <button
                onClick={() => handleCategoryNav("Indian Wear")}
                className="nav-link editorial-underline"
              >
                Indian Wear
              </button>
              <button
                onClick={() => handleCategoryNav("Indo Western & Jodhpuri")}
                className="nav-link editorial-underline"
              >
                Indo Western
              </button>
              <button
                onClick={() => handleCategoryNav("Suits & Blazers")}
                className="nav-link editorial-underline"
              >
                Suits & Blazers
              </button>
              <button
                onClick={() => handleCategoryNav("Waistcoats")}
                className="nav-link editorial-underline"
              >
                Waistcoats
              </button>
            </nav>
          </div>

          {/* Center: WAAK Brand Logo */}
          <div
            style={{ textAlign: "center", cursor: "pointer", userSelect: "none" }}
            onClick={() => {
              if (currentRoute !== "/") navigateTo("/")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          >
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: isScrolled ? "26px" : "30px",
              fontWeight: 700,
              letterSpacing: "0.24em",
              color: "var(--color-burgundy)",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "font-size 0.3s ease"
            }}>
              WAAK
            </div>
            <div style={{
              fontSize: "8.5px",
              letterSpacing: "0.32em",
              color: "var(--color-gold-dark)",
              textTransform: "uppercase",
              marginTop: "3px",
              fontWeight: 600
            }}>
              Occasionwear
            </div>
          </div>

          {/* Right: Actions (Account, Wishlist, Cart) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "20px", flex: 1 }}>
            {/* Account */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                aria-label="Account Menu"
                aria-expanded={accountMenuOpen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "var(--color-charcoal)",
                  padding: "6px",
                  transition: "var(--transition-smooth)"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {accountMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 12px)",
                    backgroundColor: "var(--color-cream-light)",
                    border: "1px solid var(--color-border-light)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-card)",
                    width: "200px",
                    padding: "8px 0",
                    zIndex: 200,
                    animation: "dropdownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                >
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false)
                      navigateTo("/account")
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 18px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--color-charcoal)",
                      display: "block"
                    }}
                  >
                    Sign In / Register
                  </button>
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false)
                      navigateTo("/account")
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 18px",
                      fontSize: "13px",
                      color: "var(--color-muted)",
                      display: "block"
                    }}
                  >
                    My Orders
                  </button>
                  <div style={{ height: "1px", backgroundColor: "var(--color-border)", margin: "4px 0" }} />
                  <a
                    href="mailto:concierge@waakshop.com"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 18px",
                      fontSize: "12px",
                      color: "var(--color-gold-dark)",
                      display: "block"
                    }}
                  >
                    Bespoke Concierge
                  </a>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              aria-label="Wishlist"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                color: "var(--color-charcoal)",
                padding: "6px",
                transition: "var(--transition-smooth)"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlistCount > 0 ? "var(--color-burgundy)" : "none"} stroke={wishlistCount > 0 ? "var(--color-burgundy)" : "currentColor"} strokeWidth="1.75">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && (
                <span
                  key={`wish-${wishlistCount}`}
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-4px",
                    backgroundColor: "var(--color-burgundy)",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: 700,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "badgeBounce 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Cart"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                color: "var(--color-charcoal)",
                padding: "6px",
                transition: "var(--transition-smooth)"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span
                  key={`cart-${cartCount}`}
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-4px",
                    backgroundColor: "var(--color-gold-dark)",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: 700,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "badgeBounce 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: "var(--color-cream-light)",
            borderTop: "1px solid var(--color-border-light)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            animation: "mobileMenuSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <button
              onClick={() => handleCategoryNav("Kurta Sets")}
              style={{ textAlign: "left", fontSize: "14px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Kurta Sets
            </button>
            <button
              onClick={() => handleCategoryNav("Indian Wear")}
              style={{ textAlign: "left", fontSize: "14px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Indian Wear
            </button>
            <button
              onClick={() => handleCategoryNav("Indo Western & Jodhpuri")}
              style={{ textAlign: "left", fontSize: "14px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Indo Western & Jodhpuri
            </button>
            <button
              onClick={() => handleCategoryNav("Suits & Blazers")}
              style={{ textAlign: "left", fontSize: "14px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Suits & Blazers
            </button>
            <button
              onClick={() => handleCategoryNav("Waistcoats")}
              style={{ textAlign: "left", fontSize: "14px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Waistcoats
            </button>
            <div style={{ height: "1px", backgroundColor: "var(--color-border)", margin: "8px 0" }} />
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                navigateTo("/account")
              }}
              style={{ textAlign: "left", fontSize: "14px", color: "var(--color-burgundy)", fontWeight: 600 }}
            >
              My Account
            </button>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger {
            display: block !important;
          }
        }
        .nav-link {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-charcoal);
          transition: var(--transition-smooth);
          background: none;
          border: none;
          cursor: pointer;
        }
        .nav-link:hover {
          color: var(--color-burgundy);
        }
        @keyframes badgeBounce {
          0% { transform: scale(0.6); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes dropdownFade {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileMenuSlide {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
