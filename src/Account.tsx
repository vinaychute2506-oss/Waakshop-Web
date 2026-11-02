import React, { useState } from "react"
import { useApp } from "./context/AppContext"

export default function Account() {
  const { navigateTo } = useApp()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!email || !email.includes("@")) {
      setFormError("Please enter a valid email address.")
      return
    }

    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters.")
      return
    }

    if (isRegister && !name.trim()) {
      setFormError("Please enter your full name.")
      return
    }

    // Simulate successful frontend session
    setUserName(isRegister ? name : (email.split("@")[0] || "Client"))
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail("")
    setPassword("")
    setName("")
  }

  return (
    <div style={{
      maxWidth: "520px",
      margin: "60px auto 100px",
      padding: "0 24px"
    }}>
      {/* Breadcrumb */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "11px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--color-muted)",
        marginBottom: "32px"
      }}>
        <button onClick={() => navigateTo("/")} style={{ color: "var(--color-muted)", cursor: "pointer" }}>
          Home
        </button>
        <span>/</span>
        <span style={{ color: "var(--color-burgundy)", fontWeight: 600 }}>Client Account</span>
      </div>

      <div style={{
        backgroundColor: "var(--color-cream-light)",
        border: "1px solid var(--color-border-light)",
        borderRadius: "var(--radius-lg)",
        padding: "44px 36px",
        boxShadow: "var(--shadow-card)",
        textAlign: "center"
      }}>
        {isLoggedIn ? (
          <div>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(197, 162, 101, 0.2)",
              color: "var(--color-burgundy)",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "28px",
              fontWeight: 600,
              color: "var(--color-burgundy)",
              marginBottom: "8px"
            }}>
              Welcome, {userName}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", marginBottom: "28px" }}>
              Your private WAAK concierge profile is active.
            </p>

            <div style={{
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              textAlign: "left",
              marginBottom: "24px"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--color-gold-dark)", textTransform: "uppercase", marginBottom: "8px" }}>
                Recent Order Activity
              </div>
              <p style={{ fontSize: "13px", color: "var(--color-charcoal)" }}>
                No active bespoke orders at this time.
              </p>
              <p style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "4px" }}>
                Client preview · Authenticated atelier session simulated (Persistent user backend pending for production launch).
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => navigateTo("/")}
                style={{
                  flex: 1,
                  backgroundColor: "var(--color-burgundy)",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase"
                }}
              >
                Browse Collection
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "12px 20px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--color-muted)"
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              letterSpacing: "0.2em",
              fontWeight: 700,
              color: "var(--color-burgundy)",
              marginBottom: "8px"
            }}>
              WAAK
            </div>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "26px",
              fontWeight: 500,
              color: "var(--color-charcoal)",
              marginBottom: "8px"
            }}>
              {isRegister ? "Create Your Atelier Profile" : "Welcome Back"}
            </h2>
            <p style={{
              fontSize: "13px",
              color: "var(--color-muted)",
              marginBottom: "32px"
            }}>
              {isRegister ? "Join WAAK for bespoke curation and private bridal previews." : "A considered experience, tailored exclusively for you."}
            </p>

            {formError && (
              <div style={{
                backgroundColor: "rgba(90, 18, 26, 0.08)",
                border: "1px solid var(--color-burgundy)",
                color: "var(--color-burgundy)",
                fontSize: "12px",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "20px",
                textAlign: "left"
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "left" }}>
              {isRegister && (
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-charcoal)",
                    marginBottom: "6px"
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      fontSize: "13px",
                      backgroundColor: "var(--color-cream)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      outline: "none"
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-charcoal)",
                  marginBottom: "6px"
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    fontSize: "13px",
                    backgroundColor: "var(--color-cream)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-charcoal)"
                  }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ fontSize: "11px", color: "var(--color-gold-dark)", textDecoration: "underline" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    fontSize: "13px",
                    backgroundColor: "var(--color-cream)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    outline: "none"
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  backgroundColor: "var(--color-burgundy)",
                  color: "var(--color-cream-light)",
                  padding: "14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "0 4px 16px rgba(90, 18, 26, 0.25)",
                  marginTop: "8px",
                  cursor: "pointer",
                  transition: "var(--transition-smooth)"
                }}
              >
                {isRegister ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--color-border)" }}>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setFormError("")
                }}
                style={{
                  fontSize: "13px",
                  color: "var(--color-burgundy)",
                  fontWeight: 600,
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
              >
                {isRegister ? "Already have an account? Sign in" : "New to WAAK? Create an atelier account"}
              </button>
            </div>

            <p style={{ fontSize: "10.5px", color: "var(--color-muted)", marginTop: "16px" }}>
              Client preview · Authentication backend integration pending.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
