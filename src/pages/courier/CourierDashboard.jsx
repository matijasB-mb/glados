import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/formatPrice'
import { playReadyAlert } from '../../utils/sound'
import { Bike, Phone, MapPin, Store, FileText, LogOut } from 'lucide-react'

export function CourierDashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [courier, setCourier] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const prevAvailableCount = useRef(0)

  useEffect(() => {
    if (!authLoading && !user) navigate('/courier/prijava')
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    async function init() {
      const { data: courierData } = await supabase
        .from('couriers')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (!courierData) { navigate('/courier/prijava'); return }
      setCourier(courierData)
      await loadOrders(courierData.id)
      setLoading(false)
    }
    init()
  }, [user, navigate])

  async function loadOrders(courierId) {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('orders')
      .select('*, restaurants(name), order_items(*)')
      .or(`status.eq.ready,and(courier_id.eq.${courierId},status.in.(delivering,delivered))`)
      .gte('created_at', today)
      .order('created_at', { ascending: false })
    return data ?? []
  }

  // Realtime subscription
  useEffect(() => {
    if (!courier) return
    const channel = supabase
      .channel(`courier-orders-${courier.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, async () => {
        const fresh = await loadOrders(courier.id)
        const newAvailable = fresh.filter(o => o.status === 'ready' && !o.courier_id).length

        // Play sound and browser notification when new ready orders appear
        if (newAvailable > prevAvailableCount.current) {
          playReadyAlert()
          if (Notification.permission === 'granted') {
            new Notification('Narudžba spremna za preuzimanje!', {
              body: 'Nova narudžba čeka u restoranu.',
              icon: '/favicon.svg',
              tag: 'ready-order',
            })
          }
        }
        prevAvailableCount.current = newAvailable
        setOrders(fresh)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [courier])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  async function claimOrder(orderId) {
    setUpdatingId(orderId)
    await supabase
      .from('orders')
      .update({ status: 'delivering', courier_id: courier.id, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('status', 'ready')
    const fresh = await loadOrders(courier.id)
    setOrders(fresh)
    setUpdatingId(null)
  }

  async function markDelivered(orderId) {
    setUpdatingId(orderId)
    await supabase
      .from('orders')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('courier_id', courier.id)
    const fresh = await loadOrders(courier.id)
    setOrders(fresh)
    setUpdatingId(null)
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/courier/prijava')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  const available = orders.filter(o => o.status === 'ready' && !o.courier_id)
  const myActive = orders.filter(o => o.courier_id === courier.id && o.status === 'delivering')
  const myDone = orders.filter(o => o.courier_id === courier.id && o.status === 'delivered')
  const todayEarnings = myDone.reduce((sum, o) => sum + Number(o.total_amount) * 0.1, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <Logo variant="light" className="h-8 w-auto" />
          <div>
            <p className="font-bold text-sm">{courier.name}</p>
            <p className="text-xs text-white/40">Dostavljač</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {available.length > 0 && (
            <span className="bg-yellow text-navy text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
              {available.length} {available.length === 1 ? 'spreman' : 'spremno'}
            </span>
          )}
          <button onClick={signOut} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Dostavljeno', value: myDone.length },
            { label: 'U dostavi', value: myActive.length },
            { label: 'Zarada danas', value: formatPrice(todayEarnings) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-xl font-black text-navy">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* My active delivery */}
        {myActive.length > 0 && (
          <section className="mb-6">
            <h2 className="font-black text-navy mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Moja dostava ({myActive.length})
            </h2>
            <div className="space-y-3">
              {myActive.map(order => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  updating={updatingId === order.id}
                  onAction={() => markDelivered(order.id)}
                  actionLabel="Dostavljeno"
                  actionVariant="primary"
                  isActive
                />
              ))}
            </div>
          </section>
        )}

        {/* Available for pickup */}
        {available.length > 0 && (
          <section className="mb-6">
            <h2 className="font-black text-navy mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <span className="w-2 h-2 bg-yellow rounded-full animate-pulse" />
              Spremo za preuzimanje ({available.length})
            </h2>
            <div className="space-y-3">
              {available.map(order => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  updating={updatingId === order.id}
                  onAction={() => claimOrder(order.id)}
                  actionLabel="Preuzmi dostavu"
                  actionVariant="secondary"
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed today */}
        {myDone.length > 0 && (
          <section>
            <h2 className="font-semibold text-gray-400 mb-3 text-sm uppercase tracking-wide">Završene danas ({myDone.length})</h2>
            <div className="space-y-2">
              {myDone.map(order => (
                <div key={order.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-navy">#{order.order_number}</span>
                    <span className="text-sm text-gray-500 ml-2">{order.customer_name}</span>
                    <p className="text-xs text-gray-400">{order.restaurants?.name}</p>
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

        {available.length === 0 && myActive.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bike className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-gray-500">Nema dostava za preuzimanje</p>
            <p className="text-sm mt-1">Narudžbe sa statusom "Spremno" pojavit će se ovdje.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DeliveryCard({ order, updating, onAction, actionLabel, actionVariant, isActive }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${isActive ? 'border-blue-500' : 'border-yellow'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="font-black text-navy">#{order.order_number} — {order.customer_name}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
              <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{order.restaurants?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{order.delivery_address}</span>
            </div>
          </div>
          <Badge status={order.status} />
        </div>

        {/* Call button — prominent */}
        <a
          href={`tel:${order.customer_phone}`}
          className="flex items-center justify-center gap-2 w-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm px-4 py-3 rounded-xl hover:bg-blue-100 transition-colors mb-3"
        >
          <Phone className="w-4 h-4" />
          Nazovi kupca — {order.customer_phone}
        </a>

        {/* Items */}
        <div className="space-y-1 mb-3 bg-gray-50 rounded-xl p-3">
          {(order.order_items ?? []).map(item => (
            <p key={item.id} className="text-sm text-gray-700">
              <span className="font-bold">{item.quantity}×</span> {item.menu_item_name}
            </p>
          ))}
        </div>

        {order.notes && (
          <div className="flex items-start gap-2 mb-3 bg-yellow/10 rounded-xl px-3 py-2.5">
            <FileText className="w-4 h-4 text-yellow shrink-0 mt-0.5" />
            <p className="text-sm text-navy font-medium">{order.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <span className="font-black text-navy text-xl">{formatPrice(order.total_amount)}</span>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">Gotovina</span>
        </div>

        <Button variant={actionVariant} size="full" onClick={onAction} disabled={updating}>
          {updating ? 'Ažuriranje...' : actionLabel}
        </Button>
      </div>
    </div>
  )
}
