import { Link } from 'react-router-dom'
import { Navbar } from '../../components/customer/Navbar'
import { Footer } from '../../components/customer/Footer'
import { FileText } from 'lucide-react'

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

export function TermsPage() {
  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-navy text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="w-12 h-12 bg-yellow/15 rounded-2xl flex items-center justify-center mb-6">
            <FileText className="w-6 h-6 text-yellow" strokeWidth={1.5} />
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3" style={{ letterSpacing: '-0.03em' }}>
            Uvjeti korištenja
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
              Korištenjem platforme Gladoš pristajete na ove Uvjete korištenja. Molimo pročitajte ih pažljivo. Ako se ne slažete s uvjetima, nemojte koristiti platformu.
            </p>
          </div>

          <Section title="1. O usluzi">
            <p>
              Gladoš je platforma za dostavu hrane koja povezuje korisnike s partnerskim restoranima u Vrbovcu i okolici. Gladoš djeluje kao posrednik između korisnika i restorana — ne priprema hranu i ne zapošljava kurire kao radnike.
            </p>
            <p>
              Uslugu pruža <strong className="text-navy">Gladoš d.o.o.</strong>, Vrbovec, Hrvatska.
            </p>
          </Section>

          <Section title="2. Korisnici — uvjeti korištenja">
            <p>Kako biste koristili platformu, morate:</p>
            <ul className="list-none space-y-2">
              {[
                'Imati najmanje 16 godina.',
                'Navesti točne podatke pri registraciji i narudžbi.',
                'Ne zloupotrebljavati platformu (spam, lažne narudžbe, prijevara).',
                'Biti dostupni na navedenoj adresi u trenutku dostave.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Gladoš zadržava pravo suspendirati ili trajno blokirati račun u slučaju kršenja ovih uvjeta.
            </p>
          </Section>

          <Section title="3. Narudžbe i plaćanje">
            <p>
              Narudžbe se plaćaju gotovinom pri dostavi, osim ako nije navedeno drukčije. Cijena prikazana pri narudžbi konačna je i uključuje PDV.
            </p>
            <p>
              Minimalni iznos narudžbe određuje svaki restoran zasebno i vidljiv je na stranici restorana. Narudžba se smatra potvrđenom tek kada je restoran prihvati.
            </p>
            <p>
              Narudžbu možete otkazati bez naknade dok je restoran nije prihvatio (obično unutar 2–3 minute od slanja). Nakon prihvaćanja otkazivanje nije moguće bez suglasnosti restorana.
            </p>
          </Section>

          <Section title="4. Dostava">
            <p>
              Procijenjeno vrijeme dostave je orijentacijsko i može varirati ovisno o prometu, vremenskim uvjetima i opterećenosti restorana. Gladoš ne jamči dostavu u točno navedenom roku.
            </p>
            <p>
              Korisnik je odgovoran za navođenje točne adrese dostave. Gladoš i restoran ne snose odgovornost za neisporučenu narudžbu ako je adresa netočna ili ako korisnik nije dostupan u trenutku dostave.
            </p>
          </Section>

          <Section title="5. Reklamacije i povrat">
            <p>
              Ako ste primili pogrešnu ili neispravnu narudžbu, kontaktirajte nas unutar <strong className="text-navy">30 minuta od dostave</strong> na <a href="mailto:info@glados.hr" className="text-navy font-medium hover:text-yellow-dark transition-colors">info@glados.hr</a> ili putem telefona.
            </p>
            <p>
              Povrat novca moguć je u slučaju dokazane greške restorana ili kurira. Svaka reklamacija se rješava pojedinačno. Obrada reklamacije traje do 5 radnih dana.
            </p>
            <p>
              S obzirom na prirodu prehrambenih proizvoda, povrat fizičke robe nije moguć, ali Gladoš može odobriti kredit za buduće narudžbe ili povrat plaćenog iznosa.
            </p>
          </Section>

          <Section title="6. Odgovornost restorana">
            <p>
              Svaki partnerski restoran u potpunosti odgovara za kakvoću, sigurnost i deklaraciju hrane koju priprema, uključujući alergene. Gladoš ne provjerava sukladnost hrane s prehrambenim preferencijama korisnika.
            </p>
            <p>
              Informacije o alergenima dostupne su na stranici svakog restorana. Korisnici s alergijama trebaju kontaktirati restoran izravno prije narudžbe.
            </p>
          </Section>

          <Section title="7. Intelektualno vlasništvo">
            <p>
              Sav sadržaj platforme Gladoš (logotip, dizajn, tekst, kod) vlasništvo je Gladoš d.o.o. i zaštićen je autorskim pravom. Nije dozvoljeno kopiranje, reprodukcija ili distribucija bez pisane suglasnosti.
            </p>
            <p>
              Sadržaj koji restorani postavljaju (fotografije jela, opisi) ostaje vlasništvo restorana. Postavljanjem sadržaja na platformu restoran daje Gladošu neekskluzivnu licencu za prikaz tog sadržaja korisnicima.
            </p>
          </Section>

          <Section title="8. Ograničenje odgovornosti">
            <p>
              Gladoš ne odgovara za:
            </p>
            <ul className="list-none space-y-2">
              {[
                'Kakvoću ili sigurnost hrane koju su pripremili restorani.',
                'Kašnjenja uzrokovana vanjskim čimbenicima (promet, vremenske prilike, više sile).',
                'Izravnu ili neizravnu štetu nastalu korištenjem ili nemogućnošću korištenja platforme.',
                'Sadržaj trećih stranica na koje Gladoš može upućivati.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Ukupna odgovornost Gladoša prema jednom korisniku ograničena je na iznos konkretne narudžbe u spornom slučaju.
            </p>
          </Section>

          <Section title="9. Promjene uvjeta">
            <p>
              Gladoš može mijenjati ove Uvjete korištenja. O značajnim promjenama obavijestit ćemo registrirane korisnike e-poštom najmanje 14 dana unaprijed. Nastavkom korištenja usluge nakon isteka tog roka smatrat će se da ste prihvatili promjene.
            </p>
          </Section>

          <Section title="10. Mjerodavno pravo i nadležnost">
            <p>
              Ovi Uvjeti korištenja tumače se i primjenjuju u skladu s <strong className="text-navy">pravom Republike Hrvatske</strong>. Za sve sporove koji ne mogu biti riješeni sporazumno nadležan je sud u Vrbovcu, odnosno u Zagrebu.
            </p>
            <p>
              Potrošači u EU-u imaju pravo na izvansudsko rješavanje sporova putem platforme za online rješavanje sporova Europske komisije: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-navy font-medium hover:text-yellow-dark transition-colors">ec.europa.eu/consumers/odr</a>
            </p>
          </Section>

          <Section title="11. Kontakt">
            <div className="bg-white rounded-2xl p-5 border border-navy/5">
              <p className="font-bold text-navy text-sm mb-1">Gladoš d.o.o.</p>
              <p>E-pošta: <a href="mailto:info@glados.hr" className="text-navy font-medium hover:text-yellow-dark transition-colors">info@glados.hr</a></p>
              <p className="mt-1">Telefon: <a href="tel:+385977578091" className="text-navy font-medium hover:text-yellow-dark transition-colors">+385 97 757 8091</a></p>
              <p className="mt-1">Lokacija: Vrbovec, Hrvatska</p>
            </div>
          </Section>

          <div className="pt-4 border-t border-navy/8 flex flex-col sm:flex-row gap-3 text-sm">
            <Link to="/privatnost" className="text-navy font-semibold hover:text-yellow-dark transition-colors">
              Politika privatnosti →
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
