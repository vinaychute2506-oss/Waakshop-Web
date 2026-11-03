import React, { useEffect } from "react"
import { useApp } from "../context/AppContext"

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, updateCartQuantity, removeFromCart, navigateTo, setIsCheckoutOpen } = useApp()

  // Body scroll locking and Escape key dismiss
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden"
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsCartOpen(false)
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isCartOpen, setIsCartOpen])

  if (!isCartOpen) return null

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      justifyContent: "flex-end"
    }}>
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(30, 20, 15, 0.6)",
          backdropFilter: "blur(4px)",
          animation: "drawerBackdropFade 0.3s ease-out"
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
        height: "100%",
        backgroundColor: "var(--color-cream-light)",
        boxShadow: "var(--shadow-deep)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
        animation: "drawerSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--color-border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            letterSpacing: "0.1em",
            fontWeight: 600,
            color: "var(--color-burgundy)"
          }}>
            SHOPPING BAG ({cart.reduce((t, i) => t + i.quantity, 0)})
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Shopping Bag"
            style={{
              padding: "8px",
              color: "var(--color-charcoal)",
              cursor: "pointer"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "var(--color-linen)",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-burgundy)"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                </svg>
              </div>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--color-burgundy)",
                marginBottom: "8px"
              }}>
                Your bag is empty
              </p>
              <p style={{ fontSize: "13px", color: "var(--color-muted)", marginBottom: "24px" }}>
                Explore our occasionwear collection to find your piece.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  backgroundColor: "var(--color-burgundy)",
                  color: "var(--color-cream-light)",
                  padding: "12px 24px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  borderRadius: "var(--radius-sm)"
                }}
              >
                Discover Collection
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.size}-${index}`}
                  style={{
                    display: "flex",
                    gap: "16px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid var(--color-border)"
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{
                      width: "80px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--color-linen)"
                    }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div
                        onClick={() => {
                          setIsCartOpen(false)
                          navigateTo(`/product`, item.product.id)
                        }}
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "var(--color-charcoal)",
                          cursor: "pointer",
                          marginBottom: "4px"
                        }}
                      >
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "4px" }}>
                        Size: <strong style={{ color: "var(--color-charcoal)" }}>{item.size}</strong>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-burgundy)" }}>
                        ₹{item.product.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-cream)"
                      }}>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity - 1)}
                          style={{ padding: "2px 8px", fontSize: "14px", color: "var(--color-charcoal)", cursor: "pointer" }}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span style={{ padding: "0 8px", fontSize: "12px", fontWeight: 600 }}>{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1)}
                          style={{ padding: "2px 8px", fontSize: "14px", color: "var(--color-charcoal)", cursor: "pointer" }}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.08em",
                          color: "var(--color-muted)",
                          textDecoration: "underline",
                          cursor: "pointer"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--color-border-light)",
            backgroundColor: "var(--color-cream)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: "14px"
            }}>
              <span style={{ color: "var(--color-muted)" }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-burgundy)" }}>
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-muted)", marginBottom: "16px" }}>
              Taxes and complimentary express shipping calculated at checkout.
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
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
                marginBottom: "8px",
                transition: "var(--transition-smooth)",
                cursor: "pointer"
              }}
            >
              Proceed to Bespoke Checkout
            </button>
            <p style={{ fontSize: "10px", color: "var(--color-muted)", textAlign: "center" }}>
              Secure Atelier Checkout · Razorpay Payment Gateway (Test Mode)
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes drawerSlideIn {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        @keyframes drawerBackdropFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
