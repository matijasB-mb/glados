import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useCartStore } from '../../store/cartStore'
import { useAuth } from '../../hooks/useAuth'
import { notifyRestaurant, notifyCustomer } from '../../services/infobip'
import { Navbar } from '../../components/customer/Navbar'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { formatPrice } from '../../utils/formatPrice'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const { items, restaurantId, restaurantName, subtotal: _subtotal, clearCart } = useCartStore()
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const [address, setAddress] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [notes, setNotes] = useState('')
  const [saveAddress, setSaveAddress] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) navigate('/prijava')
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', profile.id)
        .order('is_default', { ascending: false })
        .then(({ data }) => {
          setSavedAddresses(data ?? [])
          const def = data?.find(a => a.is_default)
          if (def) setAddress(def.address)
        })
    }
  }, [profile])

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="text-gray-500 text-lg mb-4">Vaša košarica je prazna.</p>
          <Button onClick={() => navigate('/')}>Na naslovnicu</Button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!address.trim()) { setError('Unesite adresu dostave.'); return }
    setSubmitting(true)
    setError('')

    try {
      const COMMISSION_RATE = 0.035
      const commissionAmount = subtotal * COMMISSION_RATE

      // Get restaurant phone for notification
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('phone, commission_rate')
        .eq('id', restaurantId)
        .single()

      const commission = subtotal * (restaurant?.commission_rate ?? COMMISSION_RATE)

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurantId,
          customer_id: profile?.id ?? null,
          customer_name: `${profile?.first_name} ${profile?.last_name}`,
          customer_phone: profile?.phone,
          customer_email: profile?.email,
          delivery_address: address.trim(),
          status: 'pending',
          subtotal,
          commission_amount: commission,
          total_amount: subtotal,
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          menu_item_id: item.id,
          menu_item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          modifications: item.modifications || null,
          item_total: item.price * item.quantity,
        }))
      )

      // Save address if requested
      if (saveAddress && profile?.id) {
        await supabase.from('customer_addresses').upsert({
          customer_id: profile.id,
          address: address.trim(),
          is_default: savedAddresses.length === 0,
        })
      }

      // Send notifications (best-effort)
      try {
        if (restaurant?.phone) await notifyRestaurant(order, items.map(i => ({ ...i, menu_item_name: i.name, modifications: i.modifications })), restaurant.phone)
        await notifyCustomer(order)
      } catch (_) {}

      clearCart()
      navigate(`/narudzba/${order.order_number}`)
    } catch (err) {
      setError('Greška pri narudžbi. Pokušajte ponovo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy mb-6">Završi narudžbu</h1>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-navy mb-4">Adresa dostave</h2>

              {savedAddresses.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {savedAddresses.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAddress(a.address)}
                      className={`text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors ${address === a.address ? 'border-yellow bg-yellow/10' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {a.address}
                      {a.is_default && <span className="ml-2 text-xs text-yellow font-semibold">Zadana</span>}
                    </button>
                  ))}
                  <div className="text-xs text-gray-400 my-1 text-center">— ili unesite novu —</div>
                </div>
              )}

              <Input
                label="Ulica i broj"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ulica bana Jelačića 5, Vrbovec"
                required
              />

              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="accent-yellow" />
                <span className="text-sm text-gray-600">Spremi ovu adresu za buduće narudžbe</span>
              </label>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-navy mb-4">Napomena (opcionalno)</h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-navy placeholder-gray-400 outline-none focus:border-yellow transition-colors resize-none"
                placeholder="Npr. 2. kat, kod za ulaz, alergije..."
                rows={3}
              />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-navy mb-2">Plaćanje</h2>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold text-navy text-sm">Gotovina pri dostavi</p>
                  <p className="text-xs text-gray-500">Platite dostavljaču kada preuzmate narudžbu</p>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button size="full" type="submit" disabled={submitting}>
              {submitting ? 'Slanje narudžbe...' : `Naruči · ${formatPrice(subtotal)}`}
            </Button>
          </form>

          {/* Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h2 className="font-bold text-navy mb-1">{restaurantName}</h2>
              <p className="text-sm text-gray-500 mb-4">Pregled narudžbe</p>
              <div className="space-y-2 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}× {item.name}</span>
                    <span className="font-medium text-navy">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-navy">
                <span>Ukupno</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Dostava besplatna • Plaćanje gotovinom</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
