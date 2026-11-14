import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { Product, PRODUCTS } from "../data/products"
import { api } from "../services/api"

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

interface AppContextType {
  products: Product[]
  catalogLoading: boolean
  catalogError: string | null
  refetchCatalog: () => Promise<void>
  currentRoute: string
  selectedProductId: string | null
  activeCategory: string
  setActiveCategory: (cat: string) => void
  cart: CartItem[]
  wishlist: string[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  isWishlistOpen: boolean
  setIsWishlistOpen: (open: boolean) => void
  isCheckoutOpen: boolean
  setIsCheckoutOpen: (open: boolean) => void
  clearCart: () => void
  navigateTo: (route: string, productId?: string) => void
  addToCart: (product: Product, size: string, quantity?: number) => void
  updateCartQuantity: (productId: string, size: string, quantity: number) => void
  removeFromCart: (productId: string, size: string) => void
  toggleWishlist: (productId: string) => void
  cartCount: number
  wishlistCount: number
  selectedProduct: Product | undefined
  findProduct: (idOrSlug: string) => Product | undefined
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const VALID_POLICY_ROUTES = [
  "/privacy-policy",
  "/terms-of-service",
  "/terms-and-conditions",
  "/shipping-policy",
  "/shipping-and-delivery",
  "/returns-and-exchanges",
  "/care-and-preservation",
  "/contact",
  "/contact-us",
]

function resolveRoute(path: string): string {
  const cleanPath = path.toLowerCase()
  if (cleanPath.includes("account")) return "/account"
  if (cleanPath.includes("product")) return "/product"
  if (cleanPath.includes("terms-and-conditions") || cleanPath.includes("terms-of-service") || cleanPath === "/terms") return "/terms-of-service"
  if (cleanPath.includes("shipping-and-delivery") || cleanPath.includes("shipping-policy") || cleanPath === "/shipping") return "/shipping-policy"
  if (cleanPath.includes("returns-and-exchanges") || cleanPath === "/returns") return "/returns-and-exchanges"
  if (cleanPath.includes("care-and-preservation") || cleanPath === "/care") return "/care-and-preservation"
  if (cleanPath.includes("contact")) return "/contact"
  if (cleanPath.includes("privacy")) return "/privacy-policy"
  const matchedPolicy = VALID_POLICY_ROUTES.find((r) => cleanPath.includes(r.replace("/", "")))
  if (matchedPolicy) return matchedPolicy
  return "/"
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return resolveRoute(window.location.pathname)
  })

  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("id") || "waak-01"
  })

  const [activeCategory, setActiveCategory] = useState<string>("All")
  
  // Dynamic catalog state
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  const fetchCatalog = useCallback(async () => {
    setCatalogLoading(true)
    setCatalogError(null)
    try {
      const data = await api.products.list()
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        // Map backend products to our luxury Product model, enriching with static merchandising
        const mappedBackendProducts: Product[] = data.products.map((bp: any) => {
          const staticMatch = PRODUCTS.find((sp) => sp.id === bp.id || sp.backendId === bp.id || sp.slug === bp.id)

          const availableSizes = Array.isArray(bp.variants) && bp.variants.length > 0
            ? bp.variants.map((v: any) => v.size)
            : (staticMatch?.availableSizes || ["36", "38", "40", "42", "44"])

          return {
            id: bp.id,
            slug: staticMatch?.slug || bp.id,
            backendId: bp.id,
            name: bp.title?.toUpperCase() || staticMatch?.name || bp.id,
            subtitle: bp.subtitle || staticMatch?.subtitle || "",
            price: Number(bp.price),
            originalPrice: staticMatch?.originalPrice || Math.round(Number(bp.price) * 1.15),
            category: (bp.category === "Sherwanis" ? "Indian Wear" : bp.category === "Indo-Western" ? "Indo Western & Jodhpuri" : bp.category) as any,
            subcategory: bp.category || staticMatch?.subcategory || "Occasionwear",
            occasion: (bp.occasion || staticMatch?.occasion || "Wedding") as any,
            isNewArrival: bp.is_new_arrival ?? staticMatch?.isNewArrival ?? false,
            isBestSeller: bp.is_bestseller ?? staticMatch?.isBestSeller ?? false,
            isSale: bp.on_sale ?? staticMatch?.isSale ?? false,
            image: bp.thumbnail || staticMatch?.image || "/assets/products/ivory-sherwani.jpg",
            gallery: (bp.images && bp.images.length > 0) ? bp.images : (staticMatch?.gallery || [bp.thumbnail]),
            description: bp.description || staticMatch?.description || "",
            fabric: staticMatch?.fabric || "Raw silk & bespoke Banarasi weave, dry clean only.",
            shipping: staticMatch?.shipping || "Complimentary express insured shipping across India.",
            availableSizes,
            variants: bp.variants || staticMatch?.variants,
            isAvailableInBackend: true,
          }
        })

        // Also preserve archival preview products (products not currently in active backend seed)
        const backendIds = new Set(data.products.map((bp: any) => bp.id))
        const archivalProducts = PRODUCTS.filter((sp) => !backendIds.has(sp.id) && !backendIds.has(sp.backendId || ''))

        setProducts([...mappedBackendProducts, ...archivalProducts])
      } else {
        // Fallback to static catalog definition if backend returned empty list
        setProducts(PRODUCTS)
      }
    } catch (err: any) {
      console.warn("Could not fetch dynamic catalog from backend API. Using cached luxury catalog:", err.message)
      setCatalogError("Unable to establish real-time link with Atelier catalog. Displaying cached seasonal preview.")
      setProducts(PRODUCTS)
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  const findProduct = useCallback((idOrSlug: string): Product | undefined => {
    if (!idOrSlug) return products[0]
    return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug || p.backendId === idOrSlug)
  }, [products])

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("waak_cart")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("waak_wishlist")
      return saved ? JSON.parse(saved) : ["waak-01"]
    } catch {
      return ["waak-01"]
    }
  })

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false)

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("waak_cart", JSON.stringify(cart))
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [cart])

  useEffect(() => {
    try {
      localStorage.setItem("waak_wishlist", JSON.stringify(wishlist))
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [wishlist])

  // Listen to popstate for back/forward browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const resolved = resolveRoute(path)
      setCurrentRoute(resolved)
      if (resolved === "/product") {
        const params = new URLSearchParams(window.location.search)
        if (params.get("id")) setSelectedProductId(params.get("id"))
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const navigateTo = (route: string, productId?: string) => {
    if (productId) {
      setSelectedProductId(productId)
      const url = `/product?id=${productId}`
      window.history.pushState({}, "", url)
      setCurrentRoute("/product")
    } else {
      const target = resolveRoute(route)
      window.history.pushState({}, "", route)
      setCurrentRoute(target !== "/" ? target : route)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const addToCart = (product: Product, size: string, qty: number = 1) => {
    if (!size) {
      console.warn("Cannot add item to bag: Valid size selection required.")
      return
    }
    setCart((prev) => {
      const matchItem = (item: CartItem) =>
        (item.product.id === product.id || item.product.slug === product.slug) && item.size === size

      const existing = prev.find(matchItem)
      if (existing) {
        return prev.map((item) =>
          matchItem(item)
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      }
      return [...prev, { product, size, quantity: qty }]
    })
    setIsCartOpen(true)
  }

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        (item.product.id === productId || item.product.slug === productId) && item.size === size
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !((item.product.id === productId || item.product.slug === productId) && item.size === size))
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const wishlistCount = wishlist.length
  const selectedProduct = findProduct(selectedProductId || "waak-01") || products[0]

  return (
    <AppContext.Provider
      value={{
        products,
        catalogLoading,
        catalogError,
        refetchCatalog: fetchCatalog,
        currentRoute,
        selectedProductId,
        activeCategory,
        setActiveCategory,
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        clearCart,
        navigateTo,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        toggleWishlist,
        cartCount,
        wishlistCount,
        selectedProduct,
        findProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within an AppProvider")
  return context
}
