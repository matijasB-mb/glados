import { Link } from 'react-router-dom'
import { Navbar } from '../../components/customer/Navbar'
import { Footer } from '../../components/customer/Footer'
import { Shield } from 'lucide-react'

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="font-display font-black text-navy text-xl mb-4" style={{ letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <div className="space-y-3 text-navy/65 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  )
}

export function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-navy text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="w-12 h-12 bg-yellow/15 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-yellow" strokeWidth={1.5} />
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3" style={{ letterSpacing: '-0.03em' }}>
            Politika privatnosti
          </h1>
          <p className="text-white/50 text-sm">
            Zadnje ažuriranje: 5. svibnja 2026.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <div className="bg-yellow/10 border border-yellow/20 rounded-2xl p-5 mb-10">
            <p className="text-navy text-sm leading-relaxed font-medium">
              Gladoš d.o.o. (dalje: „Gladoš", „mi", „nas") ozbiljno shvaća zaštitu vaših osobnih podataka. Ova Politika privatnosti objašnjava koje podatke prikupljamo, zašto ih prikupljamo i kako ih koristimo, u skladu s Općom uredbom o zaštiti podataka (GDPR, Uredba EU 2016/679) i Zakonom o provedbi Opće uredbe o zaštiti podataka (NN 42/2018).
            </p>
          </div>

          <Section title="1. Voditelj obrade podataka">
            <p>
              <strong className="text-navy">Gladoš d.o.o.</strong><br />
              Vrbovec, Hrvatska<br />
              E-pošta: <a href="mailto:privatnost@glados.hr" className="text-navy font-medium hover:text-yellow-dark transition-colors">privatnost@glados.hr</a>
            </p>
            <p>
              Za sva pitanja vezana uz obradu vaših osobnih podataka možete nas kontaktirati na gornju adresu e-pošte.
            </p>
          </Section>

          <Section title="2. Koje osobne podatke prikupljamo">
            <p>Prikupljamo sljedeće kategorije osobnih podataka:</p>
            <ul className="list-none space-y-2 mt-2">
              {[
                { label: 'Podaci o računu', desc: 'Ime, prezime, adresa e-pošte i lozinka pri registraciji.' },
                { label: 'Podaci o narudžbi', desc: 'Adresa dostave, broj telefona, sadržaj narudžbe, iznos i status narudžbe.' },
                { label: 'Tehnički podaci', desc: 'IP adresa, vrsta preglednika, uređaj i stranice koje ste posjetili (samo za sigurnost i dijagnostiku).' },
                { label: 'Komunikacija', desc: 'Poruke koje nam pošaljete putem e-pošte ili kontakt forme.' },
              ].map(({ label, desc }, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow mt-2 shrink-0" />
                  <span><strong className="text-navy">{label}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Ne prikupljamo posebne kategorije podataka (zdravstveni podaci, biometrija, politička mišljenja i sl.).
            </p>
          </Section>

          <Section title="3. Svrha i pravna osnova obrade">
            <p>Vaše podatke obrađujemo na temelju sljedećih pravnih osnova:</p>
            <div className="space-y-4 mt-3">
              {[
                {
                  basis: 'Izvršenje ugovora (čl. 6(1)(b) GDPR)',
                  desc: 'Obrada narudžbi, upravljanje računom, komunikacija o statusu dostave.',
                },
                {
                  basis: 'Zakonska obveza (čl. 6(1)(c) GDPR)',
                  desc: 'Čuvanje računovodstvenih i poreznih zapisa sukladno hrvatskom zakonodavstvu.',
                },
                {
                  basis: 'Legitimni interes (čl. 6(1)(f) GDPR)',
                  desc: 'Sigurnost platforme, sprečavanje prijevara, poboljšanje usluge.',
                },
                {
                  basis: 'Privola (čl. 6(1)(a) GDPR)',
                  desc: 'Slanje marketinških obavijesti — samo ako ste to izričito zatražili. Privolu možete povući u bilo koje vrijeme.',
                },
              ].map(({ basis, desc }, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-navy/5">
                  <p className="font-semibold text-navy text-xs mb-1">{basis}</p>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="4. Kolačići (cookies)">
            <p>
              Gladoš koristi isključivo <strong className="text-navy">neophodne kolačiće</strong> koji su nužni za funkcioniranje platforme:
            </p>
            <div className="mt-3 rounded-xl overflow-hidden border border-navy/8">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-navy/5">
                    <th className="text-left px-4 py-2.5 font-bold text-navy">Kolačić</th>
                    <th className="text-left px-4 py-2.5 font-bold text-navy">Svrha</th>
                    <th className="text-left px-4 py-2.5 font-bold text-navy">Rok</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'sb-auth-token', purpose: 'Autentifikacija korisnika (Supabase)', expiry: 'Sesija / 7 dana' },
                    { name: 'glados_cookie_consent', purpose: 'Pamćenje vaše odluke o kolačićima', expiry: '12 mjeseci' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/2'}>
                      <td className="px-4 py-2.5 font-mono text-navy/70">{row.name}</td>
                      <td className="px-4 py-2.5 text-navy/60">{row.purpose}</td>
                      <td className="px-4 py-2.5 text-navy/60">{row.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Ne koristimo kolačiće za praćenje, profiliranje ili oglašavanje. Ne dijelimo podatke iz kolačića s trećim stranama u marketinške svrhe.
            </p>
          </Section>

          <Section title="5. Dijeljenje podataka s trećim stranama">
            <p>Vaše osobne podatke ne prodajemo. Podatke dijelimo isključivo s:</p>
            <ul className="list-none space-y-2 mt-2">
              {[
                { who: 'Partnerski restorani', why: 'Ime, adresa dostave i sadržaj narudžbe — isključivo radi pripreme i dostave vaše narudžbe.' },
                { who: 'Kuriri', why: 'Adresa dostave i ime — isključivo radi izvršenja dostave.' },
                { who: 'Supabase Inc.', why: 'Pružatelj infrastrukture baze podataka i autentifikacije. Podaci se obrađuju u EU sukladno standardnim ugovornim klauzulama.' },
                { who: 'Vercel Inc.', why: 'Pružatelj usluge hostinga web aplikacije. Obrada u EU/SAD sukladno DPF okviru.' },
              ].map(({ who, why }, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow mt-2 shrink-0" />
                  <span><strong className="text-navy">{who}:</strong> {why}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="6. Prijenos podataka izvan EGP-a">
            <p>
              Supabase i Vercel mogu obrađivati podatke u SAD-u. Oba pružatelja sudjeluju u EU-SAD okviru zaštite podataka (Data Privacy Framework) i osiguravaju odgovarajuću razinu zaštite sukladno čl. 46 GDPR-a.
            </p>
          </Section>

          <Section title="7. Rok čuvanja podataka">
            <ul className="list-none space-y-2">
              {[
                { item: 'Podaci o računu', period: 'Do brisanja računa + 30 dana sigurnosnog perioda.' },
                { item: 'Podaci o narudžbama', period: '5 godina od datuma narudžbe (zakonska obveza čuvanja računovodstvenih isprava).' },
                { item: 'Tehnički zapisi (logovi)', period: 'Maksimalno 90 dana.' },
                { item: 'Komunikacija s korisničkom podrškom', period: '2 godine od posljednjeg kontakta.' },
              ].map(({ item, period }, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow mt-2 shrink-0" />
                  <span><strong className="text-navy">{item}:</strong> {period}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="8. Vaša prava (GDPR)">
            <p>Sukladno GDPR-u imate sljedeća prava:</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {[
                { right: 'Pravo na pristup', desc: 'Zatražite kopiju svih podataka koje čuvamo o vama.' },
                { right: 'Pravo na ispravak', desc: 'Ispravite netočne ili nepotpune podatke.' },
                { right: 'Pravo na brisanje', desc: 'Zatražite brisanje podataka ("pravo na zaborav").' },
                { right: 'Pravo na ograničenje', desc: 'Ograničite obradu vaših podataka u određenim slučajevima.' },
                { right: 'Pravo na prenosivost', desc: 'Primite svoje podatke u strojno čitljivom formatu.' },
                { right: 'Pravo na prigovor', desc: 'Prigovorite obradi temeljnoj na legitimnom interesu.' },
              ].map(({ right, desc }, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-navy/5">
                  <p className="font-bold text-navy text-xs mb-1">{right}</p>
                  <p className="text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Zahtjev možete uputiti na <a href="mailto:privatnost@glados.hr" className="text-navy font-medium hover:text-yellow-dark transition-colors">privatnost@glados.hr</a>. Odgovaramo u roku od 30 dana.
            </p>
            <p className="mt-2">
              Ako smatrate da obrađujemo vaše podatke nezakonito, imate pravo uložiti prigovor <strong className="text-navy">Agenciji za zaštitu osobnih podataka (AZOP)</strong>: <a href="https://azop.hr" target="_blank" rel="noopener noreferrer" className="text-navy font-medium hover:text-yellow-dark transition-colors">azop.hr</a>.
            </p>
          </Section>

          <Section title="9. Sigurnost podataka">
            <p>
              Primjenjujemo tehničke i organizacijske mjere zaštite: enkripcija podataka u prijenosu (HTTPS/TLS), kontrola pristupa s ulogama, redovite sigurnosne provjere i minimizacija podataka. Niti jedan sustav nije 100% siguran — u slučaju povrede podataka koja bi mogla ugroziti vaša prava obavijestit ćemo vas i AZOP sukladno čl. 33–34 GDPR-a.
            </p>
          </Section>

          <Section title="10. Promjene ove politike">
            <p>
              Možemo povremeno ažurirati ovu Politiku privatnosti. Datum zadnjeg ažuriranja uvijek je vidljiv na vrhu stranice. Za značajne promjene obavijestit ćemo vas e-poštom ili obavijesti na platformi.
            </p>
          </Section>

          <Section title="11. Kontakt">
            <p>
              Za sva pitanja, zahtjeve ili pritužbe vezane uz obradu osobnih podataka:
            </p>
            <div className="bg-white rounded-2xl p-5 border border-navy/5 mt-3">
              <p className="font-bold text-navy text-sm mb-1">Gladoš d.o.o. — Zaštita podataka</p>
              <p>E-pošta: <a href="mailto:privatnost@glados.hr" className="text-navy font-medium hover:text-yellow-dark transition-colors">privatnost@glados.hr</a></p>
              <p className="mt-1">Lokacija: Vrbovec, Hrvatska</p>
            </div>
          </Section>

          <div className="pt-4 border-t border-navy/8 flex flex-col sm:flex-row gap-3 text-sm">
            <Link to="/uvjeti" className="text-navy font-semibold hover:text-yellow-dark transition-colors">
              Uvjeti korištenja →
            </Link>
            <Link to="/" className="text-navy/50 hover:text-navy transition-colors">
              ← Povratak na naslovnicu
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
