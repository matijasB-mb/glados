import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/formatPrice'

const AUTO_CANCEL_SECONDS = 180

export function RestaurantDashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/restaurant/prijava')
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    async function init() {
      const { data: staff } = await supabase
        .from('restaurant_staff')
        .select('restaurant_id, restaurants(*)')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (!staff) { navigate('/restaurant/prijava'); return }

      setRestaurantId(staff.restaurant_id)
      setRestaurant(staff.restaurants)

      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('restaurant_id', staff.restaurant_id)
        .gte('created_at', new Date().toISOString().slice(0, 10))
        .order('created_at', { ascending: false })

      setOrders(todayOrders ?? [])
      setLoading(false)
    }
    init()
  }, [user, navigate])

  useEffect(() => {
    if (!restaurantId) return
    const channel = supabase
      .channel(`restaurant-orders-${restaurantId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [{ ...payload.new, order_items: [] }, ...prev])
          // Fetch items for new order
          supabase.from('order_items').select('*').eq('order_id', payload.new.id).then(({ data }) => {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, order_items: data ?? [] } : o))
          })
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [restaurantId])

  async function updateStatus(orderId, status, extra = {}) {
    setUpdatingId(orderId)
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString(), ...extra }).eq('id', orderId)
    setUpdatingId(null)
  }

  async function toggleOpen() {
    if (!restaurant) return
    const newVal = !restaurant.is_open
    await supabase.from('restaurants').update({ is_open: newVal }).eq('id', restaurantId)
    setRestaurant(r => ({ ...r, is_open: newVal }))
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/restaurant/prijava')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  const pending = orders.filter(o => o.status === 'pending')
  const active = orders.filter(o => ['accepted', 'preparing', 'ready', 'delivering'].includes(o.status))
  const done = orders.filter(o => ['delivered', 'declined', 'cancelled'].includes(o.status))
  const todayRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount), 0)
  const todayCommission = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.commission_amount), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="light" className="h-8 w-auto" />
          <div>
            <p className="font-bold">{restaurant?.name}</p>
            <p className="text-xs text-blue-300">Panel restorana</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOpen}
            className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${restaurant?.is_open ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-500 text-white hover:bg-gray-600'}`}
          >
            {restaurant?.is_open ? '● Otvoreno' : '● Zatvoreno'}
          </button>
          <button onClick={signOut} className="text-sm text-blue-300 hover:text-white transition-colors">Odjava</button>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Narudžbe danas', value: orders.length },
            { label: 'Prihod danas', value: formatPrice(todayRevenue) },
            { label: 'Provizija', value: formatPrice(todayCommission) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-navy">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending orders (most urgent) */}
        {pending.length > 0 && (
          <section className="mb-6">
            <h2 className="font-bold text-navy mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow rounded-full animate-pulse" />
              Nova narudžba ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updating={updatingId === order.id}
                  onAccept={(eta) => updateStatus(order.id, 'accepted', { estimated_delivery_minutes: eta })}
                  onDecline={(reason) => updateStatus(order.id, 'declined', { decline_reason: reason })}
                  showTimer
                  onAutoCancel={() => updateStatus(order.id, 'cancelled', { decline_reason: 'Automatski otkazano — bez odgovora' })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active orders */}
        {active.length > 0 && (
          <section className="mb-6">
            <h2 className="font-bold text-navy mb-3">Aktivne narudžbe ({active.length})</h2>
            <div className="space-y-3">
              {active.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updating={updatingId === order.id}
                  onAdvance={() => {
                    const next = { accepted: 'preparing', preparing: 'ready' }
                    if (next[order.status]) updateStatus(order.id, next[order.status])
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {done.length > 0 && (
          <section>
            <h2 className="font-bold text-navy mb-3 text-gray-500">Završene ({done.length})</h2>
            <div className="space-y-2">
              {done.slice(0, 10).map(order => (
                <div key={order.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-navy">#{order.order_number}</span>
                    <span className="text-sm text-gray-500 ml-2">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-navy">{formatPrice(order.total_amount)}</span>
                    <Badge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p>Nema narudžbi danas. Čekamo ih!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, updating, onAccept, onDecline, onAdvance, showTimer, onAutoCancel }) {
  const [timeLeft, setTimeLeft] = useState(AUTO_CANCEL_SECONDS)
  const [eta, setEta] = useState(30)
  const [declineReason, setDeclineReason] = useState('')
  const [showDecline, setShowDecline] = useState(false)

  useEffect(() => {
    if (!showTimer) return
    const created = new Date(order.created_at).getTime()
    const elapsed = Math.floor((Date.now() - created) / 1000)
    const remaining = AUTO_CANCEL_SECONDS - elapsed
    if (remaining <= 0) { onAutoCancel?.(); return }
    setTimeLeft(remaining)

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); onAutoCancel?.(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showTimer, order.created_at])

  const nextLabel = { accepted: 'U pripremi', preparing: 'Spremno za dostavu' }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-yellow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-bold text-navy">#{order.order_number} — {order.customer_name}</p>
            <p className="text-sm text-gray-500">📍 {order.delivery_address}</p>
            <p className="text-sm text-gray-500">📞 {order.customer_phone}</p>
          </div>
          <div className="text-right shrink-0">
            <Badge status={order.status} />
            {showTimer && (
              <p className={`text-sm font-bold mt-1 ${timeLeft < 60 ? 'text-red-500' : 'text-gray-500'}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1 mb-3">
          {(order.order_items ?? []).map(item => (
            <p key={item.id} className="text-sm text-gray-700">
              {item.quantity}× {item.menu_item_name}
              {item.modifications && <span className="text-gray-400"> ({item.modifications})</span>}
            </p>
          ))}
        </div>

        {order.notes && <p className="text-sm text-yellow font-medium mb-3">📝 {order.notes}</p>}

        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-navy text-lg">{formatPrice(order.total_amount)}</span>
          <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Actions */}
        {onAccept && !showDecline && (
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1">
              <select
                value={eta}
                onChange={e => setEta(Number(e.target.value))}
                className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-navy focus:border-yellow outline-none"
              >
                {[15, 20, 25, 30, 35, 40, 45, 60].map(m => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
              <Button variant="primary" onClick={() => onAccept(eta)} disabled={updating} className="flex-1">
                ✓ Prihvati
              </Button>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDecline(true)}>
              ✕
            </Button>
          </div>
        )}

        {showDecline && (
          <div className="space-y-2">
            <input
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="Razlog odbijanja (opcionalno)"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400"
            />
            <div className="flex gap-2">
              <Button variant="danger" size="full" onClick={() => onDecline(declineReason)} disabled={updating}>
                Odbij narudžbu
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDecline(false)}>Odustani</Button>
            </div>
          </div>
        )}

        {onAdvance && nextLabel[order.status] && (
          <Button variant="secondary" size="full" onClick={onAdvance} disabled={updating}>
            → {nextLabel[order.status]}
          </Button>
        )}
      </div>
    </div>
  )
}
