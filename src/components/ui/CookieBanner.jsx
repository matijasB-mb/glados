import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

const CONSENT_KEY = 'glados_cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Small delay so it doesn't pop immediately on page load
    const timer = setTimeout(() => {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[999] md:left-auto md:right-6 md:bottom-6 md:w-[420px]"
        >
          <div
            className="bg-navy-dark border border-white/10 rounded-2xl p-5 shadow-2xl"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}
          >
            {/* Close */}
            <button
              onClick={decline}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Zatvori"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-4 pr-6">
              <div className="w-9 h-9 bg-yellow/15 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-yellow" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-white text-sm mb-1">Kolačići i privatnost</p>
                <p className="text-white/50 text-xs leading-relaxed">
                  Koristimo isključivo neophodne kolačiće za prijavu i sigurnost. Ne koristimo kolačiće za praćenje ili oglašavanje.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={accept}
                className="flex-1 bg-yellow text-navy font-bold text-xs py-2.5 rounded-xl hover:bg-yellow-light active:scale-[0.98] transition-all"
              >
                Prihvati
              </button>
              <button
                onClick={decline}
                className="flex-1 border border-white/15 text-white/60 font-semibold text-xs py-2.5 rounded-xl hover:bg-white/5 hover:text-white active:scale-[0.98] transition-all"
              >
                Samo nužni
              </button>
            </div>

            <p className="text-white/25 text-[10px] text-center mt-3">
              <Link to="/privatnost" className="hover:text-yellow transition-colors underline underline-offset-2">
                Politika privatnosti
              </Link>
              {' · '}
              <Link to="/uvjeti" className="hover:text-yellow transition-colors underline underline-offset-2">
                Uvjeti korištenja
              </Link>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
