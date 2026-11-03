import React, { useState, useEffect } from "react"
import { useApp } from "./context/AppContext"
import { api } from "./services/api"

export default function Account() {
  const { navigateTo } = useApp()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])

  // Load existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("waak_customer_token")
    if (token) {
      loadCustomerSession()
    }
  }, [])

  const loadCustomerSession = async () => {
    try {
      setLoading(true)
      const cust = await api.auth.me()
      setCustomer(cust)
      setIsLoggedIn(true)

      const historyData = await api.orders.getHistory().catch(() => ({ orders: [] }))
      setOrders(historyData.orders || [])

      const addrData = await api.customer.getAddresses().catch(() => ({ addresses: [] }))
      setAddresses(addrData.addresses || [])
    } catch (err) {
      console.warn("Session restore failed, clearing token:", err)
      api.auth.logout()
      setIsLoggedIn(false)
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true)

    try {
      if (isRegister) {
        const parts = name.trim().split(" ")
        const firstName = parts[0] || name
        const lastName = parts.slice(1).join(" ") || ""
        await api.auth.register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
        })
      } else {
        await api.auth.login({ email, password })
      }

      await loadCustomerSession()
    } catch (err: any) {
      setFormError(err.message || "Authentication failed. Please verify your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    api.auth.logout()
    setIsLoggedIn(false)
    setCustomer(null)
    setOrders([])
    setAddresses([])
    setEmail("")
    setPassword("")
    setName("")
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you wish to cancel this bespoke order? Restored stock will return to the Atelier.")) {
      return
    }
    try {
      await api.orders.cancel(orderId)
      // Refresh order history
      const historyData = await api.orders.getHistory()
      setOrders(historyData.orders || [])
    } catch (err: any) {
      alert(err.message || "Failed to cancel order")
    }
  }

  const fillDemoCredentials = () => {
    setEmail("client@waak.in")
    setPassword("waakClient2026!")
    setFormError("")
  }

  return (
    <div style={{
      maxWidth: "680px",
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
        <button onClick={() => navigateTo("/")} style={{ color: "var(--color-muted)", cursor: "pointer", background: "none", border: "none" }}>
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
      }}>
        {isLoggedIn ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "rgba(197, 162, 101, 0.2)",
                color: "var(--color-burgundy)",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--color-gold)"
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
                marginBottom: "6px"
              }}>
                Welcome, {customer?.first_name || customer?.email?.split('@')[0] || "Client"}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>
                Atelier Client ID: <strong>{customer?.id}</strong> · {customer?.email}
              </p>
            </div>

            {/* Live Order Activity */}
            <div style={{
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
              marginBottom: "28px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                borderBottom: "1px solid var(--color-border-light)",
                paddingBottom: "10px"
              }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--color-gold-dark)", textTransform: "uppercase" }}>
                  Live Order Activity ({orders.length})
                </span>
                <span style={{ fontSize: "11px", color: "#2e7d32", fontWeight: 600 }}>
                  Connected to PostgreSQL
                </span>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: "13px", color: "var(--color-charcoal)", marginBottom: "4px" }}>
                    No bespoke orders placed yet.
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--color-muted)" }}>
                    Items checked out through your shopping bag will be tracked here in real time.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {orders.map((ord: any) => (
                    <div
                      key={ord.id}
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid var(--color-border-light)",
                        borderRadius: "4px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <strong style={{ color: "var(--color-burgundy)", fontSize: "14px" }}>{ord.display_id}</strong>
                          <span style={{ fontSize: "11px", color: "var(--color-muted)", marginLeft: "8px" }}>
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "2px",
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            backgroundColor: ord.payment_status === "captured" ? "rgba(46, 125, 50, 0.15)" : "rgba(239, 108, 0, 0.15)",
                            color: ord.payment_status === "captured" ? "#2e7d32" : "#ef6c00",
                            border: `1px solid ${ord.payment_status === "captured" ? "#2e7d32" : "#ef6c00"}`
                          }}>
                            {ord.payment_status === "captured" ? "Paid (Razorpay)" : ord.payment_status}
                          </span>
                          <span style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "2px",
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            backgroundColor: ord.status === "cancelled" ? "rgba(211, 47, 47, 0.15)" : "rgba(21, 101, 192, 0.15)",
                            color: ord.status === "cancelled" ? "#d32f2f" : "#1565c0",
                            border: `1px solid ${ord.status === "cancelled" ? "#d32f2f" : "#1565c0"}`
                          }}>
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: "12px", color: "var(--color-charcoal)", marginBottom: "10px" }}>
                        {(ord.items || []).map((it: any, idx: number) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
                            <span>{it.title} (Size {it.size}) × {it.quantity}</span>
                            <span>₹{(it.unit_price * it.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px dashed var(--color-border-light)",
                        paddingTop: "10px"
                      }}>
                        <div style={{ fontSize: "13px" }}>
                          Total: <strong style={{ color: "var(--color-burgundy)" }}>₹{ord.total?.toLocaleString("en-IN")}</strong>
                        </div>
                        {ord.status !== "cancelled" && ord.status !== "delivered" && (
                          <button
                            onClick={() => handleCancelOrder(ord.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#d32f2f",
                              fontSize: "11px",
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Delivery Addresses */}
            {addresses.length > 0 && (
              <div style={{
                backgroundColor: "var(--color-cream)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "20px",
                marginBottom: "28px"
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--color-gold-dark)", textTransform: "uppercase", marginBottom: "12px" }}>
                  Saved Delivery Address
                </div>
                {addresses.map((a: any) => (
                  <div key={a.id} style={{ fontSize: "13px", color: "var(--color-charcoal)", lineHeight: 1.6 }}>
                    <div><strong>{a.first_name} {a.last_name}</strong> {a.is_default && <span style={{ fontSize: "10px", color: "var(--color-gold-dark)" }}>(Default)</span>}</div>
                    <div>{a.address_1} {a.address_2 ? `, ${a.address_2}` : ""}</div>
                    <div>{a.city}, {a.state} {a.postal_code}</div>
                    {a.phone && <div style={{ color: "var(--color-muted)", fontSize: "12px" }}>Phone: {a.phone}</div>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => navigateTo("/")}
                style={{
                  flex: 1,
                  backgroundColor: "var(--color-burgundy)",
                  color: "#fff",
                  padding: "14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Browse Collection
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "14px 24px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--color-muted)",
                  background: "#fff",
                  cursor: "pointer"
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
              marginBottom: "8px",
              textAlign: "center"
            }}>
              WAAK
            </div>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "26px",
              fontWeight: 500,
              color: "var(--color-charcoal)",
              marginBottom: "8px",
              textAlign: "center"
            }}>
              {isRegister ? "Create Your Atelier Profile" : "Welcome Back"}
            </h2>
            <p style={{
              fontSize: "13px",
              color: "var(--color-muted)",
              marginBottom: "28px",
              textAlign: "center"
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
                <>
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aditya Singhania"
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
                    <label style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--color-charcoal)",
                      marginBottom: "6px"
                    }}>
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
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
                </>
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
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@waak.in"
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
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ fontSize: "11px", color: "var(--color-gold-dark)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
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
                disabled={loading}
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
                  cursor: loading ? "wait" : "pointer",
                  border: "none",
                  transition: "var(--transition-smooth)"
                }}
              >
                {loading ? "Authenticating..." : (isRegister ? "Create Account" : "Sign In")}
              </button>
            </form>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
              <button
                type="button"
                onClick={fillDemoCredentials}
                style={{
                  fontSize: "11px",
                  color: "var(--color-gold-dark)",
                  background: "none",
                  border: "1px dashed var(--color-gold)",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Auto-fill Seeded Client Account (client@waak.in)
              </button>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
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
                  cursor: "pointer",
                  background: "none",
                  border: "none"
                }}
              >
                {isRegister ? "Already have an account? Sign in" : "New to WAAK? Create an atelier account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
