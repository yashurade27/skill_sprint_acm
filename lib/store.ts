import { create } from "zustand"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  isActive: boolean
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface StoreState {
  // Cart state
  cartItems: CartItem[]
  cartCount: number

  // Products state
  products: Product[]

  // UI state
  isLoading: boolean

  // Actions
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  setProducts: (products: Product[]) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  cartItems: [],
  cartCount: 0,
  products: [],
  isLoading: false,

  // Actions
  addToCart: (product) => {
    const { cartItems } = get()
    const existingItem = cartItems.find((item) => item.id === product.id)

    if (existingItem) {
      set({
        cartItems: cartItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
        cartCount: get().cartCount + 1,
      })
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      }
      set({
        cartItems: [...cartItems, newItem],
        cartCount: get().cartCount + 1,
      })
    }
  },

  removeFromCart: (productId) => {
    const { cartItems } = get()
    const item = cartItems.find((item) => item.id === productId)
    if (item) {
      set({
        cartItems: cartItems.filter((item) => item.id !== productId),
        cartCount: get().cartCount - item.quantity,
      })
    }
  },

  updateQuantity: (productId, quantity) => {
    const { cartItems } = get()
    const item = cartItems.find((item) => item.id === productId)

    if (item && quantity > 0) {
      const quantityDiff = quantity - item.quantity
      set({
        cartItems: cartItems.map((item) => (item.id === productId ? { ...item, quantity } : item)),
        cartCount: get().cartCount + quantityDiff,
      })
    } else if (quantity <= 0) {
      get().removeFromCart(productId)
    }
  },

  clearCart: () => {
    set({
      cartItems: [],
      cartCount: 0,
    })
  },

  setProducts: (products) => {
    set({ products })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },
}))
