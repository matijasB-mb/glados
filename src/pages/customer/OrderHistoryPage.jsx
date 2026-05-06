import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useCartStore } from '../../store/cartStore'
import { Navbar } from '../../components/customer/Navbar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/formatPrice'

export function OrderHistoryPage() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(s => s.addItem)
  const clearCart = useCartStore(s => s.clearCart)

  useEffect(() => {
    if (!authLoading && !user) navigate('/prijava')
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!profile?.id) return
    supabase
      .from('orders')
      .select('*, restaurants(name, slug), order_items(*)')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? [])
        setLoading(false)
      })
  }, [profile])

  async function handleReorder(order) {
    clearCart()
    const { data: items } = await supabase
      .from('order_items')
      .select('*, menu_items(id, price, is_available)')
      .eq('order_id', order.id)

    for (const item of items ?? []) {
      if (item.menu_items?.is_available) {
        addItem(order.restaurant_id, order.restaurants?.name, {
          id: item.menu_items.id,
          name: item.menu_item_name,
          price: item.menu_items.price,
          modifications: item.modifications ?? '',
        })
      }
    }
    navigate(`/restoran/${order.restaurants?.slug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy mb-6">Moje narudžbe</h1>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">Još niste naručili ništa.</p>
            <Button onClick={() => navigate('/')}>Naruči sada</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-navy">{order.restaurants?.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        #{order.order_number} · {new Date(order.created_at).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge status={order.status} />
                  </div>

                  <div className="mt-3 space-y-1">
                    {(order.order_items ?? []).map(item => (
                      <p key={item.id} className="text-sm text-gray-600">{item.quantity}× {item.menu_item_name}</p>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-navy">{formatPrice(order.total_amount)}</span>
                    <div className="flex gap-2">
                      <Link to={`/narudzba/${order.order_number}`} className="text-sm text-navy font-semibold hover:text-yellow transition-colors">
                        Prati
                      </Link>
                      <button
                        onClick={() => handleReorder(order)}
                        className="text-sm bg-yellow text-navy font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-dark transition-colors"
                      >
                        Naruči opet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
