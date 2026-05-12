import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, ChefHat, Bike, Smartphone, Zap,
  ArrowRight, Clock, Star, ChevronDown, CheckCircle2,
  Shield, Package, Plus, TrendingUp,
  Utensils, Flame, Beef, Pizza, Leaf, Coffee,
} from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { supabase } from '../../services/supabase'
import { Navbar } from '../../components/customer/Navbar'
import { Footer } from '../../components/customer/Footer'

/* ── Spotlight card — mouse-tracking radial gradient ──────────── */
function SpotlightCard({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0, visible: false })

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos(p => ({ ...p, visible: false }))}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      <div
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, -50%)',
          width: 220,
          height: 220,
          background: 'radial-gradient(circle, rgba(255,122,0,0.18) 0%, transparent 68%)',
          opacity: pos.visible ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.35s ease',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

/* ── Animation presets ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => { setRestaurants(data ?? []); setLoading(false) })
  }, [])

  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col">
      <Navbar transparent />
      <Hero />
      <StatsStrip />
      <RestaurantsSection restaurants={restaurants} loading={loading} />
      <HowItWorks />
      <Testimonials />
      <PartnerSection />
      <FAQ />
      <Footer />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HERO — cream background, dark text, orange accents
══════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section
      className="relative overflow-hidden -mt-20"
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}
    >
      {/* Ambient orange glow — upper right */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-yellow/10 rounded-full blur-[120px] pointer-events-none" />
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-yellow/6 rounded-full blur-3xl pointer-events-none" />

      <div
        className="relative flex flex-col justify-center"
        style={{ paddingTop: '120px', paddingBottom: '80px' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center">

            {/* ── Left copy ── */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-yellow/12 border border-yellow/25 rounded-full px-4 py-1.5 mb-5 w-fit"
              >
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow" />
                </span>
                <span className="text-sm font-semibold text-yellow-dark tracking-wide">Dostava u Vrbovcu</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-black text-navy leading-[1.0] tracking-tight mb-5"
                style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)', textWrap: 'balance' }}
              >
                Gladan si?<br />
                <span className="text-gradient-yellow">Gladooš dolazi.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-base lg:text-lg text-navy/55 max-w-md mb-7 leading-relaxed"
              >
                Naruči iz najboljih restorana u Vrbovcu u par klikova.
                Plati gotovinom kad stigne — bez kartica, bez aplikacije.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-3 mb-9"
              >
                <a
                  href="#restorani"
                  className="group bg-yellow text-navy font-bold px-8 py-4 rounded-[14px] hover:bg-yellow-light active:scale-[0.98] transition-all shadow-yellow text-center inline-flex items-center justify-center gap-2 text-base"
                >
                  Vidi restorane
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  to="/registracija"
                  className="border-2 border-navy/15 text-navy font-semibold px-8 py-4 rounded-[14px] hover:bg-navy/5 hover:border-navy/25 active:scale-[0.98] transition-all text-center text-base"
                >
                  Kreiraj račun
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap items-center gap-5 text-sm"
              >
                {[
                  { icon: CheckCircle2, text: 'Bez registracije' },
                  { icon: CheckCircle2, text: 'Cash on delivery' },
                  { icon: CheckCircle2, text: '15–30 min dostava' },
                ].map(({ icon: Icon, text }, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-navy/45">
                    <Icon className="w-3.5 h-3.5 text-yellow" />
                    {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* ── Right: phone mockup — hidden on mobile ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:flex justify-center items-center"
              style={{ height: '560px' }}
            >
              {/* Phone frame */}
              <div className="relative w-64">
                <div className="bg-[#121212] rounded-[42px] p-3 shadow-[0_32px_72px_rgba(18,18,18,0.22),0_0_0_1px_rgba(18,18,18,0.08)] border border-white/5">
                  {/* Screen */}
                  <div className="rounded-[32px] overflow-hidden h-[460px] bg-cream flex flex-col">
                    {/* Status bar */}
                    <div className="bg-[#121212] px-5 pt-3 pb-2 flex items-center justify-between shrink-0">
                      <span className="text-white/60 text-[10px] font-mono font-bold">9:41</span>
                      <div className="w-20 h-5 bg-black rounded-full" />
                      <div className="flex gap-0.5 items-center">
                        <div className="w-3 h-2 rounded-sm bg-white/40" />
                      </div>
                    </div>

                    {/* App header */}
                    <div className="bg-[#121212] px-5 pb-4 shrink-0">
                      <Logo variant="light" className="h-6 w-auto" />
                      <p className="text-white/45 text-[10px] font-medium mt-1">Vrbovec · 4 restorana</p>
                    </div>

                    {/* Restaurant list */}
                    <div className="flex-1 overflow-hidden p-3 space-y-2 bg-cream">
                      {[
                        { name: 'Burger Bar', time: '18–25', Icon: Beef },
                        { name: 'Pizzeria', time: '20–30', Icon: Pizza },
                        { name: 'Restoran', time: '25–35', Icon: Utensils },
                        { name: 'Kebab', time: '15–22', Icon: Flame },
                      ].map((r, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.65 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="bg-white rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm"
                        >
                          <div className="w-8 h-8 bg-navy/5 rounded-xl flex items-center justify-center shrink-0">
                            <r.Icon className="w-4 h-4 text-navy/50" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-navy text-xs leading-tight">{r.name}</p>
                            <p className="text-navy/35 text-[10px] font-mono">{r.time} min</p>
                          </div>
                          <div className="w-6 h-6 bg-yellow rounded-lg flex items-center justify-center shrink-0">
                            <Plus className="w-3 h-3 text-navy" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delivery time badge — top right */}
                <motion.div
                  initial={{ opacity: 0, x: 25, y: -15 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.85 }}
                  className="absolute -top-4 -right-10 bg-white rounded-2xl shadow-card px-4 py-3 float-card z-20 border border-navy/5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-yellow/15 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-dark" />
                    </div>
                    <div>
                      <p className="text-[10px] text-navy/40 font-medium">Prosječna dostava</p>
                      <p className="font-bold text-navy text-xs font-mono">22 min</p>
                    </div>
                  </div>
                </motion.div>

                {/* Confirmed badge — bottom left */}
                <motion.div
                  initial={{ opacity: 0, x: -25, y: 15 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.95 }}
                  className="absolute bottom-20 -left-12 bg-white rounded-2xl shadow-card px-4 py-3 float-card-alt z-20 border border-navy/5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-yellow/15 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-yellow-dark" />
                    </div>
                    <div>
                      <p className="text-[10px] text-navy/40 font-medium">Narudžba potvrđena</p>
                      <p className="font-bold text-navy text-xs font-mono">#GL-00042</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   STATS STRIP — monospace numbers
══════════════════════════════════════════════════════════════════ */
function StatsStrip() {
  const stats = [
    { value: '15–30', unit: 'min', label: 'Prosječna dostava', icon: Clock },
    { value: '100+', unit: '', label: 'Artikala dostupno', icon: Package },
    { value: '24/7', unit: '', label: 'Narudžbe', icon: Smartphone },
    { value: '0', unit: '€', label: 'Skrivenih troškova', icon: Shield },
  ]
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-12 relative z-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-[24px] border border-navy/6 overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(18,18,18,0.07)' }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={`p-6 md:p-8 text-center group hover:bg-cream transition-colors ${
              i < 2 ? 'border-b md:border-b-0' : ''
            } ${i % 2 === 0 ? 'border-r' : ''} ${i === 1 ? 'md:border-r' : ''} ${i === 2 ? 'md:border-r' : ''} border-navy/5`}
          >
            <s.icon className="w-5 h-5 text-yellow mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="font-mono font-bold text-2xl md:text-4xl text-navy tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {s.value}<span className="text-yellow">{s.unit}</span>
            </div>
            <div className="text-xs md:text-sm text-navy/45 font-medium mt-1.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CATEGORY CHIPS
══════════════════════════════════════════════════════════════════ */
function CategoryChips() {
  const [active, setActive] = useState('Sve')
  const categories = [
    { label: 'Sve',      Icon: Utensils },
    { label: 'Burgeri',  Icon: Beef },
    { label: 'Pizza',    Icon: Pizza },
    { label: 'Piletina', Icon: Flame },
    { label: 'Kebab',    Icon: ChefHat },
    { label: 'Salate',   Icon: Leaf },
    { label: 'Deserti',  Icon: Star },
    { label: 'Pića',     Icon: Coffee },
  ]

  return (
    <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 mb-10">
      {categories.map(({ label, Icon }) => (
        <button
          key={label}
          onClick={() => setActive(label)}
          className={`flex-none inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap focus:outline-none ${
            active === label
              ? 'bg-yellow text-navy shadow-md shadow-yellow/30'
              : 'bg-white text-navy/55 border border-navy/8 hover:border-yellow/40 hover:text-navy hover:bg-yellow/5'
          }`}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   RESTAURANTS
══════════════════════════════════════════════════════════════════ */
function RestaurantsSection({ restaurants, loading }) {
  return (
    <section id="restorani" className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 md:py-20">
      <Reveal className="mb-10">
        <span className="inline-block bg-yellow/15 text-yellow-dark font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
          Restorani
        </span>
        <h2 className="font-display font-black text-navy mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
          Odaberi. Naruči. <span className="text-gradient-yellow">Uživaj.</span>
        </h2>
        <p className="text-navy/50 max-w-lg leading-relaxed font-medium">
          Najbolji lokalni restorani u Vrbovcu, svi na jednom mjestu.
        </p>
      </Reveal>

      <CategoryChips />

      {loading ? (
        <RestaurantSkeleton />
      ) : restaurants.length === 0 ? (
        <Reveal>
          <div className="bg-white border-2 border-dashed border-navy/10 rounded-[28px] p-12 md:p-20 text-center">
            <div className="w-16 h-16 bg-yellow/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="w-8 h-8 text-yellow-dark" />
            </div>
            <h3 className="font-display font-black text-xl text-navy mb-2">Uskoro dostupno</h3>
            <p className="text-navy/50 max-w-sm mx-auto mb-7 leading-relaxed">
              Radimo na prvim partnerima. Registriraj se i obavijestit ćemo te čim krenemo.
            </p>
            <Link to="/registracija" className="inline-block bg-navy text-white font-bold px-7 py-3.5 rounded-[14px] hover:bg-navy-light active:scale-[0.98] transition-all shadow-card">
              Obavijesti me
            </Link>
          </div>
        </Reveal>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {restaurants.map(r => (
            <motion.div key={r.id} variants={fadeUp}>
              <RestaurantCard restaurant={r} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}

/* Skeleton — text-only layout, no image placeholder */
function RestaurantSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-[24px] p-6 border border-navy/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="skeleton h-6 w-24 rounded-full" />
            <div className="skeleton h-5 w-5 rounded" />
          </div>
          <div className="skeleton h-6 w-3/4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
          <div className="border-t border-navy/5 pt-4">
            <div className="skeleton h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* Text-only restaurant card — no images */
function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restoran/${restaurant.slug}`}
      className="group block bg-white rounded-[24px] border border-navy/5 hover:-translate-y-1.5 transition-all duration-300 p-6"
      style={{ boxShadow: '0 4px 24px rgba(18,18,18,0.06)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 40px rgba(18,18,18,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(18,18,18,0.06)'}
    >
      {/* Top row — status badge + arrow */}
      <div className="flex items-start justify-between mb-5">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
          restaurant.is_open
            ? 'bg-yellow/12 text-yellow-dark'
            : 'bg-navy/5 text-navy/35'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${restaurant.is_open ? 'bg-yellow-dark' : 'bg-navy/25'}`} />
          {restaurant.is_open ? 'Otvoreno' : 'Zatvoreno'}
        </span>
        <ArrowRight className="w-4 h-4 text-navy/20 group-hover:text-yellow-dark group-hover:translate-x-0.5 transition-all duration-200" />
      </div>

      {/* Restaurant name */}
      <h3
        className="font-display font-black text-navy text-xl mb-2 group-hover:text-yellow-dark transition-colors"
        style={{ letterSpacing: '-0.025em' }}
      >
        {restaurant.name}
      </h3>

      {/* Description */}
      {restaurant.description && (
        <p className="text-sm text-navy/45 line-clamp-2 leading-relaxed mb-5">{restaurant.description}</p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-sm border-t border-navy/5 pt-4 mt-auto">
        <span className="flex items-center gap-1.5 text-navy/55">
          <Clock className="w-4 h-4 text-yellow" />
          <span className="font-mono font-bold text-navy">{restaurant.delivery_time_min}–{restaurant.delivery_time_max}</span>
          <span className="text-navy/35">min</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-navy/15 shrink-0" />
        <span className="text-navy/45 text-xs">Min. <span className="font-mono font-bold text-navy text-sm">{Number(restaurant.min_order_amount).toFixed(2)} €</span></span>
      </div>
    </Link>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HOW IT WORKS — zig-zag layout
══════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: ShoppingCart,
      color: 'from-yellow/20 to-yellow/5',
      iconColor: 'text-yellow-dark',
      title: 'Odaberi & naruči',
      desc: 'Pregledaj restorane, dodaj omiljena jela u košaricu i pošalji narudžbu u par klikova. Bez registracije na prvoj narudžbi.',
    },
    {
      number: '02',
      icon: ChefHat,
      color: 'from-navy-100 to-navy-50',
      iconColor: 'text-navy',
      title: 'Restoran priprema',
      desc: 'Restoran dobiva obavijest odmah i počinje pripremati tvoj obrok svježim, lokalnim sastojcima.',
    },
    {
      number: '03',
      icon: Bike,
      color: 'from-yellow/15 to-yellow/5',
      iconColor: 'text-yellow-dark',
      title: 'Dostava do vrata',
      desc: 'Kurir preuzima narudžbu i dovozi je direktno do tvojih vrata. Plati gotovinom na licu mjesta.',
    },
  ]

  return (
    <section id="kako-radi" className="py-16 md:py-28" style={{ background: 'rgba(18,18,18,0.025)' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <Reveal className="mb-16">
          <span className="inline-block bg-yellow/15 text-yellow-dark font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Kako radi
          </span>
          <h2 className="font-display font-black text-navy" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
            Tri koraka do <span className="text-gradient-yellow">odličnog obroka</span>
          </h2>
        </Reveal>

        <div className="space-y-8 md:space-y-0">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
            >
              <div
                className="relative bg-white rounded-[28px] p-10 flex items-center justify-center min-h-[220px] border border-navy/5"
                style={{ boxShadow: '0 4px 24px rgba(18,18,18,0.06)' }}
              >
                <div className="absolute top-6 left-6 font-mono font-black text-6xl text-navy/4 select-none leading-none">{s.number}</div>
                <div className={`w-20 h-20 bg-gradient-to-br ${s.color} rounded-3xl flex items-center justify-center`}>
                  <s.icon className={`w-10 h-10 ${s.iconColor}`} />
                </div>
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-navy/30 tracking-widest mb-3 uppercase">Korak {s.number}</div>
                <h3 className="font-display font-black text-navy text-2xl mb-3" style={{ letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p className="text-navy/55 leading-relaxed text-base max-w-sm">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   TESTIMONIALS — offset staggered layout
══════════════════════════════════════════════════════════════════ */
function Testimonials() {
  const reviews = [
    { name: 'Ivana M.', text: 'Konačno dostava hrane u Vrbovcu! Brzo, jednostavno i hrana stigne topla. Preporučujem svima.', role: 'Korisnica od prvog dana' },
    { name: 'Marko P.', text: 'Burger iz Frankieja na vratima za 20 minuta. Tko bi ranije rekao da je to moguće kod nas.', role: 'Redovni korisnik' },
    { name: 'Ana K.', text: 'Jednostavno za koristiti, cash on delivery super opcija. Apsolutno svima preporučujem.', role: 'Majka troje djece' },
  ]

  return (
    <section className="py-16 md:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <Reveal className="mb-14">
          <span className="inline-block bg-yellow/15 text-yellow-dark font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Recenzije
          </span>
          <h2 className="font-display font-black text-navy" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
            Što kažu naši <span className="text-gradient-yellow">gladni susjedi</span>
          </h2>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 items-start"
        >
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`bg-cream border border-navy/5 rounded-[24px] p-7 ${i === 1 ? 'md:mt-10' : ''}`}
              style={{ boxShadow: '0 4px 24px rgba(18,18,18,0.05)' }}
            >
              <div className="font-mono font-black text-5xl text-yellow/40 leading-none mb-4 select-none">"</div>
              <p className="text-navy/70 text-base leading-relaxed mb-6">{r.text}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-navy/6">
                <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center font-black text-yellow text-sm select-none">
                  {r.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">{r.name}</p>
                  <p className="text-xs text-navy/40 font-medium">{r.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-yellow fill-yellow" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PARTNER — dark section, stays dark
══════════════════════════════════════════════════════════════════ */
function PartnerSection() {
  const benefits = [
    { icon: Smartphone, title: 'Narudžbe uživo', desc: 'Primajte narudžbe direktno na tablet ili telefon, bez ijednog poziva.' },
    { icon: Zap, title: 'Onboarding za 24h', desc: 'Postavimo vaš meni, logo i panel za jedan radni dan. Bez tehničkog znanja.' },
    { icon: Bike, title: 'Vlastita dostava', desc: 'Koristite vlastiti tim i zadržite potpunu kontrolu nad kvalitetom.' },
    { icon: TrendingUp, title: 'Statistike uživo', desc: 'Pratite narudžbe, prihod i popularnost jela u realnom vremenu.' },
  ]

  return (
    <section id="partneri" className="grain relative py-16 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-dark" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-yellow/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 text-white">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          <Reveal>
            <div className="inline-flex items-center gap-2 bg-yellow text-navy font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-7">
              <span className="w-2 h-2 bg-navy rounded-full" />
              Ograničen broj partnera
            </div>
            <h2 className="font-display font-black leading-[1.05] mb-6" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
              Imate restoran<br />u Vrbovcu?
              <br />
              <span className="text-gradient-yellow">Pridružite nam se.</span>
            </h2>
            <p className="text-white/55 text-base md:text-lg max-w-md mb-9 leading-relaxed">
              Ekskluzivno radimo s prvih 10 restorana. Osigurajte svoje mjesto i dosegnite nove kupce odmah.
            </p>
            <Link
              to="/postani-partner"
              className="group inline-flex items-center gap-2 bg-yellow text-navy font-bold px-8 py-4 rounded-[14px] hover:bg-yellow-light active:scale-[0.98] transition-all shadow-yellow"
            >
              Prijavite restoran
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/35 text-sm mt-4 font-medium">Odgovaramo unutar 24 sata</p>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-2 gap-4"
          >
            {benefits.map((b, i) => (
              <motion.div key={i} variants={fadeUp}>
                <SpotlightCard className="bg-white/5 backdrop-blur border border-white/10 rounded-[20px] p-5 hover:bg-white/8 hover:border-yellow/30 hover:-translate-y-1 transition-all duration-300 group h-full">
                  <div className="w-10 h-10 bg-yellow/15 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow/25 transition-colors">
                    <b.icon className="w-5 h-5 text-yellow" />
                  </div>
                  <h4 className="font-display font-bold mb-1.5 text-white text-sm">{b.title}</h4>
                  <p className="text-xs text-white/45 leading-relaxed">{b.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   FAQ — animated accordion
══════════════════════════════════════════════════════════════════ */
function FAQ() {
  const items = [
    { q: 'Koliko košta dostava?', a: 'Dostava je besplatna za narudžbe iznad minimalnog iznosa (obično 8€). Nema skrivenih naknada.' },
    { q: 'Kako mogu platiti?', a: 'Trenutno primamo isključivo plaćanje gotovinom pri dostavi. Online plaćanje dolazi uskoro.' },
    { q: 'Koliko traje dostava?', a: 'Tipično 15–30 minuta. Uvijek vidite procijenjeno vrijeme u prikazu narudžbe.' },
    { q: 'Koja područja pokrivamo?', a: 'Trenutno dostavljamo unutar Vrbovca. Širimo se u okolna mjesta tijekom 2026.' },
    { q: 'Mogu li otkazati narudžbu?', a: 'Narudžba se može otkazati dok je restoran nije prihvatio (unutar 3 minute od slanja).' },
  ]
  const [open, setOpen] = useState(0)

  return (
    <section className="py-16 md:py-28 bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12">
          <span className="inline-block bg-yellow/15 text-yellow-dark font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="font-display font-black text-navy" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
            Često postavljana <span className="text-gradient-yellow">pitanja</span>
          </h2>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="space-y-2"
        >
          {items.map((it, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`bg-white rounded-[18px] overflow-hidden transition-all duration-300 border-l-[3px] ${open === i ? 'border-yellow' : 'border-transparent'}`}
              style={{ boxShadow: open === i ? '0 4px 24px rgba(18,18,18,0.08)' : '0 1px 4px rgba(18,18,18,0.04)' }}
            >
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
              >
                <span className="font-bold text-navy text-sm md:text-base">{it.q}</span>
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${open === i ? 'bg-yellow text-navy rotate-180' : 'bg-navy-50 text-navy'}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-navy/55 text-sm leading-relaxed">{it.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
