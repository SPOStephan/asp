import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { TextCta } from './TextCta';
import { useSection, useHotel } from '../context/HotelContext';

interface NavLink {
  label: string;
  href: string;
}

interface MenuGroup {
  title: string;
  links: NavLink[];
}

const FALLBACK_GROUPS: MenuGroup[] = [
  {
    title: 'Zimmer & Suiten',
    links: [
      { label: 'Zimmer & Suiten', href: '#suiten' },
      { label: 'Für jede Generation', href: '#suiten' },
      { label: 'Direkt buchen', href: '#direktbuchung' },
    ],
  },
  {
    title: 'Angebote',
    links: [
      { label: 'Aktuelle Angebote', href: '#angebote' },
      { label: 'Wellnessurlaub', href: '#angebote' },
      { label: 'Feiertage', href: '#angebote' },
    ],
  },
  {
    title: 'Erlebnisse',
    links: [
      { label: 'Hotel-Highlights', href: '#highlights' },
      { label: 'Entdecken', href: '#discover' },
      { label: 'Impressionen', href: '#impressionen' },
    ],
  },
  {
    title: 'Wellness',
    links: [
      { label: 'Wohlfühlen & Abschalten', href: '#wellness' },
      { label: 'Spa & Wellness', href: '/wellness' },
    ],
  },
  {
    title: 'Kulinarik',
    links: [
      { label: 'Restaurant & Bar', href: '#kulinarik' },
      { label: 'Strandstube', href: '#kulinarik' },
      { label: 'Grill & Dine', href: '#kulinarik' },
    ],
  },
  {
    title: 'Hotel',
    links: [
      { label: 'Das Resort', href: '#welcome' },
      { label: 'Anreise', href: '#anreise' },
      { label: 'FAQ', href: '/faqs' },
      { label: 'Newsletter', href: '#newsletter' },
    ],
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const data = useSection('navbar');
  const hotel = useHotel();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-menu-open', menuOpen);
    return () => document.body.classList.remove('nav-menu-open');
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
      window.scrollTo({ top: 0 });
    }
  };

  if (!data) return null;

  const navLinks: NavLink[] = data.links ?? [];
  const menuGroups: MenuGroup[] = data.menu_groups?.length ? data.menu_groups : FALLBACK_GROUPS;
  const lightBar = scrolled || menuOpen;

  return (
    <nav
      className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--menu-open' : ''}`}
      aria-label="Hauptnavigation"
    >
      <div className="navbar__inner">
        <div className="navbar__left">
          <TextCta
            className={lightBar ? '' : 'text-cta--on-dark'}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="hauptmenue"
          >
            {data.menu_label || 'Menü'}
          </TextCta>
          <div className="navbar__links" aria-hidden={!scrolled}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="navbar__link link-underline"
                href={link.href}
                tabIndex={scrolled ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <a
          href="/"
          className="navbar__logo"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img
            className="navbar__logo-image navbar__logo-image--white"
            src={data.logo_white}
            alt={hotel?.name || ''}
          />
          <img
            className="navbar__logo-image navbar__logo-image--normal"
            src={data.logo_normal}
            alt={hotel?.name || ''}
          />
        </a>

        <div className="navbar__right">
          <button className="navbar__lang">{data.lang_label}</button>
          <button className="navbar__cta" onClick={() => handleNavClick(data.cta_solid_href)}>
            {data.cta_text}
          </button>
          <a
            className="navbar__cta navbar__cta--solid"
            href={data.cta_solid_href}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(data.cta_solid_href);
            }}
          >
            {data.cta_solid_text}
          </a>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="navbar__backdrop"
            aria-label="Menü schließen"
            onClick={() => setMenuOpen(false)}
          />
          <div className="navbar__panel" id="hauptmenue">
            <button
              type="button"
              className="navbar__close"
              aria-label="Menü schließen"
              onClick={() => setMenuOpen(false)}
            >
              <X size={22} strokeWidth={1.4} />
            </button>
            <div className="navbar__panel-inner">
              {menuGroups.map((group) => (
                <div key={group.title} className="navbar__group">
                  <h2 className="navbar__group-title">{group.title}</h2>
                  <ul className="navbar__group-links">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}`}>
                        <a
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(link.href);
                          }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
