import React, { useState, useEffect, useRef, useCallback } from "react"
import { useApp } from "./context/AppContext"
import { Product } from "./data/products"
import { api } from "./services/api"
import WhatsAppInquiryButton from "./components/WhatsAppInquiryButton"

export default function ProductDetail() {
  const { selectedProduct, selectedProductId, findProduct, products, addToCart, wishlist, toggleWishlist, navigateTo } = useApp()
  const product: Product | undefined = selectedProduct || (selectedProductId ? findProduct(selectedProductId) : products[0])

  // Media & Gallery State
  const [activeImage, setActiveImage] = useState<string>(product ? product.image : "")
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({})

  // Variant & Sizing State
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [backendVariants, setBackendVariants] = useState<any[] | null>(null)
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false)

  // Feedback, Errors & Modals
  const [addedNotice, setAddedNotice] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string>("")
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false)

  // PIN Code Checker State
  const [checkPin, setCheckPin] = useState<string>("")
  const [pinCheckResult, setPinCheckResult] = useState<{ status: 'idle' | 'valid' | 'invalid'; message: string }>({
    status: 'idle',
    message: ''
  })

  // Sticky Purchase Bar State
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false)
  const mainBuyButtonRef = useRef<HTMLButtonElement | null>(null)
  const sizeGuideTriggerRef = useRef<HTMLButtonElement | null>(null)
  const sizeSelectorRef = useRef<HTMLDivElement | null>(null)

  // Accordions State (Multi-open or single-open)
  const [openAccordion, setOpenAccordion] = useState<string>("silhouette")
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const isWishlisted = product ? wishlist.includes(product.id) : false

  // Fallback local image resolver
  const getSafeImageUrl = useCallback((url: string, index = 0): string => {
    if (imageErrorMap[url]) {
      // Local fallback image mapped to canonical product or hero
      if (product?.id === 'waak-01') return '/assets/products/ivory-sherwani.jpg'
      if (product?.id === 'waak-02') return '/assets/products/midnight-sherwani.jpg'
      if (product?.id === 'waak-03') return '/assets/products/mauve-bandhgala.jpg'
      if (product?.id === 'waak-04') return '/assets/products/emerald-kurta.jpg'
      return '/assets/campaign-hero-palace.jpg'
    }
    return url || '/assets/campaign-hero-palace.jpg'
  }, [imageErrorMap, product?.id])

  // Build gallery array safely
  const galleryImages = product?.gallery && product.gallery.length > 0
    ? product.gallery
    : product?.image
    ? [product.image]
    : ['/assets/campaign-hero-palace.jpg']

  // Synchronize active image when product changes
  useEffect(() => {
    if (!product) return
    let isMounted = true
    setActiveImage(product.image)
    setActiveImageIndex(0)
    setValidationError("")
    setQuantity(1)
    setCheckPin("")
    setPinCheckResult({ status: 'idle', message: '' })

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

  // Sticky Bar Intersection Observer
  useEffect(() => {
    const target = mainBuyButtonRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when main button is scrolled out above the viewport
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { threshold: 0.1 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [product?.id])

  // Lightbox keyboard controls (Escape to close, Left/Right arrows to cycle)
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false)
      } else if (e.key === "ArrowRight") {
        handleNextImage()
      } else if (e.key === "ArrowLeft") {
        handlePrevImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isLightboxOpen, activeImageIndex, galleryImages.length])

  // Size guide modal focus management
  useEffect(() => {
    if (!sizeGuideOpen && sizeGuideTriggerRef.current) {
      sizeGuideTriggerRef.current.focus()
    }
  }, [sizeGuideOpen])

  // Gallery Navigation Handlers
  const handleNextImage = () => {
    const nextIdx = (activeImageIndex + 1) % galleryImages.length
    setActiveImageIndex(nextIdx)
    setActiveImage(galleryImages[nextIdx])
  }

  const handlePrevImage = () => {
    const prevIdx = (activeImageIndex - 1 + galleryImages.length) % galleryImages.length
    setActiveImageIndex(prevIdx)
    setActiveImage(galleryImages[prevIdx])
  }

  const selectThumbnail = (url: string, idx: number) => {
    setActiveImage(url)
    setActiveImageIndex(idx)
  }

  const handleImageError = (url: string) => {
    setImageErrorMap((prev) => ({ ...prev, [url]: true }))
  }

  // Graceful Missing Silhouette View
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

  // Derive available sizes & stock status
  const effectiveSizes = backendVariants
    ? backendVariants.map((v) => v.size)
    : (product.availableSizes || ["38", "40", "42", "44"])

  const selectedVariant = backendVariants?.find((v) => v.size === selectedSize)
  const isSelectedOutOfStock = selectedVariant ? selectedVariant.stock_quantity <= 0 : false

  // Real Calculated Discount
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price)
  const discountPercent = hasDiscount
    ? Math.round((((product.originalPrice! - product.price) / product.originalPrice!) * 100))
    : 0
  const savingsAmount = hasDiscount ? product.originalPrice! - product.price : 0

  // Related products (filtered by category/occasion)
  const relatedProducts = products.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.occasion === product.occasion)
  ).slice(0, 4)

  // Add to Cart Action
  const handleAddToCart = () => {
    setValidationError("")

    if (!product.isAvailableInBackend) {
      setValidationError("This bespoke silhouette is part of our private atelier archive. Please consult our atelier director for custom creation.")
      return
    }

    if (!selectedSize) {
      setValidationError("Please select an available chest size before adding to your shopping bag.")
      if (sizeSelectorRef.current) {
        sizeSelectorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    // Verify stock availability
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

  // PIN Code Verification Action
  const handleCheckPin = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = checkPin.trim()
    if (!/^\d{6}$/.test(cleaned)) {
      setPinCheckResult({
        status: 'invalid',
        message: 'Please enter a valid 6-digit Indian PIN code (e.g. 110001).'
      })
      return
    }

    // Honest verification: We validate format and confirm express coverage without fabricating courier API status
    setPinCheckResult({
      status: 'valid',
      message: `Valid Indian PIN format (${cleaned}). Complimentary express insured shipping across India. Standard atelier dispatch within 3–5 business days. Final transit schedule will be confirmed upon courier docket generation.`
    })
  }

  return (
    <div className="waak-product-detail-page">
      {/* 1. BREADCRUMB NAVIGATION */}
      <nav aria-label="Breadcrumb" className="pdp-breadcrumb">
        <button onClick={() => navigateTo("/")} className="pdp-breadcrumb-link">
          Home
        </button>
        <span className="pdp-breadcrumb-separator">/</span>
        <button
          onClick={() => {
            navigateTo("/")
          }}
          className="pdp-breadcrumb-link"
        >
          {product.category}
        </button>
        <span className="pdp-breadcrumb-separator">/</span>
        <span className="pdp-breadcrumb-current" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* 2. MAIN PRODUCT HERO GRID */}
      <div className="pdp-main-grid">
        {/* LEFT COLUMN: PREMIUM IMAGE GALLERY */}
        <div className="pdp-gallery-column">
          {/* Main Display Image */}
          <div className="pdp-main-image-wrap">
            <img
              key={activeImage}
              src={getSafeImageUrl(activeImage, activeImageIndex)}
              alt={`${product.name} - View ${activeImageIndex + 1} of ${galleryImages.length}`}
              className="pdp-main-image"
              onError={() => handleImageError(activeImage)}
              onClick={() => setIsLightboxOpen(true)}
              tabIndex={0}
              role="button"
              aria-label="Click to open full-screen high-resolution zoom"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setIsLightboxOpen(true)
                }
              }}
            />

            {/* Badges */}
            <div className="pdp-image-badges">
              {product.isSale && <span className="pdp-badge-sale">SALE</span>}
              {!product.isAvailableInBackend && (
                <span className="pdp-badge-archive">Atelier Archive</span>
              )}
            </div>

            {/* Gallery Navigation Arrows (When multiple images exist) */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevImage()
                  }}
                  className="pdp-gallery-nav pdp-gallery-nav-prev"
                  aria-label="Previous garment view"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextImage()
                  }}
                  className="pdp-gallery-nav pdp-gallery-nav-next"
                  aria-label="Next garment view"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {/* Fullscreen Zoom Cue Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="pdp-zoom-btn"
              aria-label="Open full-screen image viewer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>Inspect Craftsmanship</span>
            </button>
          </div>

          {/* Thumbnails Row */}
          {galleryImages.length > 1 && (
            <div className="pdp-thumbnails-strip" role="tablist" aria-label="Garment views">
              {galleryImages.map((imgUrl, idx) => {
                const isSelected = idx === activeImageIndex
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`View silhouette perspective ${idx + 1}`}
                    onClick={() => selectThumbnail(imgUrl, idx)}
                    className={`pdp-thumbnail-card ${isSelected ? "selected" : ""}`}
                  >
                    <img
                      src={getSafeImageUrl(imgUrl, idx)}
                      alt={`Thumbnail perspective ${idx + 1}`}
                      className="pdp-thumbnail-img"
                      onError={() => handleImageError(imgUrl)}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PRODUCT INFORMATION & COMMERCE ACTIONS */}
        <div className="pdp-info-column">
          {/* Header & Subtitle */}
          <div className="pdp-header-section">
            <div className="pdp-category-eyebrow">
              WAAK ATELIER · {product.category.toUpperCase()} {product.occasion ? `· ${product.occasion.toUpperCase()}` : ''}
            </div>
            <h1 className="pdp-title">{product.name}</h1>
            {product.subtitle && (
              <p className="pdp-subtitle">{product.subtitle}</p>
            )}

            {/* Authoritative Pricing */}
            <div className="pdp-price-row">
              <span className="pdp-price-selling">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="pdp-price-original">
                    ₹{product.originalPrice!.toLocaleString("en-IN")}
                  </span>
                  <span className="pdp-discount-pill">
                    {discountPercent}% OFF (Save ₹{savingsAmount.toLocaleString("en-IN")})
                  </span>
                </>
              )}
            </div>
            <p className="pdp-tax-notice">
              Inclusive of all taxes · Complimentary insured domestic dispatch
            </p>
          </div>

          <div className="pdp-divider" />

          {/* Sizing & Variant Selection */}
          <div ref={sizeSelectorRef} className="pdp-sizing-section">
            <div className="pdp-sizing-header">
              <span className="pdp-sizing-label">
                Chest Size:&nbsp;
                {selectedSize ? (
                  <strong className="pdp-selected-size-text">Size {selectedSize}</strong>
                ) : (
                  <span className="pdp-unselected-size-text">(Select chest measure)</span>
                )}
              </span>
              <button
                ref={sizeGuideTriggerRef}
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="pdp-size-guide-trigger"
                aria-haspopup="dialog"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                  <path d="M2 12h20M2 12l5-5M2 12l5 5M22 12l-5-5M22 12l-5 5" />
                </svg>
                Size Guide & Measurements
              </button>
            </div>

            {loadingVariants ? (
              <div className="pdp-loading-variants">
                Verifying live atelier inventory...
              </div>
            ) : (
              <div className="pdp-sizes-grid" role="group" aria-label="Available chest sizes">
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
                      className={`pdp-size-chip ${isSelected ? "selected" : ""} ${isOutOfStock ? "out-of-stock" : ""}`}
                      aria-label={`Chest size ${s}${isOutOfStock ? ' - Currently out of stock' : ''}`}
                    >
                      <span>{s}</span>
                      {isSelected && <span className="pdp-size-chip-check">✓</span>}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Live Stock / Dispatch Schedule Feedback */}
            {selectedSize && (
              <div className="pdp-stock-status">
                {isSelectedOutOfStock ? (
                  <span className="pdp-stock-out">
                    ● Size {selectedSize} is currently in crafting and temporarily unavailable for immediate dispatch.
                  </span>
                ) : selectedVariant && selectedVariant.stock_quantity <= 3 ? (
                  <span className="pdp-stock-low">
                    ✦ Rare Commission: Only {selectedVariant.stock_quantity} pieces remaining in size {selectedSize}
                  </span>
                ) : (
                  <span className="pdp-stock-in">
                    ✓ In Atelier Stock · Handcrafted to size {selectedSize}
                  </span>
                )}
              </div>
            )}

            {/* Validation Error Banner */}
            {validationError && (
              <div className="pdp-validation-alert" role="alert">
                ⚠ {validationError}
              </div>
            )}
          </div>

          {/* Primary Commerce Actions: Quantity & Add to Cart */}
          <div className="pdp-actions-section">
            <div className="pdp-primary-action-row">
              {/* Quantity selector */}
              <div className="pdp-quantity-selector" aria-label="Garment quantity">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="pdp-qty-btn"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="pdp-qty-number" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="pdp-qty-btn"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                ref={mainBuyButtonRef}
                type="button"
                disabled={isSelectedOutOfStock}
                onClick={handleAddToCart}
                className={`pdp-add-to-bag-btn ${addedNotice ? "added" : ""} ${!product.isAvailableInBackend ? "archival" : ""}`}
              >
                {addedNotice ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added to Shopping Bag
                  </>
                ) : !product.isAvailableInBackend ? (
                  "Consult Atelier for Commission"
                ) : isSelectedOutOfStock ? (
                  "Currently Out of Stock"
                ) : (
                  <>
                    <span>Add to Shopping Bag</span>
                    <span className="pdp-btn-price">· ₹{(product.price * quantity).toLocaleString("en-IN")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`pdp-wishlist-btn ${isWishlisted ? "active" : ""}`}
              aria-label={isWishlisted ? "Remove from Atelier Wishlist" : "Save to Atelier Wishlist"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{isWishlisted ? "Saved in Atelier Wishlist" : "Save to Wishlist"}</span>
            </button>

            {/* Safe, configuration-gated WhatsApp inquiry button */}
            <WhatsAppInquiryButton
              productName={product.name}
              productId={product.id}
              variantSize={selectedSize}
              style={{ width: '100%', marginTop: '6px' }}
            />

            {/* Added confirmation toast */}
            {addedNotice && (
              <div className="pdp-added-toast" role="status">
                ✓ Added {quantity} × {product.name} (Size {selectedSize}) to your bag.
              </div>
            )}
          </div>

          {/* Customer Trust & Atelier Policy Assurance */}
          <div className="pdp-trust-assurance-card" aria-label="Atelier client trust and guarantees">
            <div className="pdp-trust-item">
              <span className="pdp-trust-icon" aria-hidden="true">✦</span>
              <div className="pdp-trust-text">
                <strong>Live Atelier Crafting:</strong> Inventory availability verified with PostgreSQL database.
              </div>
            </div>
            <div className="pdp-trust-item">
              <span className="pdp-trust-icon" aria-hidden="true">📦</span>
              <div className="pdp-trust-text">
                <strong>Shipping & Delivery Terms:</strong> Dispatched via tracked domestic courier services.{' '}
                <button
                  type="button"
                  onClick={() => navigateTo("/shipping-policy")}
                  className="pdp-trust-policy-link"
                >
                  View Shipping Policy (Draft)
                </button>
              </div>
            </div>
            <div className="pdp-trust-item">
              <span className="pdp-trust-icon" aria-hidden="true">✂</span>
              <div className="pdp-trust-text">
                <strong>Sizing & Exchange Guidance:</strong> Consult our size guide or review exchange terms before ordering.{' '}
                <button
                  type="button"
                  onClick={() => navigateTo("/returns-and-exchanges")}
                  className="pdp-trust-policy-link"
                >
                  View Exchange Policy (Draft)
                </button>
              </div>
            </div>
            <div className="pdp-trust-item">
              <span className="pdp-trust-icon" aria-hidden="true">◈</span>
              <div className="pdp-trust-text">
                <strong>Private Concierge Assistance:</strong> Stylist consultations for ceremonial ensembles.{' '}
                <button
                  type="button"
                  onClick={() => navigateTo("/contact")}
                  className="pdp-trust-policy-link"
                >
                  Atelier Concierge
                </button>
              </div>
            </div>
          </div>

          <div className="pdp-divider" />

          {/* 3. INTERACTIVE DELIVERY PIN CODE CHECKER */}
          <div className="pdp-pin-checker-card">
            <div className="pdp-pin-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-gold)' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="pdp-pin-title">Verify Delivery PIN Code</span>
            </div>
            <p className="pdp-pin-subtitle">
              Verify your 6-digit Indian PIN code for insured courier dispatch.
            </p>

            <form onSubmit={handleCheckPin} className="pdp-pin-form">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={checkPin}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCheckPin(digits)
                  if (pinCheckResult.status !== 'idle') {
                    setPinCheckResult({ status: 'idle', message: '' })
                  }
                }}
                placeholder="Enter 6-digit PIN (e.g. 110001)"
                className={`pdp-pin-input ${pinCheckResult.status === 'invalid' ? 'error' : ''}`}
                aria-label="Enter 6-digit Indian PIN code"
              />
              <button type="submit" className="pdp-pin-btn">
                Check PIN
              </button>
            </form>

            {pinCheckResult.status === 'valid' && (
              <div className="pdp-pin-result pdp-pin-result-success" role="status">
                <span className="pdp-pin-result-icon">✓</span>
                <span>{pinCheckResult.message}</span>
              </div>
            )}
            {pinCheckResult.status === 'invalid' && (
              <div className="pdp-pin-result pdp-pin-result-error" role="alert">
                <span className="pdp-pin-result-icon">⚠</span>
                <span>{pinCheckResult.message}</span>
              </div>
            )}
          </div>

          <div className="pdp-divider" />

          {/* 4. EXPANDABLE CRAFTSMANSHIP & SPECIFICATION ACCORDIONS */}
          <div className="pdp-accordions-group">
            {/* Accordion 1: Silhouette & Description */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "silhouette" ? "" : "silhouette")}
                className="pdp-accordion-trigger"
                aria-expanded={openAccordion === "silhouette"}
              >
                <span>Garment Silhouette & Cut</span>
                <span className="pdp-accordion-icon">{openAccordion === "silhouette" ? "−" : "+"}</span>
              </button>
              {openAccordion === "silhouette" && (
                <div className="pdp-accordion-body">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Accordion 2: Fabric & Craftsmanship */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "fabric" ? "" : "fabric")}
                className="pdp-accordion-trigger"
                aria-expanded={openAccordion === "fabric"}
              >
                <span>Fabric, Lining & Heritage Embroidery</span>
                <span className="pdp-accordion-icon">{openAccordion === "fabric" ? "−" : "+"}</span>
              </button>
              {openAccordion === "fabric" && (
                <div className="pdp-accordion-body">
                  <p><strong>Primary Fabric:</strong> {product.fabric}</p>
                  <ul className="pdp-specs-list">
                    <li>Inner lining: Pure breathable cotton-silk for sustained all-day ceremonial comfort.</li>
                    <li>Tailoring: Structured shoulder cut with hand-finished armholes and artisanal chest canvas.</li>
                    <li>Accents: Varanasi antique metal buttonwork and hand-turned fabric loops.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 3: Care Instructions */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "care" ? "" : "care")}
                className="pdp-accordion-trigger"
                aria-expanded={openAccordion === "care"}
              >
                <span>Preservation & Garment Care</span>
                <span className="pdp-accordion-icon">{openAccordion === "care" ? "−" : "+"}</span>
              </button>
              {openAccordion === "care" && (
                <div className="pdp-accordion-body">
                  <ul className="pdp-specs-list">
                    <li>Professional dry clean only by experienced heritage garment specialists.</li>
                    <li>Store suspended on the broad cedar hanger in the breathable WAAK garment bag provided.</li>
                    <li>Do not steam or press directly on gold zardozi wirework; use reverse-side low barrier cloth.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 4: Shipping & Insured Dispatch */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "shipping" ? "" : "shipping")}
                className="pdp-accordion-trigger"
                aria-expanded={openAccordion === "shipping"}
              >
                <span>Insured Dispatch & Atelier Exchanges</span>
                <span className="pdp-accordion-icon">{openAccordion === "shipping" ? "−" : "+"}</span>
              </button>
              {openAccordion === "shipping" && (
                <div className="pdp-accordion-body">
                  <p>{product.shipping}</p>
                  <p style={{ marginTop: '8px' }}>
                    <strong>Bespoke Fitting Guidance:</strong> Every piece includes master-tailor consultation and custom alteration support upon arrival.
                  </p>
                  <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-charcoal-muted)' }}>
                    <em>* Note: Courier transit windows and insurance representations represent draft operational standards subject to carrier partner confirmation.</em>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
      <section className="pdp-faq-section" aria-labelledby="pdp-faq-title">
        <div className="pdp-section-header">
          <span className="pdp-section-eyebrow">ATELIER GUIDANCE</span>
          <h2 id="pdp-faq-title" className="pdp-section-heading">Frequently Addressed Inquiries</h2>
        </div>

        <div className="pdp-faq-container">
          {[
            {
              id: "faq-size",
              question: "How should I select my chest size for occasionwear sherwanis and bandhgalas?",
              answer: "WAAK garments are tailored to true chest circumference in inches (Sizes 38, 40, 42, 44). If you measure 40 inches around the fullest part of your chest with a tape, select Size 40. The cut incorporates 2.5 inches of ease for layering over kurtas."
            },
            {
              id: "faq-included",
              question: "What pieces are included with this ensemble?",
              answer: product.subcategory === "Sherwanis"
                ? "This commission includes the primary zardozi sherwani jacket and matching ivory churidar trousers. Stoles and safas may be commissioned separately."
                : product.subcategory === "Bandhgala"
                ? "This ensemble includes the structured raw silk Bandhgala jacket. Coordinated trousers in matching fabric are included."
                : "This festive set includes the silk kurta, matching tailored pyjama trousers, and an artisanal stole."
            },
            {
              id: "faq-custom",
              question: "Can this garment be custom tailored to my exact measurements?",
              answer: "Yes. In addition to our standard chest sizes, our private atelier offers bespoke sleeve length and drape alterations. Contact our atelier team after placing your order to arrange personalized fitting notes."
            },
            {
              id: "faq-delivery",
              question: "How is the garment protected during transit?",
              answer: "Every WAAK creation is pressed, placed on a broad cedar suit hanger, encased in a dust-proof cotton garment bag, and shipped in a heavy-gauge, crush-resistant presentation travel box with 100% door-to-door insurance."
            },
            {
              id: "faq-exchange",
              question: "What is the return and exchange policy?",
              answer: "Under our draft exchange terms (subject to final business confirmation), we offer a 7-day bespoke exchange and alteration window for unworn standard sizes with atelier seals intact. Custom-tailored or altered ensembles are crafted exclusively for the patron. Please consult our draft Returns & Exchanges Policy for details."
            }
          ].map((faq) => {
            const isOpen = openFaq === faq.id
            return (
              <div key={faq.id} className="pdp-faq-card">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="pdp-faq-question-btn"
                  aria-expanded={isOpen}
                >
                  <span className="pdp-faq-question-text">{faq.question}</span>
                  <span className="pdp-faq-indicator">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="pdp-faq-answer-text">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 6. COMPLEMENTARY SILHOUETTES SECTION */}
      {relatedProducts.length > 0 && (
        <section className="pdp-related-section" aria-labelledby="pdp-related-heading">
          <div className="pdp-section-header">
            <span className="pdp-section-eyebrow">COMPLEMENTARY SILHOUETTES</span>
            <h2 id="pdp-related-heading" className="pdp-section-heading">You May Also Admire</h2>
          </div>

          <div className="pdp-related-grid">
            {relatedProducts.map((rel) => {
              const hasAlternate = Boolean(rel.gallery && rel.gallery[1])
              return (
                <div
                  key={rel.id}
                  onClick={() => {
                    navigateTo("/product", rel.id)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="product-card-standard pdp-related-card"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigateTo("/product", rel.id)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  }}
                  aria-label={`View ${rel.name}`}
                >
                  <div className="pdp-related-img-wrap">
                    <img
                      src={getSafeImageUrl(rel.image)}
                      alt={rel.name}
                      className={`card-primary-img ${hasAlternate ? "has-hover" : ""}`}
                      loading="lazy"
                    />
                    {hasAlternate && (
                      <img
                        src={getSafeImageUrl(rel.gallery[1])}
                        alt={`${rel.name} alternate perspective`}
                        className="card-hover-img"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="pdp-related-info">
                    <span className="pdp-related-cat">{rel.category}</span>
                    <h3 className="pdp-related-title">{rel.name}</h3>
                    <div className="pdp-related-price">
                      ₹{rel.price.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 7. FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High-resolution image inspection"
          className="pdp-lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="pdp-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="pdp-lightbox-close"
              aria-label="Close high-resolution zoom"
            >
              ×
            </button>

            <div className="pdp-lightbox-stage">
              <img
                src={getSafeImageUrl(activeImage, activeImageIndex)}
                alt={`${product.name} zoomed view`}
                className="pdp-lightbox-img"
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="pdp-lightbox-nav pdp-lightbox-nav-prev"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="pdp-lightbox-nav pdp-lightbox-nav-next"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="pdp-lightbox-caption">
              <span>{product.name} — Perspective {activeImageIndex + 1} of {galleryImages.length}</span>
              <span className="pdp-lightbox-hint">Press Escape or click anywhere to exit</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. BESPOKE SIZE GUIDE MODAL */}
      {sizeGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-modal-title"
          className="pdp-modal-overlay"
          onClick={() => setSizeGuideOpen(false)}
        >
          <div className="pdp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pdp-modal-header">
              <div>
                <span className="pdp-modal-eyebrow">WAAK ATELIER SPECIFICATION</span>
                <h3 id="size-guide-modal-title" className="pdp-modal-title">
                  Occasionwear Measurement Chart
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="pdp-modal-close-btn"
                aria-label="Close size guide"
              >
                ×
              </button>
            </div>

            <p className="pdp-modal-desc">
              All jackets, sherwanis, and bandhgalas are cut to actual chest circumference. Measure around the fullest part of your chest with a soft measuring tape held level across the back.
            </p>

            <div className="pdp-table-wrap">
              <table className="pdp-size-table">
                <thead>
                  <tr>
                    <th>Chest Size</th>
                    <th>Chest (Inches)</th>
                    <th>Chest (cm)</th>
                    <th>Shoulder Width</th>
                    <th>Jacket Length</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="size-num">38</td>
                    <td>38″</td>
                    <td>96.5 cm</td>
                    <td>17.5″ (44.5 cm)</td>
                    <td>31.0″ (78.5 cm)</td>
                  </tr>
                  <tr className="recommended-row">
                    <td className="size-num">40</td>
                    <td>40″ (Standard)</td>
                    <td>101.5 cm</td>
                    <td>18.0″ (45.7 cm)</td>
                    <td>31.5″ (80.0 cm)</td>
                  </tr>
                  <tr>
                    <td className="size-num">42</td>
                    <td>42″</td>
                    <td>106.5 cm</td>
                    <td>18.5″ (47.0 cm)</td>
                    <td>32.0″ (81.2 cm)</td>
                  </tr>
                  <tr>
                    <td className="size-num">44</td>
                    <td>44″</td>
                    <td>111.5 cm</td>
                    <td>19.0″ (48.2 cm)</td>
                    <td>32.5″ (82.5 cm)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pdp-modal-bespoke-notice">
              ✦ <strong>Master Tailor Drape Adjustments:</strong> Complimentary sleeve length, collar height, and trouser waist adjustments are included with every commission upon request.
            </div>

            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              className="pdp-modal-confirm-btn"
            >
              Return to Selection
            </button>
          </div>
        </div>
      )}

      {/* 9. STICKY MOBILE / RESPONSIVE PURCHASE BAR */}
      <aside
        className={`pdp-sticky-bar ${showStickyBar ? "visible" : ""}`}
        aria-label="Quick purchase bar"
      >
        <div className="pdp-sticky-container">
          <div className="pdp-sticky-product-info">
            <img
              src={getSafeImageUrl(product.image)}
              alt=""
              className="pdp-sticky-thumb"
              aria-hidden="true"
            />
            <div className="pdp-sticky-titles">
              <div className="pdp-sticky-name">{product.name}</div>
              <div className="pdp-sticky-meta">
                <span className="pdp-sticky-price">₹{product.price.toLocaleString("en-IN")}</span>
                {selectedSize ? (
                  <span className="pdp-sticky-size">· Size {selectedSize}</span>
                ) : (
                  <span className="pdp-sticky-size-prompt">· Select Size</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isSelectedOutOfStock}
            onClick={handleAddToCart}
            className={`pdp-sticky-btn ${addedNotice ? "added" : ""}`}
            aria-label={`Add ${product.name} to bag`}
          >
            {addedNotice ? (
              "Added ✓"
            ) : !product.isAvailableInBackend ? (
              "Atelier Commission"
            ) : isSelectedOutOfStock ? (
              "Out of Stock"
            ) : (
              "Add to Bag"
            )}
          </button>
        </div>
      </aside>

      {/* 10. LUXURY COMPONENT STYLING */}
      <style>{`
        .waak-product-detail-page {
          max-width: 1380px;
          margin: 0 auto;
          padding: 32px 28px 100px;
        }

        /* Breadcrumb */
        .pdp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-muted, #7A6F66);
          margin-bottom: 36px;
        }
        .pdp-breadcrumb-link {
          color: var(--color-muted, #7A6F66);
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          transition: color 0.2s ease;
        }
        .pdp-breadcrumb-link:hover {
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-breadcrumb-separator {
          color: rgba(197, 162, 101, 0.4);
        }
        .pdp-breadcrumb-current {
          color: var(--color-burgundy, #5A121A);
          font-weight: 600;
        }

        /* Grid */
        .pdp-main-grid {
          display: grid;
          grid-template-columns: 0.95fr 1fr;
          gap: 48px;
          align-items: start;
          margin-bottom: 90px;
        }

        /* Gallery Column */
        .pdp-gallery-column {
          position: sticky;
          top: 96px;
        }
        .pdp-main-image-wrap {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          aspect-ratio: 3 / 4;
          max-height: 580px;
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
          background-color: var(--color-linen, #EADFCF);
          box-shadow: 0 12px 36px rgba(45, 12, 10, 0.12);
          border: 1px solid rgba(197, 162, 101, 0.25);
          cursor: zoom-in;
        }
        .pdp-main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 15%;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pdp-main-image-wrap:hover .pdp-main-image {
          transform: scale(1.03);
        }

        /* Image Badges */
        .pdp-image-badges {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          gap: 8px;
          z-index: 2;
        }
        .pdp-badge-sale {
          background-color: var(--color-burgundy, #5A121A);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          padding: 4px 12px;
          border-radius: 2px;
        }
        .pdp-badge-archive {
          background-color: rgba(10, 5, 8, 0.88);
          color: var(--color-gold, #C5A265);
          border: 1px solid var(--color-gold, #C5A265);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          padding: 4px 10px;
          border-radius: 2px;
          text-transform: uppercase;
        }

        /* Gallery Nav Arrows */
        .pdp-gallery-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(251, 248, 243, 0.9);
          border: 1px solid rgba(197, 162, 101, 0.4);
          color: var(--color-burgundy, #5A121A);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.85;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          z-index: 3;
        }
        .pdp-gallery-nav:hover {
          opacity: 1;
          background-color: #fff;
          border-color: var(--color-gold, #C5A265);
          transform: translateY(-50%) scale(1.06);
        }
        .pdp-gallery-nav-prev { left: 16px; }
        .pdp-gallery-nav-next { right: 16px; }

        .pdp-zoom-btn {
          position: absolute;
          bottom: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(26, 5, 8, 0.82);
          color: var(--color-cream-light, #FBF8F3);
          border: 1px solid rgba(197, 162, 101, 0.5);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 7px 12px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
        }
        .pdp-zoom-btn:hover {
          background-color: var(--color-burgundy, #5A121A);
          border-color: var(--color-gold, #C5A265);
        }

        /* Thumbnails */
        .pdp-thumbnails-strip {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          margin-top: 14px;
          padding-bottom: 6px;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .pdp-thumbnail-card {
          width: 72px;
          height: 96px;
          flex: 0 0 auto;
          scroll-snap-align: start;
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          border: 1px solid rgba(197, 162, 101, 0.25);
          background-color: var(--color-linen, #EADFCF);
          cursor: pointer;
          opacity: 0.65;
          transition: all 0.25s ease;
          padding: 0;
        }
        .pdp-thumbnail-card:hover {
          opacity: 0.9;
        }
        .pdp-thumbnail-card.selected {
          opacity: 1;
          border: 2px solid var(--color-burgundy, #5A121A);
          box-shadow: 0 0 0 1px var(--color-gold, #C5A265);
        }
        .pdp-thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Product Info Column */
        .pdp-info-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .pdp-category-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-gold-dark, #98783B);
          margin-bottom: 8px;
        }
        .pdp-title {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 34px;
          font-weight: 500;
          color: var(--color-charcoal, #1E1A17);
          line-height: 1.25;
          margin-bottom: 8px;
        }
        .pdp-subtitle {
          font-size: 14px;
          color: var(--color-muted, #7A6F66);
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .pdp-price-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pdp-price-selling {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 30px;
          font-weight: 700;
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-price-original {
          font-size: 17px;
          color: var(--color-muted, #7A6F66);
          text-decoration: line-through;
        }
        .pdp-discount-pill {
          background-color: rgba(90, 18, 26, 0.08);
          color: var(--color-burgundy, #5A121A);
          border: 1px solid rgba(90, 18, 26, 0.25);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          border-radius: 2px;
        }
        .pdp-tax-notice {
          font-size: 11px;
          color: var(--color-muted, #7A6F66);
          margin-top: 6px;
        }

        .pdp-divider {
          height: 1px;
          background-color: rgba(110, 53, 41, 0.14);
          margin: 6px 0;
        }

        /* Sizing Section */
        .pdp-sizing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pdp-sizing-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-charcoal, #1E1A17);
        }
        .pdp-selected-size-text {
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-unselected-size-text {
          color: var(--color-muted, #7A6F66);
          font-weight: 400;
        }
        .pdp-size-guide-trigger {
          font-size: 11px;
          color: var(--color-gold-dark, #98783B);
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          display: inline-flex;
          align-items: center;
          transition: color 0.2s ease;
        }
        .pdp-size-guide-trigger:hover {
          color: var(--color-burgundy, #5A121A);
        }

        .pdp-loading-variants {
          font-size: 12px;
          color: var(--color-muted, #7A6F66);
          padding: 10px 0;
        }
        .pdp-sizes-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pdp-size-chip {
          min-width: 58px;
          height: 50px;
          padding: 0 14px;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid rgba(197, 162, 101, 0.35);
          background-color: var(--color-cream-light, #FBF8F3);
          color: var(--color-charcoal, #1E1A17);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.25s ease;
        }
        .pdp-size-chip:hover:not(:disabled) {
          border-color: var(--color-burgundy, #5A121A);
          background-color: #fff;
        }
        .pdp-size-chip.selected {
          background-color: var(--color-burgundy, #5A121A);
          color: #fff;
          border-color: var(--color-burgundy, #5A121A);
          box-shadow: 0 4px 14px rgba(90, 18, 26, 0.28);
          transform: translateY(-1px);
        }
        .pdp-size-chip.out-of-stock {
          opacity: 0.45;
          text-decoration: line-through;
          cursor: not-allowed;
          background-color: rgba(0,0,0,0.03);
          border-style: dashed;
        }
        .pdp-size-chip-check {
          font-size: 11px;
          color: var(--color-gold, #C5A265);
        }

        .pdp-stock-status {
          margin-top: 12px;
          font-size: 12px;
          line-height: 1.4;
        }
        .pdp-stock-in { color: #2e7d32; font-weight: 500; }
        .pdp-stock-low { color: #c67d00; font-weight: 600; }
        .pdp-stock-out { color: #d32f2f; font-weight: 500; }

        .pdp-validation-alert {
          margin-top: 12px;
          background-color: rgba(211, 47, 47, 0.08);
          border: 1px solid rgba(211, 47, 47, 0.35);
          color: #c62828;
          font-size: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-sm, 4px);
        }

        /* Actions Section */
        .pdp-actions-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pdp-primary-action-row {
          display: flex;
          gap: 14px;
        }
        .pdp-quantity-selector {
          display: flex;
          align-items: center;
          border: 1px solid rgba(197, 162, 101, 0.35);
          border-radius: var(--radius-sm, 4px);
          background-color: var(--color-cream-light, #FBF8F3);
        }
        .pdp-qty-btn {
          padding: 0 16px;
          height: 52px;
          font-size: 18px;
          color: var(--color-charcoal, #1E1A17);
          cursor: pointer;
          background: none;
          border: none;
          transition: color 0.15s ease;
        }
        .pdp-qty-btn:hover {
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-qty-number {
          padding: 0 8px;
          font-weight: 600;
          font-size: 14px;
          min-width: 28px;
          text-align: center;
        }

        .pdp-add-to-bag-btn {
          flex: 1;
          height: 52px;
          background: linear-gradient(135deg, #5A121A 0%, #3D0C13 100%);
          color: var(--color-cream-light, #FBF8F3);
          border: 1px solid var(--color-gold, #C5A265);
          border-radius: var(--radius-sm, 4px);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(90, 18, 26, 0.28);
          transition: all 0.25s ease;
        }
        .pdp-add-to-bag-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 26px rgba(90, 18, 26, 0.38);
        }
        .pdp-add-to-bag-btn:disabled {
          background: #777;
          border-color: #999;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .pdp-add-to-bag-btn.added {
          background: #2e7d32;
          border-color: #4caf50;
        }
        .pdp-add-to-bag-btn.archival {
          background: #222;
          border-color: var(--color-gold, #C5A265);
        }
        .pdp-btn-price {
          font-size: 11px;
          opacity: 0.85;
          letter-spacing: 0.05em;
        }

        .pdp-wishlist-btn {
          width: 100%;
          height: 46px;
          border: 1px solid rgba(197, 162, 101, 0.35);
          border-radius: var(--radius-sm, 4px);
          background-color: transparent;
          color: var(--color-charcoal, #1E1A17);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pdp-wishlist-btn:hover {
          border-color: var(--color-burgundy, #5A121A);
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-wishlist-btn.active {
          background-color: rgba(90, 18, 26, 0.06);
          color: var(--color-burgundy, #5A121A);
          border-color: var(--color-burgundy, #5A121A);
        }

        .waak-whatsapp-inquiry-btn:hover {
          filter: brightness(0.95);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37, 211, 102, 0.35);
        }
        .waak-whatsapp-inquiry-btn:focus-visible {
          outline: 2px solid var(--color-burgundy, #5A121A) !important;
          outline-offset: 3px;
        }

        .pdp-added-toast {
          background-color: rgba(197, 162, 101, 0.15);
          border: 1px solid var(--color-gold, #C5A265);
          color: var(--color-burgundy, #5A121A);
          font-size: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-sm, 4px);
          text-align: center;
          font-weight: 500;
        }

        /* Customer Trust & Assurance Card */
        .pdp-trust-assurance-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background-color: var(--color-cream, #F4EFE6);
          border: 1px solid rgba(197, 162, 101, 0.3);
          border-radius: var(--radius-sm, 4px);
          padding: 14px 16px;
        }
        .pdp-trust-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 11.5px;
          line-height: 1.5;
          color: var(--color-charcoal, #1E1A17);
        }
        .pdp-trust-icon {
          color: var(--color-gold, #C5A265);
          font-size: 12px;
          margin-top: 1px;
          flex-shrink: 0;
        }
        .pdp-trust-text {
          flex: 1;
        }
        .pdp-trust-policy-link {
          background: none;
          border: none;
          padding: 0;
          font-size: 11px;
          color: var(--color-burgundy, #5A121A);
          text-decoration: underline;
          cursor: pointer;
          font-weight: 600;
          display: inline;
        }
        .pdp-trust-policy-link:hover {
          color: #3d0c13;
        }

        /* PIN Checker Card */
        .pdp-pin-checker-card {
          background-color: var(--color-cream-light, #FBF8F3);
          border: 1px solid rgba(197, 162, 101, 0.3);
          border-radius: var(--radius-sm, 4px);
          padding: 18px 20px;
        }
        .pdp-pin-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .pdp-pin-title {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-pin-subtitle {
          font-size: 12px;
          color: var(--color-muted, #7A6F66);
          margin-bottom: 12px;
        }
        .pdp-pin-form {
          display: flex;
          gap: 8px;
        }
        .pdp-pin-input {
          flex: 1;
          height: 40px;
          padding: 0 12px;
          border: 1px solid rgba(197, 162, 101, 0.4);
          border-radius: var(--radius-sm, 4px);
          background-color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .pdp-pin-input:focus {
          border-color: var(--color-burgundy, #5A121A);
        }
        .pdp-pin-input.error {
          border-color: #d32f2f;
        }
        .pdp-pin-btn {
          height: 40px;
          padding: 0 16px;
          background-color: var(--color-burgundy, #5A121A);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm, 4px);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .pdp-pin-btn:hover {
          background-color: #3d0c13;
        }
        .pdp-pin-result {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm, 4px);
          font-size: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.5;
        }
        .pdp-pin-result-success {
          background-color: rgba(46, 125, 50, 0.08);
          border: 1px solid rgba(46, 125, 50, 0.25);
          color: #2e7d32;
        }
        .pdp-pin-result-error {
          background-color: rgba(211, 47, 47, 0.08);
          border: 1px solid rgba(211, 47, 47, 0.25);
          color: #c62828;
        }
        .pdp-pin-result-icon {
          font-weight: 700;
        }

        /* Accordions */
        .pdp-accordions-group {
          display: flex;
          flex-direction: column;
          border-top: 1px solid rgba(110, 53, 41, 0.14);
        }
        .pdp-accordion-item {
          border-bottom: 1px solid rgba(110, 53, 41, 0.14);
        }
        .pdp-accordion-trigger {
          width: 100%;
          padding: 16px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-charcoal, #1E1A17);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .pdp-accordion-trigger:hover {
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-accordion-icon {
          font-size: 18px;
          color: var(--color-gold-dark, #98783B);
        }
        .pdp-accordion-body {
          padding-bottom: 18px;
          font-size: 14px;
          line-height: 1.7;
          color: var(--color-charcoal, #1E1A17);
        }
        .pdp-specs-list {
          list-style: disc;
          padding-left: 20px;
          margin-top: 10px;
          font-size: 13px;
          color: var(--color-muted, #7A6F66);
        }
        .pdp-specs-list li {
          margin-bottom: 6px;
        }

        /* FAQ Section */
        .pdp-faq-section {
          margin: 90px 0 70px;
          border-top: 1px solid rgba(197, 162, 101, 0.3);
          padding-top: 60px;
        }
        .pdp-section-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .pdp-section-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-gold-dark, #98783B);
          display: block;
          margin-bottom: 8px;
        }
        .pdp-section-heading {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 32px;
          font-weight: 500;
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-faq-container {
          max-width: 840px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pdp-faq-card {
          background-color: var(--color-cream-light, #FBF8F3);
          border: 1px solid rgba(197, 162, 101, 0.3);
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .pdp-faq-card:hover {
          border-color: rgba(90, 18, 26, 0.4);
        }
        .pdp-faq-question-btn {
          width: 100%;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
        }
        .pdp-faq-question-text {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 16px;
          font-weight: 600;
          color: var(--color-charcoal, #1E1A17);
          line-height: 1.4;
        }
        .pdp-faq-indicator {
          font-size: 20px;
          color: var(--color-gold-dark, #98783B);
          margin-left: 16px;
        }
        .pdp-faq-answer-text {
          padding: 0 24px 20px;
          font-size: 14px;
          line-height: 1.7;
          color: var(--color-muted, #7A6F66);
          border-top: 1px solid rgba(197, 162, 101, 0.15);
          padding-top: 14px;
        }

        /* Related Section */
        .pdp-related-section {
          margin-top: 60px;
          border-top: 1px solid rgba(197, 162, 101, 0.3);
          padding-top: 60px;
        }
        .pdp-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        .pdp-related-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
          background-color: var(--color-cream-light, #FBF8F3);
          border: 1px solid rgba(197, 162, 101, 0.25);
          box-shadow: 0 4px 18px rgba(80, 27, 21, 0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pdp-related-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(90, 18, 26, 0.16);
        }
        .pdp-related-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background-color: var(--color-linen, #EADFCF);
        }
        .pdp-related-info {
          padding: 16px;
        }
        .pdp-related-cat {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--color-gold-dark, #98783B);
          text-transform: uppercase;
        }
        .pdp-related-title {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 15px;
          font-weight: 600;
          color: var(--color-charcoal, #1E1A17);
          margin: 4px 0 6px;
        }
        .pdp-related-price {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-burgundy, #5A121A);
        }

        /* Lightbox Modal */
        .pdp-lightbox-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(14, 4, 6, 0.94);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .pdp-lightbox-inner {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .pdp-lightbox-stage {
          position: relative;
          max-width: 100%;
          max-height: 82vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pdp-lightbox-img {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .pdp-lightbox-close {
          position: absolute;
          top: -40px;
          right: -20px;
          background: none;
          border: none;
          color: #fff;
          font-size: 36px;
          line-height: 1;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .pdp-lightbox-close:hover {
          opacity: 1;
        }
        .pdp-lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.15);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pdp-lightbox-nav:hover {
          background: rgba(255,255,255,0.35);
        }
        .pdp-lightbox-nav-prev { left: 16px; }
        .pdp-lightbox-nav-next { right: 16px; }
        .pdp-lightbox-caption {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--color-cream-light, #FBF8F3);
          font-size: 13px;
        }
        .pdp-lightbox-hint {
          font-size: 11px;
          opacity: 0.6;
        }

        /* Size Guide Modal */
        .pdp-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(10, 5, 5, 0.78);
          backdrop-filter: blur(6px);
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .pdp-modal-card {
          background-color: var(--color-cream-light, #FBF8F3);
          border: 1px solid var(--color-gold, #C5A265);
          border-radius: var(--radius-md, 8px);
          max-width: 580px;
          width: 100%;
          padding: 32px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
          max-height: 90vh;
          overflow-y: auto;
        }
        .pdp-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .pdp-modal-eyebrow {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-gold-dark, #98783B);
          font-weight: 600;
        }
        .pdp-modal-title {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 22px;
          color: var(--color-burgundy, #5A121A);
          margin-top: 4px;
        }
        .pdp-modal-close-btn {
          background: none;
          border: none;
          font-size: 26px;
          color: var(--color-muted, #7A6F66);
          cursor: pointer;
        }
        .pdp-modal-desc {
          font-size: 12px;
          color: var(--color-muted, #7A6F66);
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .pdp-table-wrap {
          overflow-x: auto;
          margin-bottom: 20px;
        }
        .pdp-size-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .pdp-size-table th {
          border-bottom: 2px solid var(--color-gold, #C5A265);
          padding: 10px 8px;
          text-align: left;
          color: var(--color-burgundy, #5A121A);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pdp-size-table td {
          border-bottom: 1px solid rgba(110, 53, 41, 0.12);
          padding: 10px 8px;
        }
        .pdp-size-table td.size-num {
          font-weight: 700;
          color: var(--color-burgundy, #5A121A);
        }
        .pdp-size-table tr.recommended-row {
          background-color: rgba(197, 162, 101, 0.1);
        }
        .pdp-modal-bespoke-notice {
          background-color: var(--color-cream, #F4EFE6);
          border: 1px dashed var(--color-gold, #C5A265);
          padding: 14px;
          border-radius: var(--radius-sm, 4px);
          font-size: 11px;
          color: var(--color-charcoal, #1E1A17);
          line-height: 1.6;
          margin-bottom: 22px;
        }
        .pdp-modal-confirm-btn {
          width: 100%;
          background-color: var(--color-burgundy, #5A121A);
          color: #fff;
          border: none;
          padding: 13px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: background-color 0.2s;
        }
        .pdp-modal-confirm-btn:hover {
          background-color: #3d0c13;
        }

        /* Sticky Add to Cart Bar */
        .pdp-sticky-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(251, 248, 243, 0.96);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(197, 162, 101, 0.4);
          box-shadow: 0 -8px 24px rgba(0,0,0,0.12);
          z-index: 1000;
          padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
          transform: translateY(110%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pdp-sticky-bar.visible {
          transform: translateY(0);
        }
        .pdp-sticky-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .pdp-sticky-product-info {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }
        .pdp-sticky-thumb {
          width: 44px;
          height: 56px;
          object-fit: cover;
          border-radius: 2px;
          border: 1px solid rgba(197, 162, 101, 0.3);
          flex-shrink: 0;
        }
        .pdp-sticky-titles {
          overflow: hidden;
        }
        .pdp-sticky-name {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-charcoal, #1E1A17);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pdp-sticky-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          margin-top: 2px;
        }
        .pdp-sticky-price {
          color: var(--color-burgundy, #5A121A);
          font-weight: 700;
        }
        .pdp-sticky-size {
          color: var(--color-muted, #7A6F66);
        }
        .pdp-sticky-size-prompt {
          color: #c67d00;
          font-weight: 500;
        }
        .pdp-sticky-btn {
          height: 44px;
          padding: 0 24px;
          background-color: var(--color-burgundy, #5A121A);
          color: var(--color-cream-light, #FBF8F3);
          border: 1px solid var(--color-gold, #C5A265);
          border-radius: var(--radius-sm, 4px);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .pdp-sticky-btn:hover:not(:disabled) {
          background-color: #3d0c13;
        }
        .pdp-sticky-btn:disabled {
          background-color: #777;
          border-color: #999;
          cursor: not-allowed;
        }
        .pdp-sticky-btn.added {
          background-color: #2e7d32;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .pdp-main-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .pdp-gallery-column {
            position: static;
          }
          .pdp-main-image-wrap {
            max-width: 480px;
            max-height: 500px;
          }
          .pdp-title {
            font-size: 28px;
          }
          .pdp-price-selling {
            font-size: 26px;
          }
        }

        @media (max-width: 600px) {
          .waak-product-detail-page {
            padding: 16px 14px 90px;
          }
          .pdp-breadcrumb {
            margin-bottom: 20px;
          }
          .pdp-main-grid {
            gap: 22px;
            margin-bottom: 48px;
          }
          .pdp-main-image-wrap {
            max-width: 100%;
            max-height: 380px;
            aspect-ratio: 3 / 3.8;
          }
          .pdp-thumbnails-strip {
            gap: 8px;
            margin-top: 10px;
          }
          .pdp-thumbnail-card {
            width: 58px;
            height: 76px;
          }
          .pdp-title {
            font-size: 22px;
            margin-bottom: 6px;
          }
          .pdp-price-selling {
            font-size: 22px;
          }
          .pdp-primary-action-row {
            flex-direction: column;
            gap: 10px;
          }
          .pdp-quantity-selector {
            justify-content: center;
            height: 46px;
          }
          .pdp-qty-btn {
            height: 46px;
            padding: 0 20px;
          }
          .pdp-add-to-bag-btn {
            width: 100%;
            height: 48px;
          }
          .pdp-wishlist-btn {
            height: 44px;
          }
          .pdp-section-heading {
            font-size: 22px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pdp-main-image,
          .pdp-gallery-nav,
          .pdp-sticky-bar,
          .pdp-add-to-bag-btn {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}
