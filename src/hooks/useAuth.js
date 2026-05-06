import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null) // 'customer' | 'admin' | 'courier' | 'restaurant'
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) detectRole(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) detectRole(session.user.id)
      else { setRole(null); setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function detectRole(userId) {
    // Check platform_admins
    const { data: admin } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()
    if (admin) { setRole('admin'); setProfile(admin); setLoading(false); return }

    // Check couriers
    const { data: courier } = await supabase
      .from('couriers')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()
    if (courier) { setRole('courier'); setProfile(courier); setLoading(false); return }

    // Check restaurant_staff
    const { data: staff } = await supabase
      .from('restaurant_staff')
      .select('*, restaurants(name)')
      .eq('auth_user_id', userId)
      .maybeSingle()
    if (staff) { setRole('restaurant'); setProfile(staff); setLoading(false); return }

    // Default: customer
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()
    setRole('customer')
    setProfile(customer)
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setRole(null)
    setProfile(null)
  }

  return { user, role, profile, loading, signOut }
}
