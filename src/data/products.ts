export interface ProductVariant {
  id: string
  size: string
  stock_quantity: number
  price: number
  sku?: string
}

export interface Product {
  id: string
  slug: string
  backendId?: string
  name: string
  subtitle?: string
  price: number
  originalPrice?: number
  category: "Kurta Sets" | "Indian Wear" | "Suits & Blazers" | "Indo Western & Jodhpuri" | "Waistcoats"
  subcategory: string
  occasion: "Wedding" | "Reception" | "Festive" | "Mehendi / Haldi" | "Formal" | "Cocktail"
  isNewArrival?: boolean
  isBestSeller?: boolean
  isSale?: boolean
  image: string
  gallery: string[]
  description: string
  fabric: string
  shipping: string
  availableSizes: string[]
  variants?: ProductVariant[]
  isAvailableInBackend: boolean
}

export const CATEGORIES = [
  { id: "kurta-sets", name: "Kurta Sets", image: "/assets/categories/kurta-sets.png" },
  { id: "indian-wear", name: "Indian Wear", image: "/assets/categories/indian-wear.png" },
  { id: "best-seller", name: "Best Seller", image: "/assets/categories/best-seller.png" },
  { id: "suits-blazers", name: "Suits & Blazers", image: "/assets/categories/suits-blazers.png" },
  { id: "indo-western", name: "Indo Western & Jodhpuri", image: "/assets/categories/indo-western.png" },
  { id: "waistcoats", name: "Waistcoats", image: "/assets/categories/waistcoats.png" },
  { id: "all", name: "All", image: "/assets/categories/all-circle.png" },
] as const

export const OCCASIONS = [
  "All occasions",
  "Wedding",
  "Reception",
  "Festive",
  "Mehendi / Haldi",
  "Formal",
  "Cocktail",
] as const

export const PRICE_RANGES = [
  { label: "All prices", min: 0, max: Infinity },
  { label: "Under ₹25,000", min: 0, max: 25000 },
  { label: "₹25,000–₹40,000", min: 25000, max: 40000 },
  { label: "₹40,000–₹60,000", min: 40000, max: 60000 },
  { label: "Above ₹60,000", min: 60000, max: Infinity },
] as const

export const PRODUCTS: Product[] = [
  {
    id: "waak-01",
    slug: "ivory-embroidered-sherwani",
    backendId: "waak-01",
    name: "THE IVORY ZARDOZI SHERWANI",
    subtitle: "Handcrafted Heritage Couture with Fine Zardozi Wirework",
    price: 49500,
    originalPrice: 56000,
    category: "Indian Wear",
    subcategory: "Sherwanis",
    occasion: "Wedding",
    isNewArrival: true,
    isBestSeller: true,
    isSale: false,
    image: "/assets/products/ivory-sherwani.jpg",
    gallery: [
      "/assets/products/ivory-sherwani.jpg",
      "https://framerusercontent.com/images/pp3GZI1GsZMhdrNjwaCDmI8enmQ.jpg?scale-down-to=1024&width=1200&height=1800",
      "https://framerusercontent.com/images/bPaPYk8Lc16P8C7iNgdwFWSYU.jpg?scale-down-to=1024&width=800&height=1067"
    ],
    description: "A masterpiece of royal Indian occasionwear, spun from pure Banarasi silk and embellished with meticulous antique gold zardozi wirework along the mandarin collar and cuffs. Tailored to an architectural silhouette for the quintessential modern groom.",
    fabric: "Raw Banarasi silk blend, cotton-silk inner lining, dry clean only.",
    shipping: "Complimentary express insured shipping across India. Ships within 3-5 business days.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: true,
  },
  {
    id: "waak-02",
    slug: "midnight-embellished-sherwani",
    backendId: "waak-02",
    name: "MIDNIGHT VELVET SHERWANI",
    subtitle: "Regal Dark Navy Micro-Velvet with Tone-on-Tone Threadwork",
    price: 54500,
    originalPrice: 62000,
    category: "Indo Western & Jodhpuri",
    subcategory: "Indo Western",
    occasion: "Reception",
    isNewArrival: true,
    isBestSeller: true,
    isSale: false,
    image: "/assets/products/midnight-sherwani.jpg",
    gallery: [
      "/assets/products/midnight-sherwani.jpg",
      "https://framerusercontent.com/images/bPaPYk8Lc16P8C7iNgdwFWSYU.jpg?scale-down-to=1024&width=800&height=1067"
    ],
    description: "Exquisitely sculpted in deep midnight-blue micro-velvet, featuring discreet tone-on-tone resham threadwork that catches the light with subtle sophistication. Paired with churidar trousers for high-evening receptions.",
    fabric: "Matka silk & micro-velvet, dry clean only.",
    shipping: "Complimentary insured delivery. Custom tailoring and bespoke fittings available.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: true,
  },
  {
    id: "waak-03",
    slug: "mauve-bandhgala-set",
    backendId: "waak-03",
    name: "MAUVE RAW SILK BANDHGALA",
    subtitle: "Contemporary Jodhpuri Tailoring in Dusty Rose Raw Silk",
    price: 38500,
    originalPrice: 44000,
    category: "Indo Western & Jodhpuri",
    subcategory: "Bandhgala",
    occasion: "Cocktail",
    isNewArrival: true,
    isBestSeller: false,
    isSale: false,
    image: "/assets/products/mauve-bandhgala.jpg",
    gallery: [
      "/assets/products/mauve-bandhgala.jpg",
      "https://framerusercontent.com/images/sEjecmCMpBNZkKUzeeEc98FYXIc.jpg?scale-down-to=1024&width=800&height=1422"
    ],
    description: "Understated luxury defined. Cut from crisp Bhagalpur raw silk in a muted dusty mauve tone, accented with custom antique-brass buttons crafted in Varanasi. An elevated statement for Sangeet evenings and cocktail galas.",
    fabric: "Bhagalpur raw silk-wool blend with breathable viscose lining.",
    shipping: "Ships in 3-5 business days in custom garment bag.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: true,
  },
  {
    id: "waak-04",
    slug: "emerald-kurta-set",
    backendId: "waak-04",
    name: "EMERALD TUSSAR SILK KURTA",
    subtitle: "Artisanal Festive Kurta Set with Chanderi Dupatta",
    price: 24500,
    originalPrice: 29000,
    category: "Kurta Sets",
    subcategory: "Kurta Sets",
    occasion: "Festive",
    isNewArrival: true,
    isBestSeller: false,
    isSale: true,
    image: "/assets/products/emerald-kurta.jpg",
    gallery: [
      "/assets/products/emerald-kurta.jpg",
      "https://framerusercontent.com/images/sEjecmCMpBNZkKUzeeEc98FYXIc.jpg?scale-down-to=1024&width=800&height=1422"
    ],
    description: "Deep jewel-toned emerald green Tussar silk kurta set highlighted with fine needlework details along the placket. Includes tailored ivory churidar and a matching Chanderi silk stole.",
    fabric: "Pure Banarasi woven silk and chanderi.",
    shipping: "Complimentary delivery and free size exchange.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: true,
  },
  {
    id: "black-tailored-suit",
    slug: "black-tailored-suit",
    name: "BLACK TAILORED SUIT",
    price: 18900,
    category: "Suits & Blazers",
    subcategory: "Suits",
    occasion: "Formal",
    isBestSeller: true,
    image: "https://framerusercontent.com/images/8OOwfRibO6K52kkHqENwFhHk.jpg?scale-down-to=1024&width=800&height=1200",
    gallery: [
      "https://framerusercontent.com/images/8OOwfRibO6K52kkHqENwFhHk.jpg?scale-down-to=1024&width=800&height=1200"
    ],
    description: "Masterfully tailored Italian wool blend two-piece suit with satin peak lapels and structured modern drop.",
    fabric: "Super 120s wool blend with satin lapels.",
    shipping: "Ships in 4 business days.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: false,
  },
  {
    id: "navy-waistcoat",
    slug: "navy-waistcoat",
    name: "NAVY EMBROIDERED WAISTCOAT",
    price: 4900,
    category: "Waistcoats",
    subcategory: "Waistcoats",
    occasion: "Festive",
    isBestSeller: false,
    image: "https://framerusercontent.com/images/JWwUlA5771fMDk5znHkRenQxbg.jpg?scale-down-to=1024&width=800&height=1200",
    gallery: [
      "https://framerusercontent.com/images/JWwUlA5771fMDk5znHkRenQxbg.jpg?scale-down-to=1024&width=800&height=1200"
    ],
    description: "Contemporary Nehru jacket in rich navy linen-silk featuring subtle floral hand-embroidery on the chest pocket.",
    fabric: "Linen silk with breathable cotton lining.",
    shipping: "Ships in 24 hours.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: false,
  },
  {
    id: "cream-occasion-kurta",
    slug: "cream-occasion-kurta",
    name: "CREAM OCCASIONWEAR SET",
    price: 14500,
    category: "Kurta Sets",
    subcategory: "Kurta Sets",
    occasion: "Mehendi / Haldi",
    isBestSeller: false,
    image: "https://framerusercontent.com/images/sVc5PIkY7R6v5lV2Y29vq3zyLc.jpg?scale-down-to=1024&width=800&height=1200",
    gallery: [
      "https://framerusercontent.com/images/sVc5PIkY7R6v5lV2Y29vq3zyLc.jpg?scale-down-to=1024&width=800&height=1200"
    ],
    description: "Pure chanderi silk kurta in soft cream with mirror-work accents and comfortable straight-cut pyjama trousers.",
    fabric: "Pure Chanderi silk, cotton voile inner.",
    shipping: "Complimentary delivery.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: false,
  },
  {
    id: "regal-velvet-sherwani",
    slug: "regal-velvet-sherwani",
    name: "EMBROIDERED CEREMONIAL SHERWANI",
    price: 32500,
    category: "Indian Wear",
    subcategory: "Sherwanis",
    occasion: "Wedding",
    isBestSeller: true,
    image: "https://framerusercontent.com/images/CcjHS0HwXhKoHy6BfqZXfxE9rM.jpg?scale-down-to=1024&width=800&height=1200",
    gallery: [
      "https://framerusercontent.com/images/CcjHS0HwXhKoHy6BfqZXfxE9rM.jpg?scale-down-to=1024&width=800&height=1200"
    ],
    description: "Deep wine micro-velvet sherwani embellished with antique zardozi and dabka embroidery, tailored for high heritage weddings.",
    fabric: "Micro-velvet with metallic thread hand embroidery.",
    shipping: "Custom tailored and insured shipment.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: false,
  },
  {
    id: "black-waistcoat",
    slug: "black-waistcoat",
    name: "BLACK CLASSIC WAISTCOAT",
    price: 6500,
    category: "Waistcoats",
    subcategory: "Waistcoats",
    occasion: "Formal",
    isBestSeller: false,
    image: "https://framerusercontent.com/images/AWRFGHLQL2TELtktdZ9LGhrUQ.jpg?scale-down-to=1024&width=800&height=1200",
    gallery: [
      "https://framerusercontent.com/images/AWRFGHLQL2TELtktdZ9LGhrUQ.jpg?scale-down-to=1024&width=800&height=1200"
    ],
    description: "Jet black textured bandhgala waistcoat with brushed metallic buttons and clean minimalist silhouette.",
    fabric: "Textured poly-viscose with satin inner back.",
    shipping: "Ships in 2-3 business days.",
    availableSizes: ["38", "40", "42", "44"],
    isAvailableInBackend: false,
  }
]

export function findProduct(idOrSlug: string): Product | undefined {
  if (!idOrSlug) return PRODUCTS[0]
  return PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug || p.backendId === idOrSlug)
}
