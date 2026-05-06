import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/formatPrice'
import { playOrderAlert } from '../../utils/sound'
import { MapPin, Phone, FileText, UtensilsCrossed, Bell, BellOff, LogOut } from 'lucide-react'

const AUTO_CANCEL_SECONDS = 180

export function RestaurantDashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [notifGranted, setNotifGranted] = useState(false)
  const restaurantIdRef = useRef(null)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/restaurant/prijava')
  }, [user, authLoading, navigate])

  // Request browser notification permission
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') { setNotifGranted(true); return }
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifGranted(p === 'granted'))
    }
  }, [])

  // Init: load restaurant + today's orders
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
      restaurantIdRef.current = staff.restaurant_id
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

  // Realtime subscription
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
          // Play sound + browser notification
          playOrderAlert()
          if (Notification.permission === 'granted') {
            new Notification('Nova narudžba!', {
              body: `${payload.new.customer_name} — ${formatPrice(payload.new.total_amount)}`,
              icon: '/favicon.svg',
              tag: 'new-order',
              requireInteraction: true,
            })
          }
          // Add order to state (items fetched separately)
          setOrders(prev => [{ ...payload.new, order_items: [] }, ...prev])
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

  // Update document title when there are pending orders
  useEffect(() => {
    const pending = orders.filter(o => o.status === 'pending')
    document.title = pending.length > 0
      ? `(${pending.length}) Nova narudžba! — Gladoš`
      : `${restaurant?.name ?? 'Restoran'} — Gladoš`
    return () => { document.title = 'Gladoš — Dostava hrane u Vrbovcu' }
  }, [orders, restaurant])

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
  const todayCommission = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.commission_amount ?? 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <Logo variant="light" className="h-8 w-auto" />
          <div>
            <p className="font-bold text-sm">{restaurant?.name}</p>
            <p className="text-xs text-white/40">Panel restorana</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification indicator */}
          <div
            title={notifGranted ? 'Obavijesti uključene' : 'Obavijesti isključene'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${notifGranted ? 'text-yellow/70' : 'text-white/30'}`}
          >
            {notifGranted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </div>
          {/* Pending badge on mobile */}
          {pending.length > 0 && (
            <span className="bg-yellow text-navy text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
              {pending.length} novo
            </span>
          )}
          <button
            onClick={toggleOpen}
            className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${restaurant?.is_open ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' : 'bg-white/10 text-white/50 border border-white/10 hover:bg-white/15'}`}
          >
            {restaurant?.is_open ? '● Otvoreno' : '● Zatvoreno'}
          </button>
          <button onClick={signOut} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Narudžbe danas', value: orders.length },
            { label: 'Prihod danas', value: formatPrice(todayRevenue) },
            { label: 'Provizija', value: formatPrice(todayCommission) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-xl font-black text-navy">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending — most urgent */}
        {pending.length > 0 && (
          <section className="mb-6">
            <h2 className="font-black text-navy mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
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

        {/* Active */}
        {active.length > 0 && (
          <section className="mb-6">
            <h2 className="font-black text-navy mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Aktivne ({active.length})
            </h2>
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
            <h2 className="font-semibold text-gray-400 mb-3 text-sm uppercase tracking-wide">Završene ({done.length})</h2>
            <div className="space-y-2">
              {done.slice(0, 10).map(order => (
                <div key={order.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-navy">#{order.order_number}</span>
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
          <div className="text-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-gray-500">Nema narudžbi danas</p>
            <p className="text-sm mt-1">Nova narudžba pojavit će se ovdje odmah.</p>
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
  const isUrgent = showTimer && timeLeft < 60

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${isUrgent ? 'border-red-500' : 'border-yellow'} ${showTimer ? 'ring-2 ring-yellow/20' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="font-black text-navy text-base">#{order.order_number} — {order.customer_name}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{order.delivery_address}</span>
            </div>
            <a
              href={`tel:${order.customer_phone}`}
              className="flex items-center gap-1.5 mt-0.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              {order.customer_phone}
            </a>
          </div>
          <div className="text-right shrink-0">
            <Badge status={order.status} />
            {showTimer && (
              <p className={`text-sm font-black mt-1.5 tabular-nums ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1 mb-3 bg-gray-50 rounded-xl p-3">
          {(order.order_items ?? []).length > 0
            ? (order.order_items ?? []).map(item => (
                <p key={item.id} className="text-sm text-gray-700">
                  <span className="font-bold">{item.quantity}×</span> {item.menu_item_name}
                  {item.modifications && <span className="text-gray-400"> — {item.modifications}</span>}
                </p>
              ))
            : <p className="text-sm text-gray-400 italic">Učitavanje stavki...</p>
          }
        </div>

        {order.notes && (
          <div className="flex items-start gap-2 mb-3 bg-yellow/10 rounded-xl px-3 py-2.5">
            <FileText className="w-4 h-4 text-yellow shrink-0 mt-0.5" />
            <p className="text-sm text-navy font-medium">{order.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <span className="font-black text-navy text-xl">{formatPrice(order.total_amount)}</span>
          <span className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Accept / Decline */}
        {onAccept && !showDecline && (
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1">
              <select
                value={eta}
                onChange={e => setEta(Number(e.target.value))}
                className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-navy focus:border-yellow outline-none bg-white"
              >
                {[15, 20, 25, 30, 35, 40, 45, 60].map(m => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
              <Button variant="primary" onClick={() => onAccept(eta)} disabled={updating} className="flex-1">
                {updating ? '...' : '✓ Prihvati'}
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
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400"
            />
            <div className="flex gap-2">
              <Button variant="danger" size="full" onClick={() => onDecline(declineReason)} disabled={updating}>
                {updating ? '...' : 'Odbij narudžbu'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDecline(false)}>Odustani</Button>
            </div>
          </div>
        )}

        {onAdvance && nextLabel[order.status] && (
          <Button variant="secondary" size="full" onClick={onAdvance} disabled={updating}>
            {updating ? '...' : `→ ${nextLabel[order.status]}`}
          </Button>
        )}
      </div>
    </div>
  )
}
