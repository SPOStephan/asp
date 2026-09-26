import { MapPin, Phone, Mail, Send, Share2 } from 'lucide-react';
import { CmsSection } from '../cms/CmsSection';
import { FOOTER_FALLBACK } from '../cms/cmsPages';
import { useHotel, useHotelContent, useSection } from '../context/HotelContext';
import { remapSiteHref } from '../lib/links';

interface FooterLink {
  label: string;
  href: string;
}

export function Footer() {
  const stored = useSection('footer');
  const hotel = useHotel();
  const { isPageEnabled } = useHotelContent();
  const data = { ...FOOTER_FALLBACK, ...stored };

  if (!hotel) return null;

  const exploreLinks: FooterLink[] = data.col_explore_links ?? [];
  const serviceLinks: FooterLink[] = data.col_service_links ?? [];

  return (
    <CmsSection sectionKey="footer" label="Footer">
    <footer className="footer" id="buchung">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <img src="/ASP_Logo-weiss.png" alt={hotel.name} />
            </div>
            <p className="footer__tagline" data-cms-focus="tagline" data-cms-path="tagline">{data.tagline}</p>
            <div className="footer__social">
              <a href="#" aria-label="Teilen"><Share2 size={20} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Nachricht"><Send size={20} strokeWidth={1.5} /></a>
            </div>
          </div>

          <nav className="footer__col" aria-label="Entdecken" data-cms-focus="explore">
            <h2 data-cms-path="col_explore_title">{data.col_explore_title}</h2>
            {exploreLinks.map((link, i) => (
              <a key={`explore-${i}`} href={remapSiteHref(link.href, link.label)} className="link-underline" data-cms-path={`col_explore_links.${i}.label`}>{link.label}</a>
            ))}
          </nav>

          <nav className="footer__col" aria-label="Service" data-cms-focus="service">
            <h2 data-cms-path="col_service_title">{data.col_service_title}</h2>
            {serviceLinks.map((link, i) => (
              <a key={`service-${i}`} href={link.href} className="link-underline" data-cms-path={`col_service_links.${i}.label`}>{link.label}</a>
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
            {isPageEnabled('impressum') ? <a href="/impressum" className="link-underline">Impressum</a> : null}
            {isPageEnabled('datenschutz') ? <a href="/datenschutz" className="link-underline">Datenschutz</a> : null}
            {isPageEnabled('agb') ? <a href="/agb" className="link-underline">AGB</a> : null}
          </div>
        </div>
      </div>
    </footer>
    </CmsSection>
  );
}
