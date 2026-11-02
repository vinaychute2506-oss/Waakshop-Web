import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Product, PRODUCTS } from "../data/products"

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

interface AppContextType {
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
  navigateTo: (route: string, productId?: string) => void
  addToCart: (product: Product, size: string, quantity?: number) => void
  updateCartQuantity: (productId: string, size: string, quantity: number) => void
  removeFromCart: (productId: string, size: string) => void
  toggleWishlist: (productId: string) => void
  cartCount: number
  wishlistCount: number
  selectedProduct: Product | undefined
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname
    if (path.includes("account")) return "/account"
    if (path.includes("product")) return "/product"
    return "/"
  })

  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("id") || "ivory-embroidered-sherwani"
  })

  const [activeCategory, setActiveCategory] = useState<string>("All")
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
      return saved ? JSON.parse(saved) : ["ivory-embroidered-sherwani"]
    } catch {
      return ["ivory-embroidered-sherwani"]
    }
  })

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false)

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
      if (path.includes("account")) setCurrentRoute("/account")
      else if (path.includes("product")) {
        setCurrentRoute("/product")
        const params = new URLSearchParams(window.location.search)
        if (params.get("id")) setSelectedProductId(params.get("id"))
      } else {
        setCurrentRoute("/")
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
      window.history.pushState({}, "", route)
      setCurrentRoute(route)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const addToCart = (product: Product, size: string, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.size === size)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
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
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)))
  }

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const wishlistCount = wishlist.length
  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0]

  return (
    <AppContext.Provider
      value={{
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
        navigateTo,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        toggleWishlist,
        cartCount,
        wishlistCount,
        selectedProduct,
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
