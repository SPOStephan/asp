import { MapPin, Phone, Mail, Send, Share2 } from 'lucide-react';
import { useSection, useHotel } from '../context/HotelContext';
import { remapRoomsHref } from '../lib/rooms';

interface FooterLink {
  label: string;
  href: string;
}

export function Footer() {
  const data = useSection('footer');
  const hotel = useHotel();

  if (!data || !hotel) return null;

  const exploreLinks: FooterLink[] = data.col_explore_links ?? [];
  const serviceLinks: FooterLink[] = data.col_service_links ?? [];

  return (
    <footer className="footer" id="buchung">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <img src="/ASP_Logo-weiss.png" alt={hotel.name} />
            </div>
            <p className="footer__tagline">{data.tagline}</p>
            <div className="footer__social">
              <a href="#" aria-label="Teilen"><Share2 size={20} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Nachricht"><Send size={20} strokeWidth={1.5} /></a>
            </div>
          </div>

          <nav className="footer__col" aria-label="Entdecken">
            <h2>{data.col_explore_title}</h2>
            {exploreLinks.map((link, i) => (
              <a key={`explore-${i}`} href={remapRoomsHref(link.href, link.label)} className="link-underline">{link.label}</a>
            ))}
          </nav>

          <nav className="footer__col" aria-label="Service">
            <h2>{data.col_service_title}</h2>
            {serviceLinks.map((link, i) => (
              <a key={`service-${i}`} href={link.href} className="link-underline">{link.label}</a>
            ))}
          </nav>

          <div className="footer__col footer__contact">
            <h2>Kontakt</h2>
            <address>
              <p><MapPin size={16} strokeWidth={1.5} /> {hotel.address}</p>
              <p><Phone size={16} strokeWidth={1.5} /> <a href={`tel:${hotel.phone?.replace(/\s/g, '')}`}>{hotel.phone}</a></p>
              <p><Mail size={16} strokeWidth={1.5} /> <a href={`mailto:${hotel.email}`}>{hotel.email}</a></p>
            </address>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} {hotel.name}. Alle Rechte vorbehalten.</p>
          <div className="footer__legal">
            <a href="#" className="link-underline">Impressum</a>
            <a href="#" className="link-underline">Datenschutz</a>
            <a href="#" className="link-underline">AGB</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
