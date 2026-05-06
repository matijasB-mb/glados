import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useCartStore } from '../../store/cartStore'
import { Navbar } from '../../components/customer/Navbar'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/formatPrice'

export function RestaurantPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)

  const addItem = useCartStore(s => s.addItem)
  const cartRestaurantId = useCartStore(s => s.restaurantId)
  const cartItems = useCartStore(s => s.items)
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    async function load() {
      const { data: rest } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single()
      if (!rest) { navigate('/'); return }
      setRestaurant(rest)

      const { data: cats } = await supabase
        .from('menu_categories')
        .select('*, menu_items(*)')
        .eq('restaurant_id', rest.id)
        .order('sort_order')
      setCategories(cats ?? [])
      if (cats?.[0]) setActiveCategory(cats[0].id)
      setLoading(false)
    }
    load()
  }, [slug, navigate])

  function handleAdd(item) {
    if (cartRestaurantId && cartRestaurantId !== restaurant.id) {
      if (!window.confirm('Imate artikle iz drugog restorana. Želi početi novu narudžbu?')) return
    }
    addItem(restaurant.id, restaurant.name, { id: item.id, name: item.name, price: item.price, modifications: '' })
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center py-24"><Spinner size="lg" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Restaurant header */}
      <div className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex items-center gap-5">
          <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <img src="/assets/frankie-logo.png" alt={restaurant.name} className="w-16 h-16 object-contain" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <div className="flex items-center gap-4 text-sm text-blue-200 mt-1">
              <span>{restaurant.delivery_time_min}–{restaurant.delivery_time_max} min dostava</span>
              <span>Min. {Number(restaurant.min_order_amount).toFixed(2)} €</span>
              <span className={`font-semibold ${restaurant.is_open ? 'text-green-300' : 'text-red-300'}`}>
                {restaurant.is_open ? '● Otvoreno' : '● Zatvoreno'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Menu */}
          <div className="flex-1 min-w-0">
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-navy text-white'
                      : 'bg-white text-navy hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Items */}
            {categories
              .filter(cat => !activeCategory || cat.id === activeCategory)
              .map(cat => (
                <div key={cat.id} className="mb-8">
                  <h2 className="text-lg font-bold text-navy mb-3">{cat.name}</h2>
                  <div className="space-y-3">
                    {(cat.menu_items ?? [])
                      .filter(item => item.is_available)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(item => (
                        <MenuItemCard key={item.id} item={item} onAdd={() => handleAdd(item)} isOpen={restaurant.is_open} />
                      ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Cart sidebar — desktop */}
          {totalItems > 0 && (
            <div className="hidden lg:block w-80 shrink-0">
              <CartSidebar
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
                items={cartItems}
                subtotal={subtotal}
                minOrder={restaurant.min_order_amount}
                onCheckout={() => navigate('/checkout')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-4 z-40">
          <Button size="full" onClick={() => navigate('/checkout')}>
            <span className="flex-1 text-left">Košarica ({totalItems})</span>
            <span>{formatPrice(subtotal)}</span>
          </Button>
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ item, onAdd, isOpen }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-navy">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <p className="font-bold text-navy mt-2">{formatPrice(item.price)}</p>
      </div>
      {isOpen && (
        <button
          onClick={onAdd}
          className="shrink-0 w-9 h-9 bg-yellow text-navy rounded-xl font-bold text-xl flex items-center justify-center hover:bg-yellow-dark transition-colors self-center"
        >
          +
        </button>
      )}
    </div>
  )
}

function CartSidebar({ restaurantId, restaurantName, items, subtotal, minOrder, onCheckout }) {
  const { removeItem, addItem } = useCartStore()
  const belowMin = subtotal < minOrder

  return (
    <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-navy text-lg mb-4">Košarica</h3>
      <div className="space-y-3 mb-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
              <button onClick={() => removeItem(item.id, item.modifications)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-navy">−</button>
              <span className="w-5 text-center text-sm font-semibold text-navy">{item.quantity}</span>
              <button onClick={() => addItem(restaurantId, restaurantName, item)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-navy">+</button>
            </div>
            <span className="flex-1 text-sm text-navy truncate">{item.name}</span>
            <span className="text-sm font-semibold text-navy shrink-0">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-3 mb-4">
        <div className="flex justify-between font-bold text-navy">
          <span>Ukupno</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {belowMin && (
          <p className="text-xs text-red-500 mt-1">Minimalna narudžba: {formatPrice(minOrder)}</p>
        )}
      </div>
      <Button size="full" onClick={onCheckout} disabled={belowMin}>
        Na naplatu
      </Button>
    </div>
  )
}
