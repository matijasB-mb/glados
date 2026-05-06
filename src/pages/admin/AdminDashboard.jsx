import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Logo } from '../../components/ui/Logo'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/formatPrice'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('orders')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    if (!authLoading && !user) { navigate('/admin/prijava'); return }
    if (!user) return

    supabase.from('platform_admins').select('*').eq('auth_user_id', user.id).single().then(({ data }) => {
      if (!data) navigate('/admin/prijava')
    })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    async function load() {
      const [{ data: ordersData }, { data: restaurantsData }] = await Promise.all([
        supabase.from('orders')
          .select('*, restaurants(name)')
          .gte('created_at', dateFilter)
          .lt('created_at', new Date(new Date(dateFilter).getTime() + 86400000).toISOString().slice(0, 10))
          .order('created_at', { ascending: false }),
        supabase.from('restaurants').select('*').order('name'),
      ])
      setOrders(ordersData ?? [])
      setRestaurants(restaurantsData ?? [])
      setLoading(false)
    }
    load()
  }, [user, dateFilter])

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/admin/prijava')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount), 0)
  const totalCommission = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.commission_amount), 0)
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="light" className="h-8 w-auto" />
          <div>
            <p className="font-bold">Admin panel</p>
            <p className="text-xs text-blue-300">Hoću Jesti</p>
          </div>
        </div>
        <button onClick={signOut} className="text-sm text-blue-300 hover:text-white transition-colors">Odjava</button>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Date picker */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-2 text-navy focus:border-yellow outline-none"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Narudžbe', value: orders.length },
            { label: 'Dostavljeno', value: deliveredCount },
            { label: 'Prihod', value: formatPrice(totalRevenue) },
            { label: 'Provizija', value: formatPrice(totalCommission) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-navy">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {['orders', 'restaurants'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-gray-100'}`}
            >
              {t === 'orders' ? 'Narudžbe' : 'Restorani'}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Narudžba</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Restoran</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Kupac</th>
                  <th className="text-right px-4 py-3">Iznos</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Provizija</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Vrijeme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-sm text-navy">#{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{order.restaurants?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{order.customer_name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-navy text-right">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right hidden md:table-cell">{formatPrice(order.commission_amount)}</td>
                    <td className="px-4 py-3 text-center"><Badge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400 text-right hidden md:table-cell">
                      {new Date(order.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nema narudžbi za odabrani datum.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'restaurants' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-navy">{r.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.is_open ? 'Otvoreno' : 'Zatvoreno'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{r.address}</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-500">Provizija</span>
                  <span className="font-semibold text-navy">{(r.commission_rate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Min. narudžba</span>
                  <span className="font-semibold text-navy">{formatPrice(r.min_order_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
