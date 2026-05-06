import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone } from 'lucide-react'
import { Logo } from '../ui/Logo'

export function Footer() {
  return (
    <footer className="bg-navy-dark text-white/70 mt-16">
      {/* Top CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-white/8">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
              Gladan si? <span className="text-yellow">Gladoš dolazi.</span>
            </h3>
            <p className="text-white/50 text-sm">Plaćanje gotovinom — bez kartica, bez aplikacije.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
            <Link to="/registracija" className="bg-yellow text-navy font-bold px-6 py-3.5 rounded-xl hover:bg-yellow-light transition-all text-center text-sm shadow-lg shadow-yellow/20">
              Registriraj se besplatno
            </Link>
            <a href="#restorani" className="border border-white/15 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/5 hover:border-white/25 transition-all text-center text-sm">
              Vidi restorane
            </a>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Logo variant="light" className="h-10 w-auto mb-5" />
            <p className="text-white/45 text-sm leading-relaxed max-w-xs mb-6">
              Lokalna platforma za dostavu hrane u Vrbovcu. Podržavamo lokalne restorane i donosimo ukusnu hranu pred vaša vrata.
            </p>
            <div className="flex items-center gap-2.5">
              <SocialLink href="https://instagram.com" label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.849.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </SocialLink>
              <SocialLink href="https://facebook.com" label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </SocialLink>
              <SocialLink href="https://tiktok.com" label="TikTok">
                {/* TikTok icon - Lucide doesn't have one, use custom SVG */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
                </svg>
              </SocialLink>
            </div>
          </div>

          <FooterColumn title="Platforma">
            <FooterLink to="/">Restorani</FooterLink>
            <FooterLink to="/#kako-radi">Kako radi</FooterLink>
            <FooterLink to="/moje-narudzbe">Moje narudžbe</FooterLink>
            <FooterLink to="/registracija">Registracija</FooterLink>
          </FooterColumn>

          <FooterColumn title="Partneri">
            <FooterLink to="/#partneri">Postani partner</FooterLink>
            <li>
              <a href="mailto:partneri@glados.hr" className="block py-1 text-sm text-white/45 hover:text-yellow transition-colors">
                partneri@glados.hr
              </a>
            </li>
            <FooterLink to="/restaurant/prijava">Panel restorana</FooterLink>
          </FooterColumn>

          <FooterColumn title="Kontakt">
            <li className="flex items-start gap-2 text-sm text-white/45 py-1">
              <MapPin className="w-4 h-4 mt-0.5 text-yellow shrink-0" />
              Vrbovec, Hrvatska
            </li>
            <li className="flex items-start gap-2 text-sm text-white/45 py-1">
              <Mail className="w-4 h-4 mt-0.5 text-yellow shrink-0" />
              <a href="mailto:info@glados.hr" className="hover:text-yellow transition-colors">info@glados.hr</a>
            </li>
            <li className="flex items-start gap-2 text-sm text-white/45 py-1">
              <Phone className="w-4 h-4 mt-0.5 text-yellow shrink-0" />
              <a href="tel:+385977578091" className="hover:text-yellow transition-colors">+385 97 757 8091</a>
            </li>
          </FooterColumn>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Gladoš. Sva prava pridržana.</p>
          <div className="flex items-center gap-4">
            <Link to="/uvjeti" className="hover:text-yellow transition-colors">Uvjeti korištenja</Link>
            <Link to="/privatnost" className="hover:text-yellow transition-colors">Privatnost</Link>
          </div>
          <p>Napravljeno u Vrbovcu <span className="text-yellow">♥</span></p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4 opacity-60">{title}</h4>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="block py-1 text-sm text-white/45 hover:text-yellow transition-colors">
        {children}
      </Link>
    </li>
  )
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-yellow hover:text-navy hover:border-yellow transition-all duration-200"
    >
      {children}
    </a>
  )
}
