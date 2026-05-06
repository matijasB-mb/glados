import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  restaurantId: null,
  restaurantName: '',
  items: [],

  addItem(restaurantId, restaurantName, item) {
    const { items, restaurantId: currentRestaurantId } = get()

    // Clear cart if switching restaurant
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      set({ restaurantId, restaurantName, items: [{ ...item, quantity: 1 }] })
      return
    }

    const existing = items.find(
      i => i.id === item.id && i.modifications === item.modifications
    )
    if (existing) {
      set({
        items: items.map(i =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ restaurantId, restaurantName, items: [...items, { ...item, quantity: 1 }] })
    }
  },

  removeItem(itemId, modifications) {
    const { items } = get()
    const existing = items.find(
      i => i.id === itemId && i.modifications === modifications
    )
    if (!existing) return
    if (existing.quantity === 1) {
      const next = items.filter(i => i !== existing)
      set({ items: next, ...(next.length === 0 ? { restaurantId: null, restaurantName: '' } : {}) })
    } else {
      set({ items: items.map(i => i === existing ? { ...i, quantity: i.quantity - 1 } : i) })
    }
  },

  clearCart() {
    set({ restaurantId: null, restaurantName: '', items: [] })
  },

  get subtotal() {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  },

  get totalItems() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0)
  },
}))
