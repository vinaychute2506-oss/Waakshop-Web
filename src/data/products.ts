export interface Product {
  id: string
  name: string
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
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000–₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000–₹20,000", min: 10000, max: 20000 },
  { label: "₹20,000–₹30,000", min: 20000, max: 30000 },
  { label: "Above ₹30,000", min: 30000, max: Infinity },
] as const

export const PRODUCTS: Product[] = [
  {
    id: "ivory-embroidered-sherwani",
    name: "IVORY EMBROIDERED SHERWANI",
    price: 24500,
    originalPrice: 28000,
    category: "Indian Wear",
    subcategory: "Sherwanis",
    occasion: "Wedding",
    isNewArrival: true,
    isBestSeller: true,
    image: "/assets/products/ivory-sherwani.jpg",
    gallery: [
      "/assets/products/ivory-sherwani.jpg",
      "https://framerusercontent.com/images/pp3GZI1GsZMhdrNjwaCDmI8enmQ.jpg?scale-down-to=1024&width=1200&height=1800",
      "https://framerusercontent.com/images/bPaPYk8Lc16P8C7iNgdwFWSYU.jpg?scale-down-to=1024&width=800&height=1067"
    ],
    description: "Designed for the groom who commands authority. This ivory sherwani set features intricate tonal threadwork across the collar, front placket, and hem, finished with a hand-draped matching silk stole.",
    fabric: "Raw silk blend, cotton silk lining, dry clean only.",
    shipping: "Complimentary express shipping across India. Ships within 3-5 business days."
  },
  {
    id: "midnight-embellished-sherwani",
    name: "MIDNIGHT EMBELLISHED SHERWANI",
    price: 22800,
    originalPrice: 26500,
    category: "Indo Western & Jodhpuri",
    subcategory: "Indo Western",
    occasion: "Reception",
    isNewArrival: true,
    isBestSeller: true,
    image: "/assets/products/midnight-sherwani.jpg",
    gallery: [
      "/assets/products/midnight-sherwani.jpg",
      "https://framerusercontent.com/images/bPaPYk8Lc16P8C7iNgdwFWSYU.jpg?scale-down-to=1024&width=800&height=1067"
    ],
    description: "A regal midnight blue Indo-Western jacket with geometric tonal sequin embroidery, paired with a matching deep navy inner kurta and tailored trousers.",
    fabric: "Matka silk & brocade, dry clean only.",
    shipping: "Complimentary insured delivery. Custom tailoring available."
  },
  {
    id: "mauve-bandhgala-set",
    name: "MAUVE BANDHGALA SET",
    price: 18900,
    originalPrice: 21500,
    category: "Indo Western & Jodhpuri",
    subcategory: "Bandhgala",
    occasion: "Cocktail",
    isNewArrival: true,
    isBestSeller: false,
    image: "/assets/products/mauve-bandhgala.jpg",
    gallery: [
      "/assets/products/mauve-bandhgala.jpg",
      "https://framerusercontent.com/images/sEjecmCMpBNZkKUzeeEc98FYXIc.jpg?scale-down-to=1024&width=800&height=1422"
    ],
    description: "Modern understated luxury in dusty mauve. Crafted in structured silk-wool blend with custom tone-on-tone buttons and sharp silhouette.",
    fabric: "Wool-silk blend with viscose lining.",
    shipping: "Ships in 3-5 business days in custom garment bag."
  },
  {
    id: "emerald-kurta-set",
    name: "EMERALD KURTA SET",
    price: 16800,
    originalPrice: 19500,
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
    description: "Deep emerald silk kurta layered with a rich geometric brocade waistcoat, finished with mother-of-pearl buttons and tailored ivory churidar.",
    fabric: "Pure Banarasi woven silk and chanderi.",
    shipping: "Complimentary delivery and free size exchange."
  },
  {
    id: "black-tailored-suit",
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
    shipping: "Ships in 4 business days."
  },
  {
    id: "navy-waistcoat",
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
    shipping: "Ships in 24 hours."
  },
  {
    id: "cream-occasion-kurta",
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
    shipping: "Complimentary delivery."
  },
  {
    id: "regal-velvet-sherwani",
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
    shipping: "Custom tailored and insured shipment."
  },
  {
    id: "black-waistcoat",
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
    shipping: "Ships in 2-3 business days."
  }
]
