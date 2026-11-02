import React, { useEffect } from "react"
import { useApp } from "../context/AppContext"
import { PRODUCTS } from "../data/products"

export default function WishlistDrawer() {
  const { isWishlistOpen, setIsWishlistOpen, wishlist, toggleWishlist, addToCart, navigateTo } = useApp()

  // Body scroll locking and Escape key dismiss
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = "hidden"
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsWishlistOpen(false)
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isWishlistOpen, setIsWishlistOpen])

  if (!isWishlistOpen) return null

  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id))

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
        onClick={() => setIsWishlistOpen(false)}
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
            WISHLIST ({wishlistProducts.length})
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close Wishlist"
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
          {wishlistProducts.length === 0 ? (
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
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--color-burgundy)",
                marginBottom: "8px"
              }}>
                Your wishlist is empty
              </p>
              <p style={{ fontSize: "13px", color: "var(--color-muted)", marginBottom: "24px" }}>
                Tap the heart on any piece to save your bespoke favorites.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    gap: "16px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid var(--color-border)"
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
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
                          setIsWishlistOpen(false)
                          navigateTo(`/product`, product.id)
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
                        {product.name}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-burgundy)", marginBottom: "8px" }}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <button
                        onClick={() => {
                          addToCart(product, "M")
                          toggleWishlist(product.id)
                        }}
                        style={{
                          backgroundColor: "var(--color-burgundy)",
                          color: "#fff",
                          padding: "6px 14px",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          borderRadius: "var(--radius-sm)"
                        }}
                      >
                        Add to Bag
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        style={{
                          fontSize: "11px",
                          color: "var(--color-muted)",
                          textDecoration: "underline"
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
