import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function ScrollToHash() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash, pathname])
  return null
}

// Customer pages
import { HomePage } from './pages/customer/HomePage'
import { RestaurantPage } from './pages/customer/RestaurantPage'
import { CheckoutPage } from './pages/customer/CheckoutPage'
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage'
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage'
import { LoginPage } from './pages/customer/LoginPage'
import { RegisterPage } from './pages/customer/RegisterPage'
import { PrivacyPage } from './pages/customer/PrivacyPage'
import { TermsPage } from './pages/customer/TermsPage'

// Restaurant admin panel
import { RestaurantLoginPage } from './pages/restaurant/RestaurantLoginPage'
import { RestaurantDashboard } from './pages/restaurant/RestaurantDashboard'

// Platform admin panel
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'

// Courier panel
import { CourierLoginPage } from './pages/courier/CourierLoginPage'
import { CourierDashboard } from './pages/courier/CourierDashboard'

// GDPR
import { CookieBanner } from './components/ui/CookieBanner'

// 404
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        {/* Customer app */}
        <Route path="/" element={<HomePage />} />
        <Route path="/restoran/:slug" element={<RestaurantPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/narudzba/:orderNumber" element={<OrderTrackingPage />} />
        <Route path="/moje-narudzbe" element={<OrderHistoryPage />} />
        <Route path="/prijava" element={<LoginPage />} />
        <Route path="/registracija" element={<RegisterPage />} />

        {/* Legal */}
        <Route path="/privatnost" element={<PrivacyPage />} />
        <Route path="/uvjeti" element={<TermsPage />} />

        {/* Restaurant admin panel */}
        <Route path="/restaurant" element={<RestaurantDashboard />} />
        <Route path="/restaurant/prijava" element={<RestaurantLoginPage />} />

        {/* Platform admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/prijava" element={<AdminLoginPage />} />

        {/* Courier panel */}
        <Route path="/courier" element={<CourierDashboard />} />
        <Route path="/courier/prijava" element={<CourierLoginPage />} />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Global GDPR cookie consent banner */}
      <CookieBanner />
    </BrowserRouter>
  )
}

export default App
