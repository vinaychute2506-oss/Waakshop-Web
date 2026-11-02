import React, { useState } from "react"
import { useApp } from "../context/AppContext"

export default function Footer() {
  const { navigateTo, setActiveCategory } = useApp()
  const [emailInput, setEmailInput] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null)

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat)
    navigateTo("/")
    setTimeout(() => {
      const el = document.getElementById("collection-section")
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput) return
    setNewsletterStatus(`Thank you for registering ${emailInput}. Your interest has been recorded (Frontend Preview — Client integration pending).`)
    setEmailInput("")
    setTimeout(() => setNewsletterStatus(null), 5000)
  }

  return (
    <footer style={{
      backgroundColor: "var(--color-burgundy-deep)",
      color: "var(--color-cream)",
      borderTop: "1px solid rgba(197, 162, 101, 0.25)",
      marginTop: "80px"
    }}>
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "70px 24px 40px"
      }}>
        {/* Top grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
          marginBottom: "60px"
        }}>
          {/* Brand Ethos */}
          <div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "var(--color-gold-light)",
              marginBottom: "12px"
            }}>
              WAAK
            </div>
            <p style={{
              fontSize: "13px",
              lineHeight: "1.8",
              color: "rgba(244, 239, 230, 0.8)",
              marginBottom: "20px",
              maxWidth: "300px"
            }}>
              Contemporary occasionwear, rooted in Indian heritage. Designed for the groom who commands authority.
            </p>
            <div style={{ fontSize: "12px", color: "var(--color-gold)", letterSpacing: "0.1em" }}>
              NEW DELHI · FLAGSHIP ATELIER
            </div>
          </div>

          {/* Collections */}
          <div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--color-gold-light)",
              marginBottom: "18px",
              letterSpacing: "0.05em"
            }}>
              Collections
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "rgba(244, 239, 230, 0.8)" }}>
              <li><button onClick={() => handleCategoryClick("Kurta Sets")} className="editorial-underline" style={{ color: "inherit", cursor: "pointer" }}>Kurta Sets</button></li>
              <li><button onClick={() => handleCategoryClick("Indian Wear")} className="editorial-underline" style={{ color: "inherit", cursor: "pointer" }}>Sherwanis & Indian Wear</button></li>
              <li><button onClick={() => handleCategoryClick("Indo Western & Jodhpuri")} className="editorial-underline" style={{ color: "inherit", cursor: "pointer" }}>Indo Western & Jodhpuri</button></li>
              <li><button onClick={() => handleCategoryClick("Suits & Blazers")} className="editorial-underline" style={{ color: "inherit", cursor: "pointer" }}>Suits & Blazers</button></li>
              <li><button onClick={() => handleCategoryClick("Waistcoats")} className="editorial-underline" style={{ color: "inherit", cursor: "pointer" }}>Waistcoats</button></li>
              <li><button onClick={() => handleCategoryClick("All")} className="editorial-underline" style={{ color: "inherit", cursor: "pointer" }}>All Occasionwear</button></li>
            </ul>
          </div>

          {/* Bespoke & Client Services */}
          <div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--color-gold-light)",
              marginBottom: "18px",
              letterSpacing: "0.05em"
            }}>
              Client Concierge
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "rgba(244, 239, 230, 0.8)" }}>
              <li><button onClick={() => navigateTo("/account")} className="editorial-underline" style={{ color: "inherit", cursor: "pointer" }}>Client Account</button></li>
              <li><span style={{ color: "inherit" }}>Bespoke Wedding Consultation</span></li>
              <li><span style={{ color: "inherit" }}>Complimentary Size Customisation</span></li>
              <li><span style={{ color: "inherit" }}>Express Domestic Shipping</span></li>
              <li><span style={{ color: "inherit" }}>Care & Preservation</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--color-gold-light)",
              marginBottom: "14px",
              letterSpacing: "0.05em"
            }}>
              Private Curation
            </div>
            <p style={{ fontSize: "12px", color: "rgba(244, 239, 230, 0.75)", marginBottom: "16px", lineHeight: "1.6" }}>
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
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(197, 162, 101, 0.3)",
                    color: "#fff",
                    padding: "10px 14px",
                    fontSize: "12px",
                    borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
                    outline: "none"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-burgundy-deep)",
                    fontWeight: 600,
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "0 16px",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                    cursor: "pointer"
                  }}
                >
                  Join
                </button>
              </div>
              {newsletterStatus && (
                <div style={{
                  fontSize: "11px",
                  color: "var(--color-gold-light)",
                  lineHeight: "1.4",
                  marginTop: "4px"
                }}>
                  {newsletterStatus}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom border & copyright */}
        <div style={{
          borderTop: "1px solid rgba(197, 162, 101, 0.15)",
          paddingTop: "24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          fontSize: "12px",
          color: "rgba(244, 239, 230, 0.6)"
        }}>
          <div>
            © 2026 WAAK OCCASIONWEAR. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Atelier Location</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
