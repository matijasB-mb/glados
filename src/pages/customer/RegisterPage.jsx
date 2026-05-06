import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Logo } from '../../components/ui/Logo'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    const { error: profileError } = await supabase.from('customers').insert({
      auth_user_id: data.user.id,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      email: form.email,
    })

    if (profileError) { setError(profileError.message); setLoading(false); return }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo variant="dark" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy">Kreirajte račun</h1>
          <p className="text-gray-500 mt-1">Brzo i jednostavno</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ime" value={form.first_name} onChange={set('first_name')} required placeholder="Marko" />
            <Input label="Prezime" value={form.last_name} onChange={set('last_name')} required placeholder="Horvat" />
          </div>
          <Input label="Broj telefona" type="tel" value={form.phone} onChange={set('phone')} required placeholder="+385 91 234 5678" />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} required placeholder="marko@email.com" />
          <Input label="Lozinka" type="password" value={form.password} onChange={set('password')} required placeholder="Minimalno 6 znakova" minLength={6} />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button size="full" type="submit" disabled={loading}>
            {loading ? 'Kreiranje...' : 'Kreiraj račun'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Već imate račun?{' '}
          <Link to="/prijava" className="text-navy font-semibold hover:text-yellow transition-colors">
            Prijavite se
          </Link>
        </p>
      </div>
    </div>
  )
}
