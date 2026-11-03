import React, { useState, useEffect } from "react"
import { useApp } from "./context/AppContext"
import { PRODUCTS, Product } from "./data/products"
import { api } from "./services/api"

export default function ProductDetail() {
  const { selectedProduct, selectedProductId, findProduct, products, addToCart, wishlist, toggleWishlist, navigateTo } = useApp()
  const product: Product | undefined = selectedProduct || (selectedProductId ? findProduct(selectedProductId) : products[0])

  const [activeImage, setActiveImage] = useState<string>(product ? product.image : "")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [openAccordion, setOpenAccordion] = useState<string>("description")
  const [addedNotice, setAddedNotice] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string>("")
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false)

  // Backend variants state
  const [backendVariants, setBackendVariants] = useState<any[] | null>(null)
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false)

  const isWishlisted = product ? wishlist.includes(product.id) : false

  // Fetch authoritative variants from backend whenever product changes
  useEffect(() => {
    if (!product) return
    let isMounted = true
    setActiveImage(product.image)
    setValidationError("")
    setQuantity(1)

    const targetId = product.backendId || product.id
    if (targetId && product.isAvailableInBackend) {
      setLoadingVariants(true)
      api.products.get(targetId)
        .then((res) => {
          if (isMounted && res.product?.variants) {
            setBackendVariants(res.product.variants)
            const inStock = res.product.variants.filter((v: any) => v.stock_quantity > 0)
            if (inStock.some((v: any) => v.size === "40")) {
              setSelectedSize("40")
            } else if (inStock.length > 0) {
              setSelectedSize(inStock[0].size)
            } else {
              setSelectedSize("")
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            // Fallback to static product catalog availableSizes
            const staticSizes = product.availableSizes || ["38", "40", "42", "44"]
            if (staticSizes.includes("40")) {
              setSelectedSize("40")
            } else if (staticSizes.length > 0) {
              setSelectedSize(staticSizes[0])
            } else {
              setSelectedSize("")
            }
          }
        })
        .finally(() => {
          if (isMounted) setLoadingVariants(false)
        })
    } else {
      setBackendVariants(null)
      setSelectedSize("")
    }

    return () => { isMounted = false }
  }, [product?.id, product?.backendId])

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px", minHeight: "60vh", backgroundColor: "var(--color-cream-light, #fbf8f2)" }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-gold, #C5A265)", fontWeight: 600 }}>
          WAAK Atelier Archive
        </span>
        <h2 style={{ fontFamily: "var(--font-serif, 'Cinzel', serif)", fontSize: "32px", color: "var(--color-burgundy, #5A121A)", margin: "16px 0" }}>
          Silhouette Not Found
        </h2>
        <p style={{ color: "var(--color-muted, #7A6258)", maxWidth: "480px", margin: "0 auto 24px", fontSize: "14px" }}>
          The garment reference you requested is not present in our current seasonal showcase.
        </p>
        <button
          onClick={() => navigateTo("/")}
          style={{
            backgroundColor: "var(--color-burgundy, #5A121A)",
            color: "#fff",
            padding: "12px 28px",
            border: "none",
            borderRadius: "2px",
            fontSize: "12px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Return to Collection
        </button>
      </div>
    )
  }

  // Derive available sizes from backend or static catalog
  const effectiveSizes = backendVariants
    ? backendVariants.map((v) => v.size)
    : (product.availableSizes || ["38", "40", "42", "44"])

  // Related products
  const relatedProducts = products.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.occasion === product.occasion)
  ).slice(0, 4)

  const handleAddToCart = () => {
    setValidationError("")

    if (!product.isAvailableInBackend) {
      setValidationError("This bespoke silhouette is part of our private archive. Please consult our atelier director for custom creation.")
      return
    }

    if (!selectedSize) {
      setValidationError("Please select an available chest size before adding to your shopping bag.")
      return
    }

    // Verify stock availability if variants are loaded
    if (backendVariants) {
      const variant = backendVariants.find((v) => v.size === selectedSize)
      if (variant && variant.stock_quantity < quantity) {
        setValidationError(`Only ${variant.stock_quantity} pieces available in size ${selectedSize}.`)
        return
      }
    }

    addToCart(product, selectedSize, quantity)
    setAddedNotice(true)
    setTimeout(() => setAddedNotice(false), 3500)
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
        <button onClick={() => navigateTo("/")} style={{ color: "var(--color-muted)", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
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
            {!product.isAvailableInBackend && (
              <span style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                backgroundColor: "rgba(10, 10, 10, 0.85)",
                color: "var(--color-gold)",
                border: "1px solid var(--color-gold)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                textTransform: "uppercase"
              }}>
                Atelier Archive
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

          {/* Sizing & Variant Selection */}
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
                Select Chest Size: {selectedSize ? (
                  <strong style={{ color: "var(--color-burgundy)" }}>Size {selectedSize}</strong>
                ) : (
                  <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(Choose below)</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                style={{
                  fontSize: "11px",
                  color: "var(--color-gold-dark)",
                  textDecoration: "underline",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0
                }}
              >
                Size Guide & Measurements
              </button>
            </div>

            {loadingVariants ? (
              <div style={{ fontSize: "12px", color: "var(--color-muted)", padding: "12px 0" }}>
                Checking atelier availability...
              </div>
            ) : (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {effectiveSizes.map((s) => {
                  const isSelected = selectedSize === s
                  const variantInfo = backendVariants?.find((v) => v.size === s)
                  const isOutOfStock = variantInfo ? variantInfo.stock_quantity <= 0 : false

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(s)
                        setValidationError("")
                      }}
                      title={isOutOfStock ? `Size ${s} currently out of stock in atelier` : `Select Size ${s}`}
                      style={{
                        minWidth: "54px",
                        height: "48px",
                        padding: "0 12px",
                        borderRadius: "var(--radius-sm)",
                        border: isSelected
                          ? "2px solid var(--color-burgundy)"
                          : isOutOfStock
                          ? "1px dashed var(--color-border)"
                          : "1px solid var(--color-border)",
                        backgroundColor: isSelected
                          ? "var(--color-burgundy)"
                          : isOutOfStock
                          ? "rgba(0,0,0,0.04)"
                          : "var(--color-cream-light)",
                        color: isSelected
                          ? "#fff"
                          : isOutOfStock
                          ? "var(--color-muted)"
                          : "var(--color-charcoal)",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.45 : 1,
                        textDecoration: isOutOfStock ? "line-through" : "none",
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
            )}

            {validationError && (
              <div style={{
                marginTop: "12px",
                backgroundColor: "rgba(211, 47, 47, 0.08)",
                border: "1px solid rgba(211, 47, 47, 0.3)",
                color: "#c62828",
                fontSize: "12px",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                animation: "toastEntrance 0.3s ease-out"
              }}>
                ⚠ {validationError}
              </div>
            )}
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
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: "0 14px", height: "48px", fontSize: "16px", color: "var(--color-charcoal)", cursor: "pointer", background: "none", border: "none" }}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span style={{ padding: "0 10px", fontWeight: 600, fontSize: "14px", minWidth: "24px", textAlign: "center" }}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: "0 14px", height: "48px", fontSize: "16px", color: "var(--color-charcoal)", cursor: "pointer", background: "none", border: "none" }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  backgroundColor: addedNotice
                    ? "var(--color-terracotta)"
                    : product.isAvailableInBackend
                    ? "var(--color-burgundy)"
                    : "#333",
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
                  gap: "8px",
                  border: "none"
                }}
              >
                {addedNotice ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Added To Bag
                  </>
                ) : product.isAvailableInBackend ? (
                  "Add To Bag"
                ) : (
                  "Consult Atelier"
                )}
              </button>
            </div>

            {/* Wishlist toggle */}
            <button
              type="button"
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
                ✓ Added {quantity} × {product.name} (Size {selectedSize}) to your shopping bag
              </div>
            )}
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />

          {/* Accordions */}
          <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid var(--color-border)" }}>
            {/* 1. Description */}
            <div style={{ borderBottom: "1px solid var(--color-border)" }}>
              <button
                type="button"
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
                  color: "var(--color-charcoal)",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
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
                type="button"
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
                  color: "var(--color-charcoal)",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
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
                    <li>Avoid direct iron on gold zardozi threadwork</li>
                  </ul>
                </div>
              )}
            </div>

            {/* 3. Shipping & Returns */}
            <div style={{ borderBottom: "1px solid var(--color-border)" }}>
              <button
                type="button"
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
                  color: "var(--color-charcoal)",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <span>Shipping, Delivery & Returns</span>
                <span style={{ fontSize: "18px" }}>{openAccordion === "shipping" ? "−" : "+"}</span>
              </button>
              {openAccordion === "shipping" && (
                <div style={{ paddingBottom: "16px", fontSize: "14px", lineHeight: "1.7", color: "var(--color-charcoal)" }}>
                  <p>{product.shipping}</p>
                  <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--color-muted)" }}>
                    We offer a 7-day complimentary bespoke exchange and size alteration service. Custom fitted pieces are crafted to your exact measurements.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bespoke Size Guide Modal */}
      {sizeGuideOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(10, 5, 5, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "var(--color-cream-light, #fbf8f2)",
            border: "1px solid var(--color-border-gold, #C5A265)",
            borderRadius: "6px",
            maxWidth: "520px",
            width: "100%",
            padding: "32px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-gold-dark)" }}>
                  Atelier Sizing Guide
                </span>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--color-burgundy)", margin: "4px 0 0" }}>
                  Occasionwear Chest Measurements
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                style={{ background: "none", border: "none", fontSize: "24px", color: "var(--color-muted)", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "20px", lineHeight: 1.6 }}>
              WAAK occasionwear jackets, sherwanis, and bandhgalas are tailored to true chest circumference. For layered wear over a kurta, choose your standard chest measure.
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "20px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border-gold, #C5A265)", textAlign: "left" }}>
                  <th style={{ padding: "8px 4px", color: "var(--color-burgundy)" }}>Size</th>
                  <th style={{ padding: "8px 4px", color: "var(--color-burgundy)" }}>Chest (Inches)</th>
                  <th style={{ padding: "8px 4px", color: "var(--color-burgundy)" }}>Chest (cm)</th>
                  <th style={{ padding: "8px 4px", color: "var(--color-burgundy)" }}>Shoulder</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "10px 4px", fontWeight: 700 }}>38</td>
                  <td style={{ padding: "10px 4px" }}>38" (96.5 cm)</td>
                  <td style={{ padding: "10px 4px" }}>96–99 cm</td>
                  <td style={{ padding: "10px 4px" }}>17.5"</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(197, 162, 101, 0.08)" }}>
                  <td style={{ padding: "10px 4px", fontWeight: 700, color: "var(--color-burgundy)" }}>40</td>
                  <td style={{ padding: "10px 4px", fontWeight: 600 }}>40" (101.5 cm)</td>
                  <td style={{ padding: "10px 4px" }}>101–104 cm</td>
                  <td style={{ padding: "10px 4px" }}>18.0"</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "10px 4px", fontWeight: 700 }}>42</td>
                  <td style={{ padding: "10px 4px" }}>42" (106.5 cm)</td>
                  <td style={{ padding: "10px 4px" }}>106–109 cm</td>
                  <td style={{ padding: "10px 4px" }}>18.5"</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "10px 4px", fontWeight: 700 }}>44</td>
                  <td style={{ padding: "10px 4px" }}>44" (111.5 cm)</td>
                  <td style={{ padding: "10px 4px" }}>111–114 cm</td>
                  <td style={{ padding: "10px 4px" }}>19.0"</td>
                </tr>
              </tbody>
            </table>

            <div style={{ backgroundColor: "var(--color-cream, #F4EFE6)", padding: "12px", borderRadius: "4px", fontSize: "11px", color: "var(--color-muted)", marginBottom: "20px" }}>
              ✦ <strong>Bespoke Tailoring:</strong> Complimentary personal master-tailor fitting and custom drape adjustments are included with every commission.
            </div>

            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              style={{
                width: "100%",
                backgroundColor: "var(--color-burgundy)",
                color: "#fff",
                border: "none",
                padding: "12px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: "2px"
              }}
            >
              Return to Selection
            </button>
          </div>
        </div>
      )}

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
