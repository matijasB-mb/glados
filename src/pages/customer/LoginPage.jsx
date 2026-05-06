import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Logo } from '../../components/ui/Logo'

async function detectRoleAndRedirect(userId, navigate) {
  // Admin?
  const { data: admin } = await supabase.from('platform_admins').select('id').eq('auth_user_id', userId).maybeSingle()
  if (admin) { navigate('/admin'); return }

  // Courier?
  const { data: courier } = await supabase.from('couriers').select('id').eq('auth_user_id', userId).maybeSingle()
  if (courier) { navigate('/courier'); return }

  // Restaurant staff?
  const { data: staff } = await supabase.from('restaurant_staff').select('id').eq('auth_user_id', userId).maybeSingle()
  if (staff) { navigate('/restaurant'); return }

  // Default: customer
  navigate('/')
}

export function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword(form)
    if (authError) { setError('Pogrešan email ili lozinka.'); setLoading(false); return }
    await detectRoleAndRedirect(data.user.id, navigate)
  }

  return (
    <div className="min-h-[100dvh] bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo variant="dark" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy">Dobrodošli nazad</h1>
          <p className="text-sm text-gray-500 mt-1">Kurir, restoran ili korisnik — sve na jednom mjestu</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            placeholder="marko@email.com"
          />
          <Input
            label="Lozinka"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button size="full" type="submit" disabled={loading}>
            {loading ? 'Prijava...' : 'Prijava'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Nemate račun?{' '}
          <Link to="/registracija" className="text-navy font-semibold hover:text-yellow transition-colors">
            Registrirajte se
          </Link>
        </p>
      </div>
    </div>
  )
}
