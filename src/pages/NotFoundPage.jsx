import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Logo } from '../components/ui/Logo'

export function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-navy flex flex-col">
      {/* Minimal nav */}
      <div className="px-6 py-5">
        <Link to="/">
          <Logo variant="light" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md mx-auto">

          {/* Big 404 */}
          <div className="relative mb-8 select-none">
            <p
              className="font-display font-black text-[180px] leading-none text-white/5 tracking-tight"
              aria-hidden="true"
            >
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-yellow/10 border border-yellow/20 flex items-center justify-center">
                <Search className="w-9 h-9 text-yellow" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Copy */}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Stranica nije pronađena
          </h1>
          <p className="text-white/45 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
            Ova stranica ne postoji ili je premještena. Provjeri URL ili se vrati na početnu.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-yellow text-navy font-bold px-6 py-3.5 rounded-xl hover:bg-yellow-light transition-all text-sm shadow-lg shadow-yellow/20"
            >
              <Home className="w-4 h-4" />
              Početna stranica
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 border border-white/15 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/5 hover:border-white/25 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Idi natrag
            </button>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="px-6 py-6 text-center">
        <p className="text-white/20 text-xs">
          Potrebna pomoć?{' '}
          <a href="mailto:info@glados.hr" className="text-yellow/60 hover:text-yellow transition-colors">
            info@glados.hr
          </a>
        </p>
      </div>
    </div>
  )
}
