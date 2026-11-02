import React, { useState } from "react"
import { useApp } from "./context/AppContext"
import { PRODUCTS } from "./data/products"

export default function ProductDetail() {
  const { selectedProduct, addToCart, wishlist, toggleWishlist, navigateTo } = useApp()
  const product = selectedProduct || PRODUCTS[0]

  const [activeImage, setActiveImage] = useState<string>(product.image)
  const [selectedSize, setSelectedSize] = useState<string>("M")
  const [quantity, setQuantity] = useState<number>(1)
  const [openAccordion, setOpenAccordion] = useState<string>("description")
  const [addedNotice, setAddedNotice] = useState<boolean>(false)

  const isWishlisted = wishlist.includes(product.id)
  const sizes = ["S", "M", "L", "XL", "XXL"]

  // Related products
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id && (p.category === product.category || p.occasion === product.occasion)).slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity)
    setAddedNotice(true)
    setTimeout(() => setAddedNotice(false), 3000)
  }

  const toggleAccordion = (name: string) => {
    setOpenAccordion(openAccordion === name ? "" : name)
  }

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Breadcrumb Navigation */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "11px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--color-muted)",
        marginBottom: "40px"
      }}>
        <button onClick={() => navigateTo("/")} style={{ color: "var(--color-muted)", cursor: "pointer" }}>
          Home
        </button>
        <span>/</span>
        <span style={{ color: "var(--color-muted)" }}>{product.category}</span>
        <span>/</span>
        <span style={{ color: "var(--color-burgundy)", fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "64px",
        alignItems: "start",
        marginBottom: "80px"
      }} className="product-detail-grid">

        {/* Left: Product Images & Gallery */}
        <div>
          {/* Main Hero Image */}
          <div style={{
            position: "relative",
            width: "100%",
            aspectRatio: "3 / 4",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            backgroundColor: "var(--color-linen)",
            boxShadow: "var(--shadow-card)",
            marginBottom: "16px"
          }}>
            <img
              key={activeImage || product.image}
              src={activeImage || product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                animation: "imageFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            />
            {product.isSale && (
              <span style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                backgroundColor: "var(--color-burgundy)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                padding: "4px 12px",
                borderRadius: "var(--radius-sm)"
              }}>
                SALE
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div style={{
            display: "flex",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "8px"
          }}>
            {product.gallery.map((imgUrl, idx) => {
              const isSelected = (activeImage || product.image) === imgUrl
              return (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  style={{
                    width: "80px",
                    height: "104px",
                    flex: "0 0 auto",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: isSelected ? "2px solid var(--color-burgundy)" : "1px solid var(--color-border-light)",
                    boxShadow: isSelected ? "0 0 0 1px var(--color-gold), 0 4px 12px rgba(90, 18, 26, 0.2)" : "none",
                    opacity: isSelected ? 1 : 0.7,
                    transition: "var(--transition-smooth)",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Product Information & Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <div style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-gold-dark)",
              marginBottom: "8px"
            }}>
              WAAK / {product.subcategory.toUpperCase()}
            </div>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "36px",
              fontWeight: 500,
              color: "var(--color-charcoal)",
              lineHeight: "1.2",
              marginBottom: "14px"
            }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{
                fontFamily: "var(--font-serif)",
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--color-burgundy)"
              }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span style={{
                  fontSize: "16px",
                  color: "var(--color-muted)",
                  textDecoration: "line-through"
                }}>
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {product.isSale && (
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-burgundy)" }}>
                  (Special Price)
                </span>
              )}
            </div>
            <p style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "4px" }}>
              Inclusive of all taxes · Complimentary express domestic shipping
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />

          {/* Size Selector */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px"
            }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-charcoal)"
              }}>
                Select Size: <strong style={{ color: "var(--color-burgundy)" }}>{selectedSize}</strong>
              </span>
              <button
                onClick={() => alert("WAAK Sizing Guide: S (38), M (40), L (42), XL (44), XXL (46). Bespoke tailoring available.")}
                style={{
                  fontSize: "11px",
                  color: "var(--color-gold-dark)",
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
              >
                Size Guide & Measurements
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {sizes.map((s) => {
                const isSelected = selectedSize === s
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--radius-sm)",
                      border: isSelected ? "2px solid var(--color-burgundy)" : "1px solid var(--color-border)",
                      backgroundColor: isSelected ? "var(--color-burgundy)" : "var(--color-cream-light)",
                      color: isSelected ? "#fff" : "var(--color-charcoal)",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 4px 12px rgba(90, 18, 26, 0.25)" : "none",
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                      transition: "var(--transition-smooth)"
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              {/* Quantity selector */}
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-cream-light)"
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: "0 14px", height: "48px", fontSize: "16px", color: "var(--color-charcoal)", cursor: "pointer" }}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span style={{ padding: "0 10px", fontWeight: 600, fontSize: "14px", minWidth: "24px", textAlign: "center" }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: "0 14px", height: "48px", fontSize: "16px", color: "var(--color-charcoal)", cursor: "pointer" }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  backgroundColor: addedNotice ? "var(--color-terracotta)" : "var(--color-burgundy)",
                  color: "var(--color-cream-light)",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  height: "48px",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "0 4px 16px rgba(90, 18, 26, 0.25)",
                  transition: "var(--transition-smooth)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {addedNotice ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Added To Bag
                  </>
                ) : (
                  "Add To Bag"
                )}
              </button>
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product.id)}
              style={{
                width: "100%",
                height: "46px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: isWishlisted ? "rgba(90, 18, 26, 0.08)" : "transparent",
                color: isWishlisted ? "var(--color-burgundy)" : "var(--color-charcoal)",
                fontWeight: 600,
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "var(--transition-smooth)"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {isWishlisted ? "Saved in Wishlist" : "Save to Wishlist"}
            </button>

            {addedNotice && (
              <div style={{
                backgroundColor: "rgba(197, 162, 101, 0.15)",
                border: "1px solid var(--color-gold)",
                color: "var(--color-burgundy)",
                fontSize: "12px",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                textAlign: "center",
                fontWeight: 500,
                animation: "toastEntrance 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}>
                ✓ Added {quantity} × {product.name} ({selectedSize}) to your shopping bag
              </div>
            )}
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />

          {/* Accordions */}
          <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid var(--color-border)" }}>
            {/* 1. Description */}
            <div style={{ borderBottom: "1px solid var(--color-border)" }}>
              <button
                onClick={() => toggleAccordion("description")}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-charcoal)"
                }}
              >
                <span>Product Description</span>
                <span style={{ fontSize: "18px" }}>{openAccordion === "description" ? "−" : "+"}</span>
              </button>
              {openAccordion === "description" && (
                <div style={{ paddingBottom: "16px", fontSize: "14px", lineHeight: "1.7", color: "var(--color-charcoal)" }}>
                  {product.description}
                </div>
              )}
            </div>

            {/* 2. Fabric & Care */}
            <div style={{ borderBottom: "1px solid var(--color-border)" }}>
              <button
                onClick={() => toggleAccordion("fabric")}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-charcoal)"
                }}
              >
                <span>Fabric & Artisanal Details</span>
                <span style={{ fontSize: "18px" }}>{openAccordion === "fabric" ? "−" : "+"}</span>
              </button>
              {openAccordion === "fabric" && (
                <div style={{ paddingBottom: "16px", fontSize: "14px", lineHeight: "1.7", color: "var(--color-charcoal)" }}>
                  <p>{product.fabric}</p>
                  <ul style={{ listStyle: "disc", paddingLeft: "20px", marginTop: "8px", fontSize: "13px", color: "var(--color-muted)" }}>
                    <li>Professional dry clean only</li>
                    <li>Store in breathable cotton garment bag provided</li>
                    <li>Avoid direct iron on gold threadwork</li>
                  </ul>
                </div>
              )}
            </div>

            {/* 3. Shipping & Returns */}
            <div style={{ borderBottom: "1px solid var(--color-border)" }}>
              <button
                onClick={() => toggleAccordion("shipping")}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-charcoal)"
                }}
              >
                <span>Shipping, Delivery & Returns</span>
                <span style={{ fontSize: "18px" }}>{openAccordion === "shipping" ? "−" : "+"}</span>
              </button>
              {openAccordion === "shipping" && (
                <div style={{ paddingBottom: "16px", fontSize: "14px", lineHeight: "1.7", color: "var(--color-charcoal)" }}>
                  <p>{product.shipping}</p>
                  <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--color-muted)" }}>
                    We offer a 7-day hassle-free exchange and size alteration service on standard sizes. Custom bespoke pieces are crafted to your exact specifications.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-burgundy)",
              display: "block",
              marginBottom: "8px"
            }}>
              COMPLEMENTARY SILHOUETTES
            </span>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "32px",
              fontWeight: 500,
              color: "var(--color-charcoal)"
            }}>
              You May Also Admire
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px"
          }}>
            {relatedProducts.map((rel) => {
              const hasAlternate = Boolean(rel.gallery && rel.gallery[1])
              return (
                <div
                  key={rel.id}
                  onClick={() => {
                    navigateTo("/product", rel.id)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="product-card-standard"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    backgroundColor: "var(--color-cream-light)",
                    border: "1px solid var(--color-border-light)",
                    boxShadow: "var(--shadow-subtle)",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", overflow: "hidden", backgroundColor: "var(--color-linen)" }}>
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className={`card-primary-img ${hasAlternate ? "has-hover" : ""}`}
                      loading="lazy"
                    />
                    {hasAlternate && (
                      <img
                        src={rel.gallery[1]}
                        alt={`${rel.name} alternate view`}
                        className="card-hover-img"
                        loading="lazy"
                      />
                    )}
                  </div>
                <div style={{ padding: "16px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", color: "var(--color-gold-dark)", textTransform: "uppercase" }}>
                    {rel.category}
                  </span>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "15px", fontWeight: 600, color: "var(--color-charcoal)", margin: "4px 0" }}>
                    {rel.name}
                  </h3>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-burgundy)" }}>
                    ₹{rel.price.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 900px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  )
}
