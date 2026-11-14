import React, { useState } from "react"
import { useApp } from "../context/AppContext"
import { api } from "../services/api"

export default function Footer() {
  const { navigateTo, setActiveCategory } = useApp()
  const [emailInput, setEmailInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "info" | "error"
    message: string
  } | null>(null)

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat)
    navigateTo("/")
    setTimeout(() => {
      const el = document.getElementById("collection-section")
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = emailInput.trim()
    if (!cleanEmail) return

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const res = await api.newsletter.subscribe(cleanEmail, "footer")
      if (res.duplicate) {
        setFeedback({
          type: "info",
          message: res.message || "Your email is already registered for WAAK private atelier curation.",
        })
      } else {
        setFeedback({
          type: "success",
          message: res.message || "Thank you for subscribing to WAAK private atelier curation.",
        })
        setEmailInput("")
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Unable to register your subscription. Please check your email and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer
      style={{
        backgroundColor: "var(--color-burgundy-deep)",
        color: "var(--color-cream)",
        borderTop: "1px solid rgba(197, 162, 101, 0.25)",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "70px 24px 40px",
        }}
      >
        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            marginBottom: "60px",
          }}
        >
          {/* Brand Ethos */}
          <div>
            <div style={{ marginBottom: "14px" }}>
              <img
                src="/assets/waak-logo.png"
                alt="WAAK Occasionwear"
                style={{
                  height: "38px",
                  width: "auto",
                  maxWidth: "140px",
                  objectFit: "contain",
                  display: "block",
                  filter: "brightness(1.15) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "13px",
                lineHeight: "1.8",
                color: "rgba(244, 239, 230, 0.8)",
                marginBottom: "20px",
                maxWidth: "300px",
              }}
            >
              Contemporary occasionwear, rooted in Indian heritage. Designed for the groom who commands authority.
            </p>
            <div style={{ fontSize: "12px", color: "var(--color-gold)", letterSpacing: "0.08em", marginBottom: "6px" }}>
              ENGLISH CHANNEL COMPANY · DELHI
            </div>
            <div style={{ fontSize: "11px", color: "rgba(244, 239, 230, 0.6)", lineHeight: "1.6" }}>
              37, Furniture Market, Gandhi Nagar, Delhi – 110033<br />
              GSTIN: 07AAGFE4560K1ZA
            </div>
          </div>

          {/* Collections */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--color-gold-light)",
                marginBottom: "18px",
                letterSpacing: "0.05em",
              }}
            >
              Collections
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
                color: "rgba(244, 239, 230, 0.8)",
              }}
            >
              <li>
                <button
                  onClick={() => handleCategoryClick("Kurta Sets")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Kurta Sets
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("Indian Wear")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Sherwanis & Indian Wear
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("Indo Western & Jodhpuri")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Indo Western & Jodhpuri
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("Suits & Blazers")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Suits & Blazers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("Waistcoats")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Waistcoats
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("All")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  All Occasionwear
                </button>
              </li>
            </ul>
          </div>

          {/* Bespoke & Client Services */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--color-gold-light)",
                marginBottom: "18px",
                letterSpacing: "0.05em",
              }}
            >
              Client Concierge
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
                color: "rgba(244, 239, 230, 0.8)",
              }}
            >
              <li>
                <button
                  onClick={() => navigateTo("/account")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Client Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("/contact")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Bespoke Wedding Consultation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("/shipping-policy")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Shipping & Transit Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("/returns-and-exchanges")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Returns & Exchanges (2-Day Window)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("/care-and-preservation")}
                  className="editorial-underline"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Care & Preservation Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--color-gold-light)",
                marginBottom: "14px",
                letterSpacing: "0.05em",
              }}
            >
              Private Curation
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(244, 239, 230, 0.75)",
                marginBottom: "16px",
                lineHeight: "1.6",
              }}
            >
              Receive invitations to new seasonal drops and private bridal atelier viewings.
            </p>
            <form onSubmit={handleNewsletterSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex" }}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                  aria-label="Email address for private atelier curation"
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(197, 162, 101, 0.3)",
                    color: "#fff",
                    padding: "10px 14px",
                    fontSize: "12px",
                    borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-burgundy-deep)",
                    fontWeight: 600,
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "0 16px",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    border: "none",
                    transition: "opacity 0.2s ease",
                  }}
                >
                  {isSubmitting ? "..." : "Join"}
                </button>
              </div>

              {feedback && (
                <div
                  role={feedback.type === "error" ? "alert" : "status"}
                  aria-live="polite"
                  style={{
                    fontSize: "11px",
                    color:
                      feedback.type === "error"
                        ? "#FCA5A5"
                        : feedback.type === "info"
                        ? "var(--color-gold-light)"
                        : "#86EFAC",
                    lineHeight: "1.4",
                    marginTop: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{feedback.type === "error" ? "⚠" : "◈"}</span>
                  <span>{feedback.message}</span>
                </div>
              )}

              <p style={{ fontSize: "10.5px", color: "rgba(244, 239, 230, 0.55)", marginTop: "6px", lineHeight: "1.4" }}>
                By submitting, you consent to receive seasonal atelier invitations. Unsubscribe anytime via our <button type="button" onClick={() => navigateTo("/privacy-policy")} style={{ background: "none", border: "none", color: "var(--color-gold-light)", textDecoration: "underline", padding: 0, fontSize: "inherit", cursor: "pointer" }}>Privacy Policy</button>.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom border & copyright & policy links */}
        <div
          style={{
            borderTop: "1px solid rgba(197, 162, 101, 0.15)",
            paddingTop: "24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            fontSize: "12px",
            color: "rgba(244, 239, 230, 0.6)",
          }}
        >
          <div>
            © 2026 WAAK OCCASIONWEAR (English Channel Company). All rights reserved. · GSTIN: 07AAGFE4560K1ZA
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <button
              onClick={() => navigateTo("/privacy-policy")}
              className="editorial-underline"
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: "12px" }}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigateTo("/terms-of-service")}
              className="editorial-underline"
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: "12px" }}
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigateTo("/shipping-policy")}
              className="editorial-underline"
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: "12px" }}
            >
              Shipping Policy
            </button>
            <button
              onClick={() => navigateTo("/returns-and-exchanges")}
              className="editorial-underline"
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: "12px" }}
            >
              Returns & Exchanges
            </button>
            <button
              onClick={() => navigateTo("/contact")}
              className="editorial-underline"
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: "12px" }}
            >
              Atelier Location
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
