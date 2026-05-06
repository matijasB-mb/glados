import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Logo } from '../../components/ui/Logo'

export function CourierLoginPage() {
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

    const { data: courier } = await supabase
      .from('couriers')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single()

    if (!courier) {
      await supabase.auth.signOut()
      setError('Nemate pristup kurirskom panelu.')
      setLoading(false)
      return
    }
    navigate('/courier')
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo variant="light" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Kurir prijava</h1>
          <p className="text-white/40 text-sm mt-1">Samo za dostavljače</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Lozinka" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button size="full" type="submit" disabled={loading}>
            {loading ? 'Prijava...' : 'Prijava'}
          </Button>
        </form>
      </div>
    </div>
  )
}
