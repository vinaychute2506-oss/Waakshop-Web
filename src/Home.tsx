import React, { useState, useMemo, useEffect } from "react"
import { useApp } from "./context/AppContext"
import { PRODUCTS, CATEGORIES, OCCASIONS, PRICE_RANGES, Product } from "./data/products"
import { useScrollReveal } from "./hooks/useScrollReveal"
import CurtainReveal from "./components/CurtainReveal"
import "./Home.css"

export default function Home() {
  const { navigateTo, activeCategory, setActiveCategory, wishlist, toggleWishlist } = useApp()

  // Track if hero elements should be revealed
  const [heroRevealed, setHeroRevealed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }
    return false
  })

  // Local filter states
  const [selectedOccasion, setSelectedOccasion] = useState<string>("All occasions")
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("All prices")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [poppedHeartId, setPoppedHeartId] = useState<string | null>(null)

  // Scroll reveal refs for sections
  const newArrivalsRef = useScrollReveal<HTMLDivElement>(0.1)
  const occasionsRef = useScrollReveal<HTMLDivElement>(0.1)
  const collectionRef = useScrollReveal<HTMLDivElement>(0.05)

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (activeCategory !== "All" && activeCategory !== "all") {
        if (activeCategory === "Best Seller") {
          if (!product.isBestSeller) return false
        } else if (product.category !== activeCategory) {
          return false
        }
      }

      // Occasion filter
      if (selectedOccasion !== "All occasions") {
        if (product.occasion !== selectedOccasion) return false
      }

      // Price range filter
      if (selectedPriceRange !== "All prices") {
        const range = PRICE_RANGES.find((r) => r.label === selectedPriceRange)
        if (range && (product.price < range.min || product.price > range.max)) {
          return false
        }
      }

      return true
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (sortBy === "newest") return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0)
      return 0 // featured default
    })
  }, [activeCategory, selectedOccasion, selectedPriceRange, sortBy])

  const clearAllFilters = () => {
    setActiveCategory("All")
    setSelectedOccasion("All occasions")
    setSelectedPriceRange("All prices")
    setSortBy("featured")
  }

  const handleHeartClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    setPoppedHeartId(productId)
    toggleWishlist(productId)
    setTimeout(() => {
      setPoppedHeartId((current) => (current === productId ? null : current))
    }, 400)
  }

  const newArrivals = PRODUCTS.filter((p) => p.isNewArrival).slice(0, 4)

  const scrollToCollection = () => {
    const el = document.getElementById("collection-section")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="waak-home">
      {/* 0. CINEMATIC VELVET CURTAIN REVEAL OVERLAY */}
      <CurtainReveal onComplete={() => setHeroRevealed(true)} />

      {/* 1. HERO CAMPAIGN SECTION */}
      <section className={`waak-hero ${heroRevealed ? "revealed" : ""}`}>
        {/* Cinematic Backdrop Image & Heritage Atmosphere */}
        <div className="hero-backdrop-container">
          <img
            src="/assets/campaign-hero-palace.jpg"
            alt="WAAK Royal Ivory Sherwani Campaign on Heritage Palace Terrace"
            className="hero-campaign-img"
          />
          {/* Depth & Contrast Gradients */}
          <div className="hero-gradient-overlay" />
          <div className="hero-vignette-overlay" />
        </div>

        {/* Editorial Storytelling Content */}
        <div className="hero-content-box">
          <div className="hero-eyebrow-wrap">
            <svg className="hero-ornament-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path d="M12 2C12 7 9 10 9 12C9 14 12 17 12 22C12 17 15 14 15 12C15 10 12 7 12 2Z" fill="currentColor" />
              <path d="M2 12C7 12 10 9 12 9C14 9 17 12 22 12C17 12 14 15 12 15C10 15 7 12 2 12Z" fill="currentColor" />
            </svg>
            <span className="hero-eyebrow">CONTEMPORARY OCCASIONWEAR ROOTED IN HERITAGE</span>
          </div>

          <h1 className="hero-title">IVORY, WITH AUTHORITY.</h1>

          <p className="hero-subtitle">
            Occasionwear for life's most significant celebrations.
          </p>

          <div className="hero-actions-group">
            <button onClick={scrollToCollection} className="hero-cta" aria-label="Explore The Collection">
              Explore The Collection
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => {
                setActiveCategory("Indian Wear")
                scrollToCollection()
              }}
              className="hero-secondary-btn editorial-underline"
              aria-label="View the bridal dossier"
            >
              The Bridal Dossier →
            </button>
          </div>
        </div>

        {/* Subtle Scroll Cue */}
        <div
          className="hero-scroll-cue"
          onClick={scrollToCollection}
          role="button"
          tabIndex={0}
          aria-label="Scroll to discover collection"
        >
          <span className="hero-scroll-cue-text">SCROLL TO DISCOVER</span>
          <svg className="hero-scroll-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* 2. REFINED CATEGORY NAVIGATION CIRCLES */}
      <section className="category-nav-section">
        <div className="category-scroll-container">
          {CATEGORIES.map((cat, idx) => {
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase() || (cat.name === "All" && activeCategory === "All")
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.name === "All" ? "All" : cat.name)
                  scrollToCollection()
                }}
                className={`category-pill-button ${isActive ? "active" : ""}`}
                style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
              >
                <div className={`category-circle-wrapper ${isActive ? "gold-active-ring" : ""}`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="category-circle-img"
                  />
                </div>
                <span className="category-pill-label">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. NEW ARRIVALS — MATCHING SUPPLIED REFERENCE SCREENSHOT */}
      <section ref={newArrivalsRef} className="new-arrivals-banner reveal-init">
        <div className="new-arrivals-container">
          <div className="new-arrivals-header">
            <div className="new-arrivals-titles">
              <span className="new-arrivals-eyebrow">JUST IN</span>
              <h2 className="new-arrivals-heading">NEW ARRIVALS</h2>
            </div>
            <button
              onClick={() => {
                clearAllFilters()
                scrollToCollection()
              }}
              className="view-all-link editorial-underline"
            >
              VIEW ALL PRODUCTS →
            </button>
          </div>

          <div className="new-arrivals-grid">
            {newArrivals.map((prod, index) => {
              const hasAlternate = Boolean(prod.gallery && prod.gallery[1])
              return (
                <div
                  key={prod.id}
                  onClick={() => navigateTo("/product", prod.id)}
                  className={`new-arrival-card reveal-init reveal-stagger-${index + 1}`}
                >
                  <div className="new-arrival-image-box">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className={`new-arrival-img card-primary-img ${hasAlternate ? "has-hover" : ""}`}
                      loading="lazy"
                    />
                    {hasAlternate && (
                      <img
                        src={prod.gallery[1]}
                        alt={`${prod.name} alternate view`}
                        className="card-hover-img"
                        loading="lazy"
                      />
                    )}
                    {prod.isSale && <span className="sale-pill">SALE</span>}
                  </div>
                  <div className="new-arrival-info">
                    <h3 className="new-arrival-title">{prod.name}</h3>
                    <p className="new-arrival-price">Rs. {prod.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. SHOP BY OCCASION — CURATED OCCASION SECTIONS */}
      <section ref={occasionsRef} className="occasion-section reveal-init">
        <div className="section-header-centered">
          <span className="section-eyebrow">CURATED FOR CELEBRATIONS</span>
          <h2 className="section-title">Shop by Occasion</h2>
        </div>

        <div className="occasion-grid">
          {/* Featured Large Tile: Mehendi / Haldi */}
          <div
            onClick={() => {
              setSelectedOccasion("Mehendi / Haldi")
              scrollToCollection()
            }}
            className="occasion-card occasion-card-featured"
          >
            <img
              src="https://framerusercontent.com/images/sVc5PIkY7R6v5lV2Y29vq3zyLc.jpg?scale-down-to=1024&width=800&height=1200"
              alt="Mehendi and Haldi Collection"
              className="occasion-card-img"
            />
            <div className="occasion-card-overlay">
              <h3 className="occasion-card-title">Mehendi / Haldi</h3>
              <span className="occasion-card-action">SHOP NOW →</span>
            </div>
          </div>

          {/* Wedding Wear */}
          <div
            onClick={() => {
              setSelectedOccasion("Wedding")
              scrollToCollection()
            }}
            className="occasion-card"
          >
            <img
              src="/assets/products/ivory-sherwani.jpg"
              alt="Wedding Wear"
              className="occasion-card-img"
            />
            <div className="occasion-card-overlay">
              <h3 className="occasion-card-title">Wedding Wear</h3>
              <span className="occasion-card-action">SHOP NOW →</span>
            </div>
          </div>

          {/* Cocktail & Reception */}
          <div
            onClick={() => {
              setSelectedOccasion("Reception")
              scrollToCollection()
            }}
            className="occasion-card"
          >
            <img
              src="/assets/products/midnight-sherwani.jpg"
              alt="Cocktail & Reception"
              className="occasion-card-img"
            />
            <div className="occasion-card-overlay">
              <h3 className="occasion-card-title">Cocktail & Reception</h3>
              <span className="occasion-card-action">SHOP NOW →</span>
            </div>
          </div>

          {/* Festive Celebrations */}
          <div
            onClick={() => {
              setSelectedOccasion("Festive")
              scrollToCollection()
            }}
            className="occasion-card"
          >
            <img
              src="/assets/products/emerald-kurta.jpg"
              alt="Festive Occasionwear"
              className="occasion-card-img"
            />
            <div className="occasion-card-overlay">
              <h3 className="occasion-card-title">Festive Occasion</h3>
              <span className="occasion-card-action">SHOP NOW →</span>
            </div>
          </div>

          {/* Formal / Bandhgala */}
          <div
            onClick={() => {
              setSelectedOccasion("Formal")
              scrollToCollection()
            }}
            className="occasion-card"
          >
            <img
              src="https://framerusercontent.com/images/8OOwfRibO6K52kkHqENwFhHk.jpg?scale-down-to=1024&width=800&height=1200"
              alt="Formal & Black Tie"
              className="occasion-card-img"
            />
            <div className="occasion-card-overlay">
              <h3 className="occasion-card-title">Formal & Black Tie</h3>
              <span className="occasion-card-action">SHOP NOW →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXPLORE THE COLLECTION — DYNAMIC DISCOVERY & FILTERING */}
      <section id="collection-section" ref={collectionRef} className="collection-section reveal-init">
        <div className="section-header-centered" style={{ marginBottom: "32px" }}>
          <span className="section-eyebrow">THE WAAK WARDROBE</span>
          <h2 className="section-title">Explore the Collection</h2>
        </div>

        {/* Real Accessible Filter & Sort Toolbar */}
        <div className="filter-toolbar">
          <div className="filter-controls-row">
            <div className="filter-group">
              {/* Category Select */}
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="filter-select"
                aria-label="Filter by Category"
              >
                <option value="All">All Categories</option>
                <option value="Kurta Sets">Kurta Sets</option>
                <option value="Indian Wear">Indian Wear</option>
                <option value="Indo Western & Jodhpuri">Indo Western & Jodhpuri</option>
                <option value="Suits & Blazers">Suits & Blazers</option>
                <option value="Waistcoats">Waistcoats</option>
                <option value="Best Seller">Best Sellers</option>
              </select>

              {/* Occasion Select */}
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="filter-select"
                aria-label="Filter by Occasion"
              >
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>

              {/* Price Select */}
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="filter-select"
                aria-label="Filter by Price Range"
              >
                {PRICE_RANGES.map((pr) => (
                  <option key={pr.label} value={pr.label}>{pr.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
                aria-label="Sort products"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="newest">Sort by: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips / Pills */}
          {(activeCategory !== "All" || selectedOccasion !== "All occasions" || selectedPriceRange !== "All prices" || sortBy !== "featured") && (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              marginTop: "14px",
              paddingTop: "14px",
              borderTop: "1px solid var(--color-border-light)"
            }}>
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-muted)", marginRight: "4px" }}>
                Active Filters:
              </span>
              {activeCategory !== "All" && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("All")}
                  className="filter-chip"
                  aria-label={`Remove category filter: ${activeCategory}`}
                >
                  <span>Category: {activeCategory}</span>
                  <span className="filter-chip-remove" aria-hidden="true">×</span>
                </button>
              )}
              {selectedOccasion !== "All occasions" && (
                <button
                  type="button"
                  onClick={() => setSelectedOccasion("All occasions")}
                  className="filter-chip"
                  aria-label={`Remove occasion filter: ${selectedOccasion}`}
                >
                  <span>Occasion: {selectedOccasion}</span>
                  <span className="filter-chip-remove" aria-hidden="true">×</span>
                </button>
              )}
              {selectedPriceRange !== "All prices" && (
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange("All prices")}
                  className="filter-chip"
                  aria-label={`Remove price filter: ${selectedPriceRange}`}
                >
                  <span>Price: {selectedPriceRange}</span>
                  <span className="filter-chip-remove" aria-hidden="true">×</span>
                </button>
              )}
              {sortBy !== "featured" && (
                <button
                  type="button"
                  onClick={() => setSortBy("featured")}
                  className="filter-chip"
                  aria-label={`Remove sort filter: ${sortBy}`}
                >
                  <span>Sort: {sortBy}</span>
                  <span className="filter-chip-remove" aria-hidden="true">×</span>
                </button>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="clear-all-chips-btn"
                aria-label="Clear all active filters"
              >
                Clear All
              </button>
            </div>
          )}

          <div className="filter-stats-row">
            <span style={{ color: "var(--color-muted)" }}>
              Showing <strong>{filteredProducts.length}</strong> of {PRODUCTS.length} curated pieces
              {(activeCategory !== "All" || selectedOccasion !== "All occasions" || selectedPriceRange !== "All prices") && (
                <span> (Filtered)</span>
              )}
            </span>
            {(activeCategory !== "All" || selectedOccasion !== "All occasions" || selectedPriceRange !== "All prices" || sortBy !== "featured") && (
              <button onClick={clearAllFilters} className="clear-filters-btn">
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", backgroundColor: "var(--color-cream-light)", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--color-burgundy)", marginBottom: "8px" }}>
              No matching pieces found
            </h3>
            <p style={{ color: "var(--color-muted)", marginBottom: "20px" }}>
              Try adjusting your category, occasion, or price filters.
            </p>
            <button
              onClick={clearAllFilters}
              style={{
                backgroundColor: "var(--color-burgundy)",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="product-grid-main">
            {filteredProducts.map((prod, index) => {
              const isWishlisted = wishlist.includes(prod.id)
              const isPopping = poppedHeartId === prod.id
              const hasAlternate = Boolean(prod.gallery && prod.gallery[1])
              return (
                <div
                  key={prod.id}
                  onClick={() => navigateTo("/product", prod.id)}
                  className={`product-card-standard reveal-init reveal-stagger-${(index % 4) + 1}`}
                >
                  <div className="product-card-img-wrap">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className={`product-card-img card-primary-img ${hasAlternate ? "has-hover" : ""}`}
                      loading="lazy"
                    />
                    {hasAlternate && (
                      <img
                        src={prod.gallery[1]}
                        alt={`${prod.name} alternate view`}
                        className="card-hover-img"
                        loading="lazy"
                      />
                    )}
                    <button
                      onClick={(e) => handleHeartClick(e, prod.id)}
                      aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                      className={`wishlist-heart-btn ${isWishlisted ? "active" : ""} ${isPopping ? "heart-pop-anim" : ""}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    {prod.isSale && (
                      <span style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        backgroundColor: "var(--color-burgundy)",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        padding: "3px 8px",
                        borderRadius: "var(--radius-sm)"
                      }}>
                        SALE
                      </span>
                    )}
                  </div>
                  <div className="product-card-details">
                    <div>
                      <span className="product-card-category-tag">{prod.category} · {prod.occasion}</span>
                      <h3 className="product-card-title">{prod.name}</h3>
                    </div>
                    <div className="product-card-price-row">
                      <span className="product-card-price">₹{prod.price.toLocaleString("en-IN")}</span>
                      {prod.originalPrice && (
                        <span className="product-card-original-price">₹{prod.originalPrice.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
