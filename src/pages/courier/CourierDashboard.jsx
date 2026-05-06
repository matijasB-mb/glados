import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Bike } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/formatPrice'

export function CourierDashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [courier, setCourier] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

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
    setOrders(data ?? [])
  }

  // Real-time subscription
  useEffect(() => {
    if (!courier) return
    const channel = supabase
      .channel(`courier-orders-${courier.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, () => {
        loadOrders(courier.id)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [courier])

  async function claimOrder(orderId) {
    setUpdatingId(orderId)
    await supabase
      .from('orders')
      .update({ status: 'delivering', courier_id: courier.id, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('status', 'ready')
    await loadOrders(courier.id)
    setUpdatingId(null)
  }

  async function markDelivered(orderId) {
    setUpdatingId(orderId)
    await supabase
      .from('orders')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('courier_id', courier.id)
    await loadOrders(courier.id)
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
  const todayEarnings = myDone.reduce((sum, o) => sum + Number(o.total_amount) * 0.1, 0) // 10% of order value as delivery fee

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="light" className="h-8 w-auto" />
          <div>
            <p className="font-bold">{courier.name}</p>
            <p className="text-xs text-white/40">Dostavljač panel</p>
          </div>
        </div>
        <button onClick={signOut} className="text-sm text-white/40 hover:text-white transition-colors">Odjava</button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Dostavljeno danas', value: myDone.length },
            { label: 'U dostavi', value: myActive.length },
            { label: 'Zarada danas', value: formatPrice(todayEarnings) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-navy">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* My active delivery */}
        {myActive.length > 0 && (
          <section className="mb-6">
            <h2 className="font-bold text-navy mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Moja dostava ({myActive.length})
            </h2>
            <div className="space-y-3">
              {myActive.map(order => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  updating={updatingId === order.id}
                  action={{ label: '✓ Dostavljeno', onClick: () => markDelivered(order.id), variant: 'primary' }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available for pickup */}
        {available.length > 0 && (
          <section className="mb-6">
            <h2 className="font-bold text-navy mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow rounded-full animate-pulse" />
              Spremno za preuzimanje ({available.length})
            </h2>
            <div className="space-y-3">
              {available.map(order => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  updating={updatingId === order.id}
                  action={{ label: 'Preuzmi dostavu', onClick: () => claimOrder(order.id), variant: 'secondary' }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed today */}
        {myDone.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-500 mb-3">Završene danas ({myDone.length})</h2>
            <div className="space-y-2">
              {myDone.map(order => (
                <div key={order.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-navy">#{order.order_number}</span>
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
          <div className="text-center py-16 text-gray-400">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bike className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
            </div>
            <p>Nema dostava za preuzimanje.</p>
            <p className="text-sm mt-1">Narudžbe sa statusom "Spremno" pojavit će se ovdje.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DeliveryCard({ order, updating, action }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-yellow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-bold text-navy">#{order.order_number} — {order.customer_name}</p>
            <p className="text-sm text-gray-500 mt-0.5">🍽️ {order.restaurants?.name}</p>
            <p className="text-sm text-gray-500">📍 {order.delivery_address}</p>
            <p className="text-sm text-gray-500">📞 {order.customer_phone}</p>
          </div>
          <Badge status={order.status} />
        </div>

        <div className="space-y-1 mb-3">
          {(order.order_items ?? []).map(item => (
            <p key={item.id} className="text-sm text-gray-600">
              {item.quantity}× {item.menu_item_name}
            </p>
          ))}
        </div>

        {order.notes && (
          <p className="text-sm text-yellow font-medium mb-3">📝 {order.notes}</p>
        )}

        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-navy text-lg">{formatPrice(order.total_amount)}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Gotovina</span>
        </div>

        <Button variant={action.variant} size="full" onClick={action.onClick} disabled={updating}>
          {updating ? 'Ažuriranje...' : action.label}
        </Button>
      </div>
    </div>
  )
}
