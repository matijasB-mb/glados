import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCartStore } from '../../store/cartStore'
import { Logo } from '../ui/Logo'

export function Navbar({ transparent = false }) {
  const { user, profile, signOut } = useAuth()
  const totalItems = useCartStore(s => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  // Hero is now cream-background — navbar always uses dark text regardless of scroll
  const isFloating = transparent && !scrolled
  const bgClass = isFloating
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-xl border-b border-navy/8 shadow-sm'

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center group shrink-0">
          <Logo
            variant="dark"
            className="h-9 md:h-11 w-auto transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/#kako-radi" className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors text-navy/60 hover:text-navy hover:bg-navy/5">
            Kako radi
          </Link>
          <Link to="/#partneri" className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors text-navy/60 hover:text-navy hover:bg-navy/5">
            Za restorane
          </Link>

          {user ? (
            <>
              <Link to="/moje-narudzbe" className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors text-navy/60 hover:text-navy hover:bg-navy/5">
                Narudžbe
              </Link>
              <div className="w-px h-5 mx-2 bg-navy/10" />
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-yellow text-navy font-bold rounded-full flex items-center justify-center text-sm shadow-sm">
                  {(profile?.first_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium transition-colors text-navy/40 hover:text-navy"
                >
                  Odjava
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/prijava" className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors text-navy/60 hover:text-navy hover:bg-navy/5">
                Prijava
              </Link>
              <Link
                to="/registracija"
                className="ml-1 bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-navy-light transition-all shadow-md hover:shadow-lg"
              >
                Registracija
              </Link>
            </>
          )}

          <Link to="/checkout" className="relative ml-2">
            <div className="rounded-xl p-2.5 transition-all bg-yellow text-navy hover:bg-yellow-dark shadow-sm">
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-navy text-yellow text-[10px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <Link to="/checkout" className="relative">
            <div className="rounded-xl p-2.5 bg-yellow text-navy">
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-navy text-yellow text-[10px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-2.5 rounded-xl transition-colors text-navy hover:bg-navy/5"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-navy/5 shadow-lg px-4 py-3 flex flex-col gap-1">
          <Link to="/#kako-radi" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-navy font-semibold rounded-xl hover:bg-navy-50 text-sm">Kako radi</Link>
          <Link to="/#partneri" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-navy font-semibold rounded-xl hover:bg-navy-50 text-sm">Za restorane</Link>
          {user ? (
            <>
              <Link to="/moje-narudzbe" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-navy font-semibold rounded-xl hover:bg-navy-50 text-sm">Moje narudžbe</Link>
              <div className="border-t border-navy/5 mt-1 pt-1">
                <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-navy/50 rounded-xl hover:bg-navy-50 text-sm">Odjava</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/prijava" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-navy font-semibold rounded-xl hover:bg-navy-50 text-sm">Prijava</Link>
              <Link to="/registracija" onClick={() => setMenuOpen(false)} className="px-4 py-3.5 bg-navy text-white font-bold rounded-xl text-center mt-1 text-sm shadow-md">Registracija</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
