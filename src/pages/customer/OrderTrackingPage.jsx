import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Navbar } from '../../components/customer/Navbar'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/formatPrice'
import { Clock, CheckCircle2, ChefHat, Bike, XCircle, Package } from 'lucide-react'

const STATUS_ICON_COMPONENTS = {
  pending: Clock,
  accepted: CheckCircle2,
  preparing: ChefHat,
  delivering: Bike,
  delivered: CheckCircle2,
  declined: XCircle,
  cancelled: XCircle,
}

function StatusIcon({ status }) {
  const Icon = STATUS_ICON_COMPONENTS[status] ?? Package
  const isError = status === 'declined' || status === 'cancelled'
  const isSuccess = status === 'delivered'
  return (
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
      isError ? 'bg-red-500/20' : isSuccess ? 'bg-yellow/20' : 'bg-white/15'
    }`}>
      <Icon className={`w-7 h-7 ${isError ? 'text-red-300' : isSuccess ? 'text-yellow' : 'text-white'}`} strokeWidth={1.5} />
    </div>
  )
}

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'delivering', 'delivered']
const STATUS_LABELS = {
  pending: 'Narudžba primljena',
  accepted: 'Restoran prihvatio',
  preparing: 'U pripremi',
  delivering: 'U dostavi',
  delivered: 'Dostavljeno',
  declined: 'Odbijeno',
  cancelled: 'Otkazano',
}
// Status icons replaced with Lucide SVGs — no emojis
const STATUS_ICON_MAP = {
  pending: 'Clock',
  accepted: 'CheckCircle2',
  preparing: 'ChefHat',
  delivering: 'Bike',
  delivered: 'CheckCircle2',
  declined: 'XCircle',
  cancelled: 'XCircle',
}

export function OrderTrackingPage() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, restaurants(name, delivery_time_min, delivery_time_max)')
        .eq('order_number', orderNumber)
        .single()
      if (data) {
        setOrder(data)
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', data.id)
        setItems(orderItems ?? [])
      }
      setLoading(false)
    }
    loadOrder()

    // Real-time updates
    const channel = supabase
      .channel(`order-${orderNumber}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `order_number=eq.${orderNumber}`,
      }, payload => {
        setOrder(prev => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [orderNumber])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center py-24"><Spinner size="lg" /></div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 text-lg mb-4">Narudžba nije pronađena.</p>
        <Link to="/" className="text-yellow font-semibold hover:underline">Na naslovnicu</Link>
      </div>
    </div>
  )

  const isTerminal = ['delivered', 'declined', 'cancelled'].includes(order.status)
  const currentStepIdx = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="bg-navy text-white rounded-2xl p-6 mb-5 text-center">
          <StatusIcon status={order.status} />
          <h1 className="text-xl font-bold">{STATUS_LABELS[order.status]}</h1>
          <p className="text-blue-200 text-sm mt-1">Narudžba #{order.order_number}</p>
          {order.estimated_delivery_minutes && order.status !== 'delivered' && !['declined', 'cancelled'].includes(order.status) && (
            <p className="text-yellow font-semibold mt-2">~{order.estimated_delivery_minutes} min do dostave</p>
          )}
          {order.decline_reason && (
            <p className="text-red-300 text-sm mt-2">Razlog: {order.decline_reason}</p>
          )}
        </div>

        {/* Progress bar */}
        {!['declined', 'cancelled'].includes(order.status) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    idx <= currentStepIdx ? 'bg-yellow text-navy' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {idx < currentStepIdx ? '✓' : idx + 1}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded transition-colors ${idx < currentStepIdx ? 'bg-yellow' : 'bg-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-sm font-semibold text-navy">
              {STATUS_LABELS[order.status]}
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-bold text-navy mb-3">Detalji narudžbe</h2>
          <p className="text-sm text-gray-500 mb-3">{order.restaurants?.name}</p>
          <div className="space-y-2 mb-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.quantity}× {item.menu_item_name}</span>
                <span className="font-medium text-navy">{formatPrice(item.item_total)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-navy">
            <span>Ukupno</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <p>📍 {order.delivery_address}</p>
            {order.notes && <p className="mt-1">📝 {order.notes}</p>}
          </div>
        </div>

        <Link to="/" className="block text-center text-sm text-gray-500 hover:text-navy transition-colors">
          ← Natrag na naslovnicu
        </Link>
      </div>
    </div>
  )
}
