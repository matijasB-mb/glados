import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Download, Share } from 'lucide-react'
import { Logo } from './Logo'

const DISMISSED_KEY = 'glados_pwa_dismissed'
const SHOW_DELAY_MS = 12000 // 12 seconds — enough to browse, not too long

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

function isInStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)
  const timerFiredRef = useState(false)

  useEffect(() => {
    if (isInStandalone()) return
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const onIOS = isIOS()
    setIos(onIOS)

    // Capture Android/desktop install prompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // If delay already passed, show immediately
      if (timerFiredRef[0]) setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Single shared delay timer
    const timer = setTimeout(() => {
      timerFiredRef[0] = true
      if (onIOS) {
        setShow(true)                          // iOS: show instructions immediately
      }
      // Android: show happens in handler above once deferredPrompt is ready,
      // or below if it was captured before the timer fired
      setDeferredPrompt(prev => { if (prev) setShow(true); return prev })
    }, SHOW_DELAY_MS)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShow(false)
    if (outcome === 'dismissed') sessionStorage.setItem(DISMISSED_KEY, '1')
  }

  function dismiss() {
    setShow(false)
    sessionStorage.setItem(DISMISSED_KEY, '1')
  }

  // Don't render anything if nothing to show
  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-5 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-navy border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-5">
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow rounded-xl flex items-center justify-center shrink-0">
                <Logo variant="light" className="h-6 w-auto" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Dodaj Gladoš na zaslon</p>
                <p className="text-white/45 text-xs mt-0.5 leading-relaxed">
                  Brži pristup narudžbama — kao prava aplikacija, bez App Storea.
                </p>
              </div>
            </div>

            {ios ? (
              // iOS instructions (no beforeinstallprompt support)
              <div className="bg-white/5 rounded-xl p-3.5 mb-4">
                <p className="text-white/70 text-xs leading-relaxed">
                  Pritisni{' '}
                  <span className="inline-flex items-center gap-1 font-bold text-white">
                    <Share className="w-3.5 h-3.5" /> Dijeli
                  </span>
                  {' '}pa odaberi{' '}
                  <span className="font-bold text-white">"Dodaj na početni zaslon"</span>
                  {' '}u izborniku ispod.
                </p>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="w-full bg-yellow text-navy font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-light transition-colors mb-3"
              >
                <Download className="w-4 h-4" />
                Instaliraj besplatno
              </button>
            )}

            <button
              onClick={dismiss}
              className="w-full text-white/30 text-xs hover:text-white/50 transition-colors text-center"
            >
              Možda kasnije
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
